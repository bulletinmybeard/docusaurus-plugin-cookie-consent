import type { ConsentData, CookieConsentConfig } from '../plugin/types';

declare global {
    interface Window {
        __COOKIE_CONSENT_CONFIG__?: CookieConsentConfig;
        CookieConsent?: {
            reset: () => void;
            getStatus: () => boolean | null;
            updateConsent: (accepted: boolean) => void;
            getConsentData: () => ConsentData | null;
        };
    }

    interface WindowEventMap {
        cookieConsentChanged: CustomEvent<{ accepted: boolean; consentData: ConsentData }>;
    }
}

export type ConsentChangeListener = (accepted: boolean, consentData: ConsentData) => void;

class CookieConsentClient {
    private config: CookieConsentConfig | null = null;
    private listeners: Set<ConsentChangeListener> = new Set();

    constructor() {
        if (typeof window !== 'undefined') {
            this.config = window.__COOKIE_CONSENT_CONFIG__ || null;
            this.setupEventListeners();
        }
    }

    private setupEventListeners(): void {
        window.addEventListener('cookieConsentChanged', (event) => {
            const { accepted, consentData } = event.detail;
            this.notifyListeners(accepted, consentData);
        });
    }

    private notifyListeners(accepted: boolean, consentData: ConsentData): void {
        this.listeners.forEach((listener) => listener(accepted, consentData));
    }

    /**
     * Get the current consent status
     * @returns true if accepted, false if declined, null if no decision made
     */
    getConsentStatus(): boolean | null {
        try {
            if (typeof window === 'undefined' || !this.config) {
                return null;
            }

            const consent = localStorage.getItem(this.config.cookieName);
            if (!consent) {
                return null;
            }

            const consentData: ConsentData = JSON.parse(consent);
            const expiryTime =
                new Date(consentData.timestamp).getTime() +
                this.config.cookieExpiry * 24 * 60 * 60 * 1000;

            if (new Date().getTime() > expiryTime) {
                localStorage.removeItem(this.config.cookieName);
                return null;
            }

            return consentData.accepted;
        } catch (error) {
            console.error('[Cookie Consent] Error getting consent status:', error);
            // FAIL-SAFE: Return null (no consent) on any error
            return null;
        }
    }

    /**
     * Get the full consent data object
     */
    getConsentData(): ConsentData | null {
        try {
            if (typeof window === 'undefined' || !this.config) {
                return null;
            }

            const consent = localStorage.getItem(this.config.cookieName);
            if (!consent) {
                return null;
            }

            return JSON.parse(consent);
        } catch (error) {
            console.error('[Cookie Consent] Error getting consent data:', error);
            // FAIL-SAFE: Return null on any error
            return null;
        }
    }

    /**
     * Update consent status programmatically
     */
    updateConsent(accepted: boolean): void {
        if (typeof window !== 'undefined' && window.CookieConsent) {
            window.CookieConsent.updateConsent(accepted);
        }
    }

    /**
     * Reset consent and show the banner again
     */
    resetConsent(): void {
        if (typeof window !== 'undefined' && window.CookieConsent) {
            window.CookieConsent.reset();
        }
    }

    /**
     * Subscribe to consent changes
     * @returns Unsubscribe function
     */
    onConsentChange(listener: ConsentChangeListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Check if analytics scripts are allowed to load
     */
    canLoadAnalytics(): boolean {
        return this.getConsentStatus() === true;
    }

    /**
     * Get the cookie name being used for storage
     */
    getCookieName(): string | null {
        return this.config?.cookieName || null;
    }

    /**
     * Get the plugin configuration
     */
    getConfig(): CookieConsentConfig | null {
        return this.config;
    }
}

// Create singleton instance
const cookieConsent = new CookieConsentClient();

// Export individual functions for easier use
export const getConsentStatus = (): boolean | null => cookieConsent.getConsentStatus();
export const getConsentData = (): ConsentData | null => cookieConsent.getConsentData();
export const updateConsent = (accepted: boolean): void => cookieConsent.updateConsent(accepted);
export const resetConsent = (): void => cookieConsent.resetConsent();
export const onConsentChange = (listener: ConsentChangeListener): (() => void) =>
    cookieConsent.onConsentChange(listener);
export const canLoadAnalytics = (): boolean => cookieConsent.canLoadAnalytics();
export const getCookieName = (): string | null => cookieConsent.getCookieName();
export const getConfig = (): CookieConsentConfig | null => cookieConsent.getConfig();

// Export the class for advanced use cases
export { CookieConsentClient };

// Export types
export type { ConsentData, CookieConsentConfig } from '../plugin/types';
