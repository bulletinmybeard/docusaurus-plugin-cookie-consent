import React from 'react';
import { createRoot } from 'react-dom/client';
import CookieConsent from '../components/CookieConsent';
import CookieSettingsFooter from '../components/CookieSettingsFooter';
import CookieDebugWidget from '../components/CookieDebugWidget';
import { PluginConfigContext } from '../hooks/usePluginConfig';
import { logDebug, logWarn, logInfo } from '../utils/logger';
import type { CookieConsentConfig } from '../plugin/types';

// This module ensures the cookie consent is loaded
logDebug('CookieConsentLoader module executing', { context: 'Initialization' });

if (typeof window !== 'undefined') {
    logInfo('Cookie Consent plugin loaded', { context: 'Initialization' });

    // Function to initialize cookie consent
    const initializeCookieConsent = (): void => {
        const config = (window as unknown as { __COOKIE_CONSENT_CONFIG__?: CookieConsentConfig })
            .__COOKIE_CONSENT_CONFIG__;

        if (!config) {
            logWarn('Configuration not found, cookie consent will not be loaded', {
                context: 'Initialization',
                details: {
                    hint: 'Check that the plugin is properly configured in docusaurus.config.js'
                }
            });
            // FAIL-SAFE: Ensure no tracking scripts can load without proper config
            window.__COOKIE_CONSENT_CONFIG__ = {
                providers: [],
                cookieName: 'docusaurus_cookie_consent_failsafe',
                cookieExpiry: 365,
                position: 'center',
                privacyPolicyUrl: '/privacy-policy',
                texts: {} as CookieConsentConfig['texts'], // Type will be filled by translation hook
                features: {
                    sillyDeclineButton: false
                },
                enableDebugPanel: false,
                cookieSettingsSelector: '.footer__link-item--cookie-settings'
            };
            return;
        }

        logDebug('Configuration found', {
            context: 'Initialization',
            details: { config }
        });

        // Create container for cookie consent if it doesn't exist
        let container = document.getElementById('docusaurus-cookie-consent-root');
        if (!container) {
            container = document.createElement('div');
            container.id = 'docusaurus-cookie-consent-root';
            document.body.appendChild(container);
        }

        // Create React root and render components
        const root = createRoot(container);
        root.render(
            <PluginConfigContext.Provider value={config}>
                <CookieConsent />
                <CookieSettingsFooter />
                <CookieDebugWidget />
            </PluginConfigContext.Provider>
        );

        logInfo('Components injected into page', { context: 'Initialization' });
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCookieConsent);
    } else {
        // DOM is already ready, initialize immediately
        initializeCookieConsent();
    }
}

// Export empty object to satisfy module requirements
export default {};
