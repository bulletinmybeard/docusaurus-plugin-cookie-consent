import type { Provider } from '../plugin/types';
import { logWarn } from './logger';

// Strict patterns for validation
const PATTERNS = {
    // Google Analytics ID:
    // GA4: G-XXXXXXXXXX (10-12 alphanumeric chars)
    // UA: UA-XXXXXXXXX-X (4-9 digits, 1-4 digits, optional 1-4 digits)
    GOOGLE_ANALYTICS_ID: /^(G-[A-Z0-9]{10,12}|UA-\d{4,9}-\d{1,4}(-\d{1,4})?)$/,

    // GTM Container ID: GTM-XXXXXXX (7-9 alphanumeric chars)
    GTM_ID: /^GTM-[A-Z0-9]{7,9}$/,

    // Hotjar Site ID: numeric only (typically 6-8 digits)
    HOTJAR_ID: /^\d{6,8}$/,

    // Safe data layer name: alphanumeric and underscores only
    DATA_LAYER_NAME: /^[a-zA-Z_][a-zA-Z0-9_]*$/,

    // HTTPS URLs only
    HTTPS_URL: /^https:\/\/.+/
};

/**
 * Validates a Google Analytics ID
 */
export function validateGoogleAnalyticsId(id: string): boolean {
    if (!id || typeof id !== 'string') {
        return false;
    }
    return PATTERNS.GOOGLE_ANALYTICS_ID.test(id.trim());
}

/**
 * Validates a GTM Container ID
 */
export function validateGTMId(id: string): boolean {
    if (!id || typeof id !== 'string') {
        return false;
    }
    return PATTERNS.GTM_ID.test(id.trim());
}

/**
 * Validates a Hotjar Site ID
 */
export function validateHotjarId(id: number): boolean {
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
        return false;
    }
    return PATTERNS.HOTJAR_ID.test(id.toString());
}

/**
 * Validates a custom script URL (must be HTTPS)
 */
export function validateScriptUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const urlObj = new URL(url);
        // Only allow HTTPS protocol
        if (urlObj.protocol !== 'https:') {
            logWarn('Script URL must use HTTPS protocol', {
                context: 'Validation',
                details: { url, protocol: urlObj.protocol }
            });
            return false;
        }

        // Prevent localhost and private IPs in production
        if (process.env.NODE_ENV === 'production') {
            const hostname = urlObj.hostname.toLowerCase();
            if (
                hostname === 'localhost' ||
                hostname === '127.0.0.1' ||
                hostname.startsWith('192.168.') ||
                hostname.startsWith('10.') ||
                hostname.startsWith('172.')
            ) {
                logWarn('Local/private URLs not allowed in production', {
                    context: 'Validation',
                    details: { url, hostname }
                });
                return false;
            }
        }

        return true;
    } catch (e) {
        logWarn('Invalid URL format', {
            context: 'Validation',
            details: { url, error: e instanceof Error ? e.message : 'Unknown error' }
        });
        return false;
    }
}

/**
 * Validates a data layer name
 */
export function validateDataLayerName(name: string): boolean {
    if (!name || typeof name !== 'string') {
        return false;
    }
    return PATTERNS.DATA_LAYER_NAME.test(name);
}

/**
 * Sanitizes a string for safe HTML output
 */
export function sanitizeHtml(input: string): string {
    if (typeof input !== 'string') {
        return '';
    }

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validates a provider configuration
 */
export function validateProvider(provider: Provider, index: number): string | null {
    if (!provider || typeof provider !== 'object') {
        return `Provider at index ${index} is not a valid object`;
    }

    switch (provider.type) {
        case 'google':
            if (!validateGoogleAnalyticsId(provider.id)) {
                return `Invalid Google Analytics ID format at index ${index}. Expected format: G-XXXXXXXXXX or UA-XXXXXXXXX-X`;
            }
            break;

        case 'gtm':
            if (!validateGTMId(provider.id)) {
                return `Invalid GTM Container ID format at index ${index}. Expected format: GTM-XXXXXXX`;
            }
            if (
                provider.options?.dataLayerName &&
                !validateDataLayerName(provider.options.dataLayerName)
            ) {
                return `Invalid dataLayer name at index ${index}. Only alphanumeric characters and underscores allowed`;
            }
            break;

        case 'hotjar':
            if (!validateHotjarId(provider.id)) {
                return `Invalid Hotjar Site ID at index ${index}. Must be a positive integer`;
            }
            break;

        case 'custom':
            if (!provider.src && !provider.inlineScript) {
                return `Custom provider at index ${index} requires either 'src' or 'inlineScript'`;
            }
            if (provider.src && !validateScriptUrl(provider.src)) {
                return `Invalid custom script URL at index ${index}. Must be a valid HTTPS URL`;
            }
            break;

        default:
            return `Unknown provider type "${(provider as Record<string, unknown>).type}" at index ${index}`;
    }

    return null; // No errors
}

/**
 * Escapes a string for safe inclusion in a regular expression
 */
export function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a timeout promise that rejects after specified milliseconds
 */
export function createTimeout(ms: number, message: string = 'Operation timed out'): Promise<never> {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), ms);
    });
}
