import type { Provider } from '../plugin/types';

export interface AnalyticsStatus {
    provider: Provider;
    loaded: boolean;
    details: Record<string, unknown>;
    errors?: string[];
}

export function checkAnalyticsStatus(providers: Provider[]): AnalyticsStatus[] {
    const statuses: AnalyticsStatus[] = [];

    providers.forEach((provider) => {
        const status: AnalyticsStatus = {
            provider,
            loaded: false,
            details: {}
        };

        switch (provider.type) {
            case 'google':
                status.loaded = typeof window !== 'undefined' && !!window.gtag;
                status.details = {
                    gtag: typeof window !== 'undefined' && !!window.gtag,
                    dataLayer: typeof window !== 'undefined' && !!window.dataLayer,
                    dataLayerLength:
                        typeof window !== 'undefined' ? window.dataLayer?.length || 0 : 0
                };
                break;

            case 'gtm':
                status.loaded = typeof window !== 'undefined' && !!window.dataLayer;
                status.details = {
                    dataLayer: typeof window !== 'undefined' && !!window.dataLayer,
                    dataLayerLength:
                        typeof window !== 'undefined' ? window.dataLayer?.length || 0 : 0
                };
                break;

            case 'hotjar':
                if (typeof window !== 'undefined') {
                    status.loaded = !!window.hj;
                    status.details = {
                        hj: !!window.hj,
                        _hjSettings: !!window._hjSettings,
                        isHTTPS: window.location.protocol === 'https:'
                    };

                    if (window.location.protocol !== 'https:') {
                        status.errors = ['Hotjar requires HTTPS to function properly'];
                    }
                }
                break;

            case 'custom':
                // For custom providers, we can't easily check if they're loaded
                status.details = {
                    src: provider.src
                };
                break;
        }

        statuses.push(status);
    });

    return statuses;
}

export function sendTestEvent(providerType: string): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        switch (providerType) {
            case 'google':
                if (window.gtag) {
                    window.gtag('event', 'cookie_consent_test', {
                        event_category: 'debug',
                        event_label: 'test_event',
                        timestamp: Date.now()
                    });
                    return true;
                }
                break;

            case 'gtm':
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'cookie_consent_test',
                        event_category: 'debug',
                        event_label: 'test_event',
                        timestamp: Date.now()
                    });
                    return true;
                }
                break;

            case 'hotjar':
                if (window.hj) {
                    window.hj('event', 'cookie_consent_test');
                    return true;
                }
                break;
        }
    } catch (error) {
        console.error(`Failed to send test event for ${providerType}:`, error);
    }

    return false;
}
