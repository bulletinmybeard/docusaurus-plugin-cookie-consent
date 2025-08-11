import type { Plugin, LoadContext, HtmlTagObject } from '@docusaurus/types';
import type {
    CookieConsentPluginOptions,
    Provider,
    CustomProvider,
    GoogleAnalyticsProvider,
    GTMProvider,
    HotjarProvider
} from './types';
import { mergeWithDefaults } from '../utils/configDefaults';
import { logWarn, logInfo, logDebug } from '../utils/logger';
import { validateProvider, sanitizeHtml } from '../utils/validation';
import path from 'path';
import fs from 'fs';
import * as Handlebars from 'handlebars';

// Store __dirname if available (will be defined in CommonJS context after compilation)
const PLUGIN_DIRNAME = typeof __dirname !== 'undefined' ? __dirname : undefined;

// Define which providers are experimental
const EXPERIMENTAL_PROVIDERS = ['hotjar'];

// Helper function to get the plugin directory reliably
function getPluginDir(): string {
    // First, try using the stored __dirname if it's available
    if (PLUGIN_DIRNAME) {
        // When running from dist/plugin/index.js, go up two levels to get package root
        return path.resolve(PLUGIN_DIRNAME, '../..');
    }

    // Try multiple methods to find the plugin directory
    const attempts = [
        // Method 1: Try to resolve the package.json
        () => {
            const packagePath = require.resolve('docusaurus-plugin-cookie-consent/package.json');
            return path.dirname(packagePath);
        },
        // Method 2: Try to find via the current module's filename
        () => {
            if (module && module.filename) {
                // Go up from dist/plugin/index.js to package root
                return path.resolve(path.dirname(module.filename), '../..');
            }
            throw new Error('No module.filename');
        },
        // Method 3: Try to resolve the main export
        () => {
            const mainPath = require.resolve('docusaurus-plugin-cookie-consent');
            // Go up from dist/plugin/index.js to package root
            return path.resolve(path.dirname(mainPath), '../..');
        }
    ];

    for (const attempt of attempts) {
        try {
            const result = attempt();
            if (result) {
                return result;
            }
        } catch {
            // Try next method
        }
    }

    // Final fallback - this should never happen ... (☞ ﾟヮﾟ)☞ pew pew
    console.error('[Cookie Consent Plugin] Could not determine plugin directory!');
    throw new Error('Could not determine plugin directory - plugin installation may be corrupted');
}

function validateOptions(options: CookieConsentPluginOptions = {}): CookieConsentPluginOptions {
    const validatedOptions = { ...options };

    // Log experimental features status
    if (options.enableExperimental) {
        logWarn(
            '⚠️  Experimental features enabled. These may change or be removed in future versions.',
            {
                context: 'Configuration',
                details: {
                    enableExperimental: true,
                    experimentalProviders: EXPERIMENTAL_PROVIDERS
                }
            }
        );
    }

    // Basic validation
    if (options.cookieConfig?.expiry !== undefined && options.cookieConfig.expiry < 1) {
        logWarn('Cookie expiry must be at least 1 day, using default value', {
            context: 'Configuration',
            details: { provided: options.cookieConfig.expiry, default: 365 }
        });
        // Reset to default
        if (validatedOptions.cookieConfig) {
            delete validatedOptions.cookieConfig.expiry;
        }
    }

    // Provider validation
    if (options.providers && Array.isArray(options.providers)) {
        if (options.providers.length === 0) {
            logInfo('No providers configured', { context: 'Configuration' });
        }

        const validProviders: Provider[] = [];
        const skippedExperimental: string[] = [];

        options.providers.forEach((provider: Provider, index) => {
            // Check if provider is experimental and experimental features are disabled
            if (EXPERIMENTAL_PROVIDERS.includes(provider.type) && !options.enableExperimental) {
                skippedExperimental.push(provider.type);
                logInfo(
                    `Skipping experimental provider: ${provider.type}. Enable with 'enableExperimental: true'`,
                    {
                        context: 'Configuration',
                        details: {
                            provider: provider.type,
                            index,
                            hint: 'This provider is experimental and may change in future versions'
                        }
                    }
                );
                return; // Skip this provider
            }

            const validationError = validateProvider(provider, index);

            if (validationError) {
                logWarn(validationError, {
                    context: 'Configuration',
                    details: { provider, index }
                });
            } else {
                // Sanitize i18n fields if present
                if (provider.i18n) {
                    Object.keys(provider.i18n).forEach((locale) => {
                        const localeData = provider.i18n?.[locale];
                        if (localeData?.name) {
                            localeData.name = sanitizeHtml(localeData.name);
                        }
                        if (localeData?.description) {
                            localeData.description = sanitizeHtml(localeData.description);
                        }
                    });
                }

                validProviders.push(provider);

                logDebug(`${provider.type} provider validated and configured`, {
                    context: 'Configuration',
                    details: {
                        type: provider.type,
                        id:
                            provider.type === 'custom'
                                ? (provider as CustomProvider).src
                                : (
                                      provider as
                                          | GoogleAnalyticsProvider
                                          | GTMProvider
                                          | HotjarProvider
                                  ).id,
                        debug: provider.debug || false,
                        experimental: EXPERIMENTAL_PROVIDERS.includes(provider.type)
                    }
                });
            }
        });

        // Update options with only valid providers
        validatedOptions.providers = validProviders;

        if (validProviders.length === 0 && options.providers.length > 0) {
            logWarn('All providers were invalid and have been removed', {
                context: 'Configuration',
                details: {
                    providedCount: options.providers.length,
                    validCount: 0
                }
            });
        } else if (validProviders.length < options.providers.length) {
            logInfo(`Validated ${validProviders.length} of ${options.providers.length} providers`, {
                context: 'Configuration'
            });
        }

        // Log summary of skipped experimental providers
        if (skippedExperimental.length > 0 && !options.enableExperimental) {
            logInfo(
                `Skipped ${skippedExperimental.length} experimental provider(s): ${skippedExperimental.join(', ')}`,
                {
                    context: 'Configuration',
                    details: {
                        skipped: skippedExperimental,
                        solution:
                            "Add 'enableExperimental: true' to plugin configuration to enable these providers"
                    }
                }
            );
        }
    }

    return validatedOptions;
}

