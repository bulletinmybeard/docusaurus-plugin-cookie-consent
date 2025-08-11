import { useState, useEffect } from 'react';
import { logDebug, logWarn } from '../utils/logger';

export function useLocale(): string {
    const [locale, setLocale] = useState('en');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        // First check if forceLocale is set in plugin config
        try {
            const config = (
                window as unknown as {
                    __COOKIE_CONSENT_CONFIG__?: { i18n?: { forceLocale?: string } };
                }
            ).__COOKIE_CONSENT_CONFIG__;
            if (config?.i18n?.forceLocale) {
                logDebug('Using forced locale', {
                    context: 'i18n',
                    details: { forceLocale: config.i18n.forceLocale }
                });
                setLocale(config.i18n.forceLocale);
                return;
            }
        } catch {
            // Continue with normal locale detection
        }

        // Try to get locale from Docusaurus
        try {
            // Check Docusaurus global data
            if ((window as unknown as { __docusaurus?: { globalData?: unknown } }).__docusaurus) {
                const context = (
                    window as unknown as {
                        __docusaurus: { globalData: { i18n?: { currentLocale?: string } } };
                    }
                ).__docusaurus.globalData;
                if (context?.i18n?.currentLocale) {
                    setLocale(context.i18n.currentLocale);
                    return;
                }
            }

            // Check URL path for locale
            const pathname = window.location.pathname;
            const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
            if (localeMatch && localeMatch[1]) {
                setLocale(localeMatch[1]);
                return;
            }

            // Fallback to browser language
            const browserLang = navigator.language.split('-')[0];

            // Check if we have translations for this locale
            // Currently we only support 'en' and 'de'
            const supportedLocales = ['en', 'de'];
            const localeToUse = supportedLocales.includes(browserLang) ? browserLang : 'en';
            setLocale(localeToUse);

            logDebug('Using browser language', {
                context: 'i18n',
                details: {
                    browserLanguage: navigator.language,
                    detectedLocale: browserLang
                }
            });
        } catch (error) {
            logWarn('Error detecting locale', {
                context: 'i18n',
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    defaultLocale: 'en'
                }
            });
        }
    }, []);

    return locale;
}
