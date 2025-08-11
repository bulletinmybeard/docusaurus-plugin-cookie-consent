import type { CookieConsentTranslations } from '../plugin/types';
import { builtInTranslations } from '../translations';
import { useLocale } from './useLocale';

export function useTranslations(): CookieConsentTranslations {
    const locale = useLocale();

    // Try to get plugin config from multiple sources
    let pluginConfig: {
        i18n?: {
            texts?:
                | Record<string, Partial<CookieConsentTranslations>>
                | Partial<CookieConsentTranslations>;
        };
    } = {};

    try {
        // First, check if config is available in window.__COOKIE_CONSENT_CONFIG__
        // This is where the plugin injects the configuration
        if (typeof window !== 'undefined') {
            const windowConfig = (
                window as unknown as {
                    __COOKIE_CONSENT_CONFIG__?: {
                        i18n?: {
                            texts?:
                                | Record<string, Partial<CookieConsentTranslations>>
                                | Partial<CookieConsentTranslations>;
                        };
                    };
                }
            ).__COOKIE_CONSENT_CONFIG__;

            if (windowConfig?.i18n) {
                pluginConfig = { i18n: windowConfig.i18n };
            }
            // Fallback: Try to get from Docusaurus context
            else if ((window as unknown as { __docusaurus?: unknown }).__docusaurus) {
                const context = (
                    window as unknown as {
                        __docusaurus: { globalData: { siteConfig?: { plugins?: unknown[] } } };
                    }
                ).__docusaurus.globalData;
                const plugins = context?.siteConfig?.plugins || [];
                const cookieConsentPlugin = plugins.find(
                    (p: unknown) => Array.isArray(p) && p[0] === 'docusaurus-plugin-cookie-consent'
                ) as [string, Record<string, unknown>] | undefined;
                if (cookieConsentPlugin && cookieConsentPlugin[1]) {
                    pluginConfig = cookieConsentPlugin[1] as {
                        i18n?: {
                            texts?:
                                | Record<string, Partial<CookieConsentTranslations>>
                                | Partial<CookieConsentTranslations>;
                        };
                    };
                }
            }
        }
    } catch {
        // Fallback to defaults
    }

    // Get base translations for current locale (case-insensitive)
    const normalizedLocale = locale.toLowerCase().split('-')[0]; // Handle both 'de' and 'de-DE'
    const baseTranslations = builtInTranslations[normalizedLocale] || builtInTranslations.en;

    // Check for custom translations
    let customTranslations: Partial<CookieConsentTranslations> = {};

    if (pluginConfig.i18n?.texts) {
        if (typeof pluginConfig.i18n.texts === 'object' && 'title' in pluginConfig.i18n.texts) {
            // Direct translations object (not locale-specific)
            customTranslations = pluginConfig.i18n.texts as Partial<CookieConsentTranslations>;
        } else if (
            typeof pluginConfig.i18n.texts === 'object' &&
            (pluginConfig.i18n.texts as Record<string, unknown>)[normalizedLocale]
        ) {
            // Locale-specific translations
            customTranslations = (
                pluginConfig.i18n.texts as Record<string, Partial<CookieConsentTranslations>>
            )[normalizedLocale];
        }
    }

    // Merge base with custom translations
    return {
        ...baseTranslations,
        ...customTranslations
    };
}
