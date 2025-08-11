// Global type augmentations for window object

interface HotjarSettings {
    hjid: number;
    hjsv: number;
}

export interface HotjarObject {
    q?: unknown[];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _hjSettings?: HotjarSettings;
}

interface CookieConsentGlobal {
    accept: (providerChoices?: Record<string, boolean>) => void;
    decline: () => void;
    reset: () => void;
    hasConsent: () => boolean | null;
    canLoadproviders: () => boolean;
    getProviders: () => Array<{ type: string; id?: string | number; src?: string }>;
    updateProviderConsent: (providerId: string, accepted: boolean) => void;
}

declare global {
    interface Window {
        // Google Analytics
        gtag?: (...args: unknown[]) => void;
        dataLayer?: unknown[];

        // Google Tag Manager
        // eslint-disable-next-line @typescript-eslint/naming-convention
        google_tag_manager?: Record<string, unknown>;

        // Hotjar
        hj?: (...args: unknown[]) => void;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _hjSettings?: HotjarSettings;

        // Cookie Consent
        CookieConsent?: CookieConsentGlobal;
        __COOKIE_CONSENT_CONFIG__?: {
            cookieName: string;
            providers?: Array<{
                type: string;
                id?: string | number;
                src?: string;
                enabled?: boolean;
            }>;
        };

        // Plugin configuration
        __docusaurus?: {
            plugin?: {
                cookieConsent?: {
                    config?: Record<string, unknown>;
                };
            };
        };
    }
}

export {};
