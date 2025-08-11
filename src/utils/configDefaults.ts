import type { CookieConsentPluginOptions, CookieConsentConfig } from '../plugin/types';
import { en } from '../translations/en';

export const defaultPluginOptions: Required<CookieConsentPluginOptions> = {
    id: 'default',
    privacyPolicy: {
        url: '/privacy-policy-demo',
        disableDemo: false
    },
    cookieConfig: {
        name: 'docusaurus_cookie_consent',
        expiry: 365
    },
    providers: [],
    theme: {
        position: 'center',
        primaryColor: undefined,
        darkMode: 'auto'
    },
    features: {
        sillyDeclineButton: false
    },
    cookieSettingsSelector: '.footer__link-item--cookie-settings',
    i18n: {
        defaultLocale: 'en',
        fallbackLocale: 'en'
    },
    enableExperimental: false,
    enableDebugPanel: false
};

export function mergeWithDefaults(options: CookieConsentPluginOptions = {}): CookieConsentConfig {
    const merged = {
        ...defaultPluginOptions,
        ...options,
        privacyPolicy: {
            ...defaultPluginOptions.privacyPolicy,
            ...options.privacyPolicy
        },
        cookieConfig: {
            ...defaultPluginOptions.cookieConfig,
            ...options.cookieConfig
        },
        providers: options.providers || defaultPluginOptions.providers,
        theme: {
            ...defaultPluginOptions.theme,
            ...options.theme
        },
        features: {
            ...defaultPluginOptions.features,
            ...options.features,
            // Support both old and new names for backward compatibility
            sillyDeclineButton:
                options.features?.sillyDeclineButton ??
                defaultPluginOptions.features.sillyDeclineButton
        },
        i18n: {
            ...defaultPluginOptions.i18n,
            ...options.i18n
        }
    };

    // Convert to CookieConsentConfig format
    return {
        cookieName: (merged.cookieConfig.name ?? defaultPluginOptions.cookieConfig.name) as string,
        cookieExpiry: (merged.cookieConfig.expiry ??
            defaultPluginOptions.cookieConfig.expiry) as number,
        position: (merged.theme.position ?? defaultPluginOptions.theme.position) as
            | 'center'
            | 'bottom'
            | 'top',
        privacyPolicyUrl: (merged.privacyPolicy.url ??
            defaultPluginOptions.privacyPolicy.url) as string,
        providers: merged.providers,
        texts: en, // Will be replaced by translation hook
        features: {
            sillyDeclineButton: (merged.features.sillyDeclineButton ??
                defaultPluginOptions.features.sillyDeclineButton) as boolean
        },
        enableDebugPanel: (options.enableDebugPanel ??
            defaultPluginOptions.enableDebugPanel) as boolean,
        cookieSettingsSelector: (options.cookieSettingsSelector ??
            defaultPluginOptions.cookieSettingsSelector) as string
    };
}
