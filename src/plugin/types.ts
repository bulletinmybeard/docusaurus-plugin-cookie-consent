export interface CookieConsentTranslations {
    // Modal texts
    title: string;
    description: string;
    consentHelp: string;

    // Status messages
    analyticsEnabled: string;
    analyticsDisabled: string;

    // Header status indicators
    trackingEnabled?: string;
    trackingDisabled?: string;
    trackingPartial?: string;

    // No providers messages
    noProvidersInfo?: string;
    noTrackingInfo?: string;

    // Buttons
    acceptButton: string;
    declineButton: string;
    closeButtonAriaLabel: string;

    // Links
    privacyPolicyLinkText: string;
    cookieSettingsText: string;

    // Provider selection
    providerSelectionTitle?: string;
    acceptAllButton?: string;
    rejectAllButton?: string;
    saveMyChoicesButton?: string;
    closeButton?: string;
    selectAll?: string;
    choicesSaved?: string;
    choicesCanceled?: string;

    // Default provider names and descriptions
    providers?: {
        [key: string]: {
            name: string;
            description: string;
        };
    };
}

export interface Translations {
    banner: {
        title: string;
        description: string;
        acceptButton: string;
        declineButton: string;
        settingsButton: string;
    };
    settings: {
        title: string;
        description: string;
        privacyPolicyLink: string;
        resetButton: string;
    };
}

// Provider i18n configuration
export interface ProviderI18n {
    name: string;
    description: string;
}

// Provider Types for tracking/cookie services
export interface BaseProvider {
    type: 'google' | 'gtm' | 'hotjar' | 'custom';
    enabled?: boolean; // Allow disabling provider in config (default: true)
    /**
     * Localized names and descriptions for the provider
     * @example
     * i18n: {
     *   en: { name: 'Google Analytics', description: 'Helps us understand usage' },
     *   de: { name: 'Google Analytics', description: 'Hilft uns, die Nutzung zu verstehen' }
     * }
     */
    i18n?: Record<string, ProviderI18n>;
    required?: boolean; // If true, cannot be disabled by user (default: false)
    debug?: boolean; // Enable debug mode for this provider
    options?: Record<string, unknown>;
}

export interface GoogleAnalyticsProvider extends BaseProvider {
    type: 'google';
    id: string; // Google Analytics Measurement ID (G-XXXXXXXXXX)
    options?: {
        anonymizeIp?: boolean;
        cookieFlags?: string;
        [key: string]: unknown;
    };
}

export interface GTMProvider extends BaseProvider {
    type: 'gtm';
    id: string; // Google Tag Manager Container ID (GTM-XXXXXXX)
    options?: {
        dataLayerName?: string;
        [key: string]: unknown;
    };
}

export interface HotjarProvider extends BaseProvider {
    type: 'hotjar';
    id: number; // Hotjar Site ID
    options?: {
        version?: number; // Hotjar snippet version (default: 6)
        [key: string]: unknown;
    };
}

export interface CustomProvider extends BaseProvider {
    type: 'custom';
    src?: string;
    inlineScript?: string;
    loadMethod?: 'script-tag' | 'fetch' | 'inline';
    options?: {
        async?: boolean;
        defer?: boolean;
        crossorigin?: 'anonymous' | 'use-credentials';
        integrity?: string;
        nonce?: string;
        referrerPolicy?: ReferrerPolicy;
        fetchOptions?: {
            headers?: Record<string, string>;
            credentials?: RequestCredentials;
            mode?: RequestMode;
            cache?: RequestCache;
        };
        onBeforeLoad?: () => void | Promise<void>;
        onLoad?: () => void;
        onError?: (error: Error) => void;
        initCode?: string | (() => void);
        retry?: {
            attempts?: number;
            delay?: number;
            backoff?: boolean;
        };
        timeout?: number;
        cookies?: {
            sameSite?: 'strict' | 'lax' | 'none';
            secure?: boolean;
            domain?: string;
        };
        attributes?: Record<string, string>; // Custom attributes (backward compatible)
        waitForGlobals?: string[]; // Wait for specific global variables before considering loaded
        placement?: 'head' | 'body' | 'body-end'; // Position in DOM
        [key: string]: unknown; // Legacy support - any other options
    };
}

export type Provider = GoogleAnalyticsProvider | GTMProvider | HotjarProvider | CustomProvider;

export interface PrivacyPolicyConfig {
    // Configuration for privacy policy generation
    // (currently empty but can be extended in the future)
    [key: string]: unknown;
}

export interface CookieConsentPluginOptions {
    // Docusaurus plugin id
    id?: string;
    // Privacy Policy Configuration
    privacyPolicy?: {
        url?: string;
        disableDemo?: boolean; // Set to true to disable the privacy policy demo page
    };

    // Cookie Configuration
    cookieConfig?: {
        name?: string;
        expiry?: number; // days
    };

    // Provider Configuration
    providers?: Provider[];

    // UI/UX Configuration
    theme?: {
        position?: 'center' | 'bottom' | 'top';
        primaryColor?: string;
        darkMode?: 'auto' | 'light' | 'dark';
    };

    // Features
    features?: {
        sillyDeclineButton?: boolean;
    };

    // UI Configuration
    cookieSettingsSelector?: string; // CSS selector for cookie settings link (can be placed anywhere)

    // i18n Configuration (combines locale settings and text customization)
    i18n?: {
        defaultLocale?: string;
        fallbackLocale?: string;
        forceLocale?: string; // Force a specific locale regardless of Docusaurus i18n
        // Custom text translations per locale
        texts?:
            | {
                  [locale: string]: Partial<CookieConsentTranslations>;
              }
            | Partial<CookieConsentTranslations>;
    };

    // Experimental Features
    /**
     * Enable experimental features that may change or be removed in future versions.
     * Currently enables: Hotjar provider
     * @default false
     */
    enableExperimental?: boolean;

    // Debug Features
    /**
     * Enable the debug panel UI that shows analytics status and allows testing.
     * This is independent of provider-specific debug flags.
     * @default false
     */
    enableDebugPanel?: boolean;
}

export interface ConsentData {
    accepted: boolean;
    timestamp: string;
    version: string;
    providers?: {
        // Granular consent per provider
        [providerType: string]: boolean;
    };
}

export interface CookieConsentConfig {
    cookieName: string;
    cookieExpiry: number;
    position: 'bottom' | 'top' | 'center';
    privacyPolicyUrl: string;
    providers: Provider[];
    texts: CookieConsentTranslations;
    features: {
        sillyDeclineButton: boolean;
    };
    enableDebugPanel: boolean;
    cookieSettingsSelector: string;
}
