import { useContext, createContext } from 'react';
import type { CookieConsentConfig } from '../plugin/types';
import { mergeWithDefaults } from '../utils/configDefaults';
import { logWarn } from '../utils/logger';

// Create context for plugin configuration
export const PluginConfigContext = createContext<CookieConsentConfig | null>(null);

export function usePluginConfig(): CookieConsentConfig {
    const config = useContext(PluginConfigContext);

    if (!config) {
        // Fallback to defaults if context is not provided
        logWarn('Plugin config context not found, using defaults', {
            context: 'Configuration',
            details: {
                hint: 'This may occur during testing or if the plugin is not properly initialized'
            }
        });
        return mergeWithDefaults({});
    }

    return config;
}