function cookieConsentPlugin(
    _context: LoadContext,
    options: CookieConsentPluginOptions = {}
): Plugin {
    // Ensure options has an id for Docusaurus compatibility
    const optionsWithId = {
        ...options,
        id: options.id || 'default'
    };

    const validatedOptions = validateOptions(optionsWithId);

    const config = mergeWithDefaults(validatedOptions);

    // Get plugin root directory
    const pluginRootDir = getPluginDir();

    return {
        name: 'docusaurus-plugin-cookie-consent',

        getThemePath() {
            return path.resolve(pluginRootDir, 'dist/theme');
        },

        getClientModules() {
            return [path.resolve(pluginRootDir, 'dist/theme/CookieConsentLoader')];
        },

        injectHtmlTags() {
            const headTags: (string | HtmlTagObject)[] = [];
            const preBodyTags: (string | HtmlTagObject)[] = [];
            const postBodyTags: (string | HtmlTagObject)[] = [];

            // Inject configuration as global variable with proper escaping
            const safeConfig = {
                ...config,
                // Pass i18n configuration
                i18n: options.i18n || {}
            };

            // Create a script element that safely sets the configuration
            headTags.push({
                tagName: 'script',
                innerHTML: `
          (function() {
            try {
              window.__COOKIE_CONSENT_CONFIG__ = ${JSON.stringify(safeConfig).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')};
            } catch (e) {
              console.error('[Cookie Consent] Failed to initialize configuration:', e);
              // Set a safe default to prevent tracking without consent
              window.__COOKIE_CONSENT_CONFIG__ = { providers: [], cookieName: 'docusaurus_cookie_consent', cookieExpiry: 365 };
            }
          })();
        `
            } as HtmlTagObject);

            return { headTags, preBodyTags, postBodyTags };
        },

        async contentLoaded({ actions }) {
            const { createData, addRoute } = actions;

            // Create data file with plugin configuration
            await createData('cookie-consent-config.json', JSON.stringify(config));

            // Generate privacy policy unless explicitly disabled
            const shouldGeneratePrivacyPolicy = options.privacyPolicy?.disableDemo !== true;

            if (shouldGeneratePrivacyPolicy) {
                // Always use English template
                const templatePath = path.join(
                    pluginRootDir,
                    'dist/templates/privacy-policy',
                    'en.mdx.hbs'
                );

                // Read and process template
                const templateContent = fs.readFileSync(templatePath, 'utf-8');
                const template = Handlebars.compile(templateContent);

                // Template variables with proper sanitization
                const safeTemplateVars: Record<string, unknown> = {};

                // Register Handlebars SafeString helper for raw HTML when needed
                Handlebars.registerHelper('raw', function (value: string) {
                    return new Handlebars.SafeString(value);
                });

                const privacyPolicyContent = template(safeTemplateVars);

                // Create a JavaScript module that exports the content
                const moduleContent = `
export default ${JSON.stringify(privacyPolicyContent)};
`;

                const contentModulePath = await createData(
                    'privacy-policy-content.js',
                    moduleContent
                );

                addRoute({
                    path: config.privacyPolicyUrl,
                    component: '@theme/PrivacyPolicy',
                    exact: true,
                    modules: {
                        content: contentModulePath
                    }
                });
            }
        },

        configureWebpack() {
            return {
                resolve: {
                    alias: {
                        ['@docusaurus-plugin-cookie-consent/config']: path.resolve(
                            pluginRootDir,
                            'dist/utils/configDefaults'
                        ),
                        ['docusaurus-plugin-cookie-consent/client']: path.resolve(
                            pluginRootDir,
                            'dist/client/index'
                        )
                    }
                }
            };
        }
    };
}

// Create a wrapper that ensures options.id is always present
const pluginWithValidation = (
    context: LoadContext,
    options: CookieConsentPluginOptions = {}
): Plugin => {
    return cookieConsentPlugin(context, options);
};

// Export validateOptions for Docusaurus to properly initialize the plugin
// This is called by Docusaurus before the plugin is instantiated
pluginWithValidation.validateOptions = ({ options }: { options: CookieConsentPluginOptions }) => {
    // Return validated options with a default id if not provided
    const validatedOptions = validateOptions(options);
    return {
        ...validatedOptions,
        id: validatedOptions.id || 'default' // Ensure there's always an id
    };
};

// Export in the format Docusaurus expects
module.exports = pluginWithValidation;
module.exports.default = pluginWithValidation;

export type { CookieConsentPluginOptions };
