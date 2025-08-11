import React, { useEffect, useRef, useCallback, useReducer, useMemo, JSX } from 'react';
import clsx from 'clsx';
import { usePluginConfig } from '../../hooks/usePluginConfig';
import { useTranslations } from '../../hooks/useTranslations';
import { useLocale } from '../../hooks/useLocale';
import { logWarn, logInfo, logDebug } from '../../utils/logger';
import { loadCustomProvider } from '../../utils/providerLoader';
import type {
    ConsentData,
    BaseProvider,
    CustomProvider,
    GoogleAnalyticsProvider,
    GTMProvider,
    HotjarProvider
} from '../../plugin/types';
import type { HotjarObject } from '../../types/global';
import { consentReducer, initialConsentState, ConsentActions } from './consentReducer';
import styles from './CookieConsent.module.css';

// Type declaration for window object - extending global types
declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}

export default function CookieConsent(): JSX.Element | null {
    const config = usePluginConfig();
    const texts = useTranslations();
    const locale = useLocale();

    // Use reducer for consolidated state management
    const [state, dispatch] = useReducer(consentReducer, initialConsentState);

    // Destructure state for easier access
    const {
        showBanner,
        consentStatus,
        providerConsents,
        savedProviderConsents,
        loadedProviders,
        selectAllToggle,
        showDebugPanel,
        feedbackMessage,
        feedbackType
    } = state;
    const actionsRef = useRef<HTMLDivElement>(null);
    const loadingProvidersRef = useRef<Set<string>>(new Set());
    const loadingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    // Check if we're in the browser
    const canUseDOM = typeof window !== 'undefined';

    // Memoized computations for expensive operations
    const enabledProviders = useMemo(
        () => config.providers?.filter((p) => p.enabled !== false) || [],
        [config.providers]
    );

    const consentedProviders = useMemo(
        () => enabledProviders.filter((p) => savedProviderConsents[p.type] === true),
        [enabledProviders, savedProviderConsents]
    );

    const trackingStatus = useMemo(() => {
        if (enabledProviders.length === 0) {
            return 'disabled';
        } else if (consentedProviders.length === 0) {
            return 'disabled';
        } else if (consentedProviders.length === enabledProviders.length) {
            return 'enabled';
        } else {
            return 'partial';
        }
    }, [enabledProviders, consentedProviders]);

    // Load saved consents and update state
    const loadSavedConsents = useCallback(() => {
        const savedConsent = localStorage.getItem(config.cookieName);
        if (savedConsent) {
            try {
                const data = JSON.parse(savedConsent) as ConsentData;
                if (data.providers) {
                    dispatch(ConsentActions.setProviderConsents(data.providers));
                    dispatch(ConsentActions.setSavedProviderConsents(data.providers));
                    // Set toggle state based on loaded consents
                    const enabledProviders =
                        config.providers?.filter((p) => p.enabled !== false && !p.required) || [];
                    const allSelected =
                        enabledProviders.length > 0 &&
                        enabledProviders.every((p) => data.providers?.[p.type] === true);
                    dispatch(ConsentActions.setSelectAllToggle(allSelected));
                } else if (data.accepted) {
                    const enabledProviders =
                        config.providers?.filter((p) => p.enabled !== false) || [];
                    const migratedConsents: Record<string, boolean> = {};
                    enabledProviders.forEach((provider) => {
                        migratedConsents[provider.type] = true;
                    });
                    dispatch(ConsentActions.setProviderConsents(migratedConsents));
                    dispatch(ConsentActions.setSavedProviderConsents(migratedConsents));
                    dispatch(ConsentActions.setSelectAllToggle(true));
                } else {
                    // User previously rejected all
                    dispatch(ConsentActions.setProviderConsents({}));
                    dispatch(ConsentActions.setSavedProviderConsents({}));
                    dispatch(ConsentActions.setSelectAllToggle(false));
                }
            } catch (error) {
                logWarn('Failed to parse saved consent data', {
                    context: 'Consent',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' }
                });
                // FAIL-SAFE: Initialize empty state on error - no tracking by default
                dispatch(ConsentActions.setProviderConsents({}));
                dispatch(ConsentActions.setSavedProviderConsents({}));
                dispatch(ConsentActions.setSelectAllToggle(false));
                // Clear corrupted data
                localStorage.removeItem(config.cookieName);
            }
        } else {
            // No saved consent - initialize empty state
            dispatch(ConsentActions.setProviderConsents({}));
            dispatch(ConsentActions.setSavedProviderConsents({}));
            dispatch(ConsentActions.setSelectAllToggle(false));
        }
    }, [config.cookieName, config.providers]);

    const hasConsent = useCallback((): boolean | null => {
        try {
            const consent = localStorage.getItem(config.cookieName);
            if (!consent) {
                return null;
            }

            const consentData: ConsentData = JSON.parse(consent);
            const expiryTime =
                new Date(consentData.timestamp).getTime() +
                config.cookieExpiry * 24 * 60 * 60 * 1000;

            if (new Date().getTime() > expiryTime) {
                localStorage.removeItem(config.cookieName);
                return null;
            }

            return consentData.accepted;
        } catch (error) {
            logWarn('Error checking consent status', {
                context: 'Consent',
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    cookieName: config.cookieName
                }
            });
            // FAIL-SAFE: Return null (no consent) on any error
            return null;
        }
    }, [config.cookieName, config.cookieExpiry]);

    // Helper function to handle successful provider load
    const handleProviderLoadSuccess = useCallback((providerKey: string) => {
        const timeoutId = loadingTimeoutsRef.current.get(providerKey);
        if (timeoutId) {
            clearTimeout(timeoutId);
            loadingTimeoutsRef.current.delete(providerKey);
        }
        // Remove from loading set
        loadingProvidersRef.current.delete(providerKey);
    }, []);

    const loadAnalytics = useCallback((): void => {
        if (!config.providers || config.providers.length === 0) {
            logDebug('No providers to load', { context: 'Analytics' });
            return;
        }

        // Check if any provider has debug mode
        const hasDebugProvider = config.providers.some((p) => p.debug);
        if (hasDebugProvider) {
            logDebug('🐞 DEBUG MODE: Loading analytics providers...', {
                details: { providers: config.providers }
            });
        }

        // Get saved consent data from localStorage
        const savedConsentData = localStorage.getItem(config.cookieName);
        let savedProviderConsents: Record<string, boolean> = {};

        if (savedConsentData) {
            try {
                const data = JSON.parse(savedConsentData) as ConsentData;
                savedProviderConsents = data.providers || {};
            } catch (error) {
                logWarn('Failed to parse saved consent for analytics loading', {
                    context: 'Analytics',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' }
                });
            }
        }

        const enabledProviders = config.providers.filter((p) => p.enabled !== false);
        const consentedProviders = enabledProviders.filter(
            (p) => p.required || savedProviderConsents[p.type] === true
        );

        // Filter out already loaded providers and those currently loading
        const providersToLoad = consentedProviders.filter((p) => {
            const key =
                p.type === 'custom'
                    ? p.type + ':' + (p as CustomProvider).src
                    : p.type +
                      ':' +
                      (p as GoogleAnalyticsProvider | GTMProvider | HotjarProvider).id;
            return !loadedProviders.has(key) && !loadingProvidersRef.current.has(key);
        });

        if (providersToLoad.length === 0) {
            logDebug('All consented providers already loaded', { context: 'Analytics' });
            return;
        }

        logInfo(`Loading ${providersToLoad.length} provider(s)`, {
            context: 'Analytics',
            details: { providers: providersToLoad.map((p) => p.type) }
        });

        const newLoadedProviders = new Set(loadedProviders);
        const SCRIPT_LOAD_TIMEOUT = 5000; // 5 seconds timeout

        providersToLoad.forEach((provider, index) => {
            const providerKey =
                provider.type === 'custom'
                    ? provider.type + ':' + (provider as CustomProvider).src
                    : provider.type +
                      ':' +
                      (provider as GoogleAnalyticsProvider | GTMProvider | HotjarProvider).id;

            // Mark as loading to prevent duplicates
            loadingProvidersRef.current.add(providerKey);

            // Set up timeout
            const timeoutId = setTimeout(() => {
                logWarn(
                    `Provider ${provider.type} loading timed out after ${SCRIPT_LOAD_TIMEOUT}ms`,
                    {
                        context: 'Analytics',
                        details: { provider, timeout: SCRIPT_LOAD_TIMEOUT }
                    }
                );
                loadingProvidersRef.current.delete(providerKey);
                loadingTimeoutsRef.current.delete(providerKey);
            }, SCRIPT_LOAD_TIMEOUT);

            loadingTimeoutsRef.current.set(providerKey, timeoutId);

            try {
                logDebug(`Loading provider ${provider.type}`, {
                    details: { debug: provider.debug }
                });
                switch (provider.type) {
                    case 'google':
                        // Handle Google Analytics
                        if (!window.gtag) {
                            // Initialize dataLayer and gtag function before loading script
                            window.dataLayer = window.dataLayer || [];
                            window.gtag = function () {
                                window.dataLayer?.push(arguments);
                            };
                            window.gtag('js', new Date());

                            const script = document.createElement('script');
                            script.async = true;
                            script.src = `https://www.googletagmanager.com/gtag/js?id=${provider.id}`;
                            script.onload = () => {
                                const gaProviderKey = provider.type + ':' + provider.id;
                                handleProviderLoadSuccess(gaProviderKey);

                                logInfo('Google Analytics script loaded successfully', {
                                    context: 'Analytics',
                                    details: { id: provider.id }
                                });

                                const gaOptions: Record<string, unknown> = {
                                    anonymize_ip: provider.options?.anonymizeIp ?? true,
                                    ...provider.options
                                };

                                // Remove cookieFlags if not provided
                                if (provider.options?.cookieFlags) {
                                    gaOptions.cookie_flags = provider.options.cookieFlags;
                                }

                                if (provider.debug) {
                                    gaOptions.debug_mode = true;
                                }

                                window.gtag?.('config', provider.id, gaOptions);

                                if (provider.debug) {
                                    // Send a test event when in debug mode
                                    window.gtag?.('event', 'cookie_consent_debug', {
                                        event_category: 'engagement',
                                        event_label: 'provider_initialized',
                                        provider_type: 'google',
                                        provider_id: provider.id
                                    });

                                    logDebug('🐞 Google Analytics DEBUG MODE ACTIVE 🐞', {
                                        details: {
                                            providerConfig: provider,
                                            gaOptions,
                                            gtagExists: !!window.gtag,
                                            dataLayer: window.dataLayer,
                                            dataLayerLength: window.dataLayer?.length
                                        }
                                    });

                                    logInfo('🐞 Google Analytics initialized in DEBUG MODE', {
                                        context: 'Analytics',
                                        details: {
                                            id: provider.id,
                                            options: gaOptions,
                                            dataLayer: window.dataLayer,
                                            debug: true,
                                            tip: 'Check GA DebugView or install GA Debugger extension'
                                        }
                                    });
                                } else {
                                    logInfo('Google Analytics initialized', {
                                        context: 'Analytics',
                                        details: { id: provider.id, options: gaOptions }
                                    });
                                }

                                newLoadedProviders.add(gaProviderKey);
                            };
                            script.onerror = (error) => {
                                const gaProviderKey = provider.type + ':' + provider.id;
                                handleProviderLoadSuccess(gaProviderKey); // Still clear loading state

                                logWarn('Failed to load Google Analytics script', {
                                    context: 'Analytics',
                                    details: {
                                        id: provider.id,
                                        error:
                                            error instanceof Error ? error.message : 'Unknown error'
                                    }
                                });
                            };
                            document.head.appendChild(script);
                        } else {
                            // Additional GA property - only add if not already added
                            if (!loadedProviders.has(provider.type + ':' + provider.id)) {
                                window.gtag('config', provider.id, provider.options || {});
                                logInfo('Additional Google Analytics property added', {
                                    context: 'Analytics',
                                    details: { id: provider.id }
                                });
                                newLoadedProviders.add(provider.type + ':' + provider.id);
                            }
                        }
                        break;

                    case 'gtm':
                        // Handle Google Tag Manager
                        if (
                            !window.dataLayer ||
                            !loadedProviders.has(provider.type + ':' + provider.id)
                        ) {
                            // Initialize dataLayer before GTM script
                            const dataLayerName = provider.options?.dataLayerName || 'dataLayer';
                            window.dataLayer = window.dataLayer || [];

                            if (provider.debug) {
                                logDebug('🐞 GTM DEBUG MODE ACTIVE 🐞', {
                                    details: {
                                        providerConfig: provider,
                                        containerId: provider.id,
                                        dataLayerBeforeInit: window.dataLayer
                                    }
                                });
                            }

                            // Create GTM script using safe DOM methods
                            const script = document.createElement('script');
                            script.async = true;

                            // Safely construct the GTM URL with validated parameters
                            const gtmUrl = new URL('https://www.googletagmanager.com/gtm.js');
                            gtmUrl.searchParams.set('id', provider.id);
                            if (dataLayerName !== 'dataLayer') {
                                gtmUrl.searchParams.set('l', dataLayerName);
                            }
                            script.src = gtmUrl.toString();

                            script.onerror = () => {
                                logWarn('Failed to load Google Tag Manager script', {
                                    context: 'Analytics',
                                    details: { id: provider.id }
                                });
                            };

                            script.onload = () => {
                                const gtmProviderKey = provider.type + ':' + provider.id;
                                handleProviderLoadSuccess(gtmProviderKey);

                                // Initialize GTM after script loads
                                window.dataLayer = window.dataLayer || [];
                                window.dataLayer.push({
                                    'gtm.start': new Date().getTime(),
                                    event: 'gtm.js'
                                });

                                logInfo('Google Tag Manager script loaded successfully', {
                                    context: 'Analytics',
                                    details: { id: provider.id }
                                });

                                newLoadedProviders.add(gtmProviderKey);
                            };

                            document.head.appendChild(script);

                            // GTM noscript iframe (for users with JavaScript disabled)
                            const noscript = document.createElement('noscript');
                            const iframe = document.createElement('iframe');
                            iframe.src = `https://www.googletagmanager.com/ns.html?id=${provider.id}`;
                            iframe.height = '0';
                            iframe.width = '0';
                            iframe.style.display = 'none';
                            iframe.style.visibility = 'hidden';
                            noscript.appendChild(iframe);
                            document.body.insertBefore(noscript, document.body.firstChild);

                            if (provider.debug) {
                                logInfo('🐞 Google Tag Manager initialized in DEBUG MODE', {
                                    context: 'Analytics',
                                    details: {
                                        id: provider.id,
                                        dataLayerName,
                                        dataLayer: window.dataLayer,
                                        debug: true,
                                        tip: 'Use GTM Preview mode to debug tags'
                                    }
                                });

                                // Push a debug event to dataLayer
                                window.dataLayer.push({
                                    event: 'cookie_consent_gtm_debug',
                                    gtm_container_id: provider.id,
                                    timestamp: new Date().toISOString()
                                });

                                logDebug('GTM DataLayer after init', {
                                    details: { dataLayer: window.dataLayer }
                                });
                            } else {
                                logInfo('Google Tag Manager initialized', {
                                    context: 'Analytics',
                                    details: { id: provider.id, dataLayerName }
                                });
                            }

                            newLoadedProviders.add(provider.type + ':' + provider.id);
                        } else {
                            logDebug('Google Tag Manager already loaded', {
                                context: 'Analytics'
                            });
                        }
                        break;

                    case 'hotjar': {
                        // Handle Hotjar
                        // Check if running on HTTPS
                        const isHTTPS = window.location.protocol === 'https:';
                        if (!isHTTPS) {
                            logWarn('⚠️ Hotjar requires HTTPS to function properly', {
                                context: 'Analytics',
                                details: {
                                    currentProtocol: window.location.protocol,
                                    currentURL: window.location.href,
                                    provider: 'Hotjar',
                                    solution:
                                        'Use ngrok or deploy to HTTPS environment for testing',
                                    tip: 'Run: ngrok http 3000'
                                }
                            });
                        }

                        if (!window._hjSettings) {
                            const hjVersion = provider.options?.version || 6;

                            (function (
                                h: Window & HotjarObject,
                                o: Document,
                                t: string,
                                j: string,
                                a?: HTMLHeadElement,
                                r?: HTMLScriptElement
                            ) {
                                h.hj =
                                    h.hj ||
                                    function () {
                                        const hj = h.hj as {
                                            (...args: unknown[]): void;
                                            q?: unknown[];
                                        };
                                        if (hj && typeof hj === 'function') {
                                            (hj.q = hj.q || []).push(arguments);
                                        }
                                    };
                                h._hjSettings = { hjid: provider.id, hjsv: hjVersion };
                                a = o.getElementsByTagName('head')[0] as HTMLHeadElement;
                                r = o.createElement('script') as HTMLScriptElement;
                                r.async = true;
                                r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
                                r.onerror = () => {
                                    logWarn('Failed to load Hotjar script', {
                                        context: 'Analytics',
                                        details: { id: provider.id, version: hjVersion }
                                    });
                                };
                                a.appendChild(r);
                            })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');

                            if (provider.debug) {
                                logDebug('🐞 Hotjar DEBUG MODE ACTIVE 🐞', {
                                    details: {
                                        providerConfig: provider,
                                        hotjarId: provider.id,
                                        hotjarVersion: hjVersion,
                                        protocol: window.location.protocol,
                                        isHTTPS,
                                        hjExists: !!window.hj,
                                        hjSettings: window._hjSettings
                                    }
                                });

                                logInfo('🐞 Hotjar initialized in DEBUG MODE', {
                                    context: 'Analytics',
                                    details: {
                                        id: provider.id,
                                        version: hjVersion,
                                        isHTTPS,
                                        willWork: isHTTPS,
                                        hjObject: window.hj,
                                        _hjSettings: window._hjSettings,
                                        debug: true,
                                        tip: isHTTPS
                                            ? 'Check Hotjar dashboard for recordings'
                                            : '⚠️ Switch to HTTPS for Hotjar to work'
                                    }
                                });

                                // Try to trigger a Hotjar event if on HTTPS
                                if (window.hj && isHTTPS) {
                                    window.hj('event', 'cookie_consent_debug');
                                    logDebug('Hotjar debug event sent');
                                }
                            } else {
                                logInfo('Hotjar initialized', {
                                    context: 'Analytics',
                                    details: { id: provider.id, version: hjVersion }
                                });
                            }

                            newLoadedProviders.add(provider.type + ':' + provider.id);
                        } else {
                            logDebug('Hotjar already loaded', {
                                context: 'Analytics'
                            });
                        }
                        break;
                    }

                    case 'custom': {
                        // Validate provider configuration
                        if (!provider.src && !provider.inlineScript) {
                            logWarn('Custom provider requires either src or inlineScript', {
                                context: 'Analytics',
                                details: { provider }
                            });
                            break;
                        }

                        const customProviderKey = provider.type + ':' + (provider.src || 'inline');

                        loadCustomProvider(provider)
                            .then(() => {
                                handleProviderLoadSuccess(customProviderKey);
                                logInfo('Custom provider loaded successfully', {
                                    context: 'Analytics',
                                    details: {
                                        src: provider.src,
                                        inlineScript: !!provider.inlineScript,
                                        loadMethod: provider.loadMethod
                                    }
                                });
                                newLoadedProviders.add(customProviderKey);

                                if (provider.debug) {
                                    logInfo('🐞 Custom Provider DEBUG MODE ACTIVE 🐞', {
                                        context: 'Analytics',
                                        details: {
                                            src: provider.src,
                                            inlineScript: !!provider.inlineScript,
                                            loadMethod: provider.loadMethod || 'script-tag',
                                            options: provider.options,
                                            debug: true
                                        }
                                    });
                                }
                            })
                            .catch((error) => {
                                logWarn('Failed to load custom provider', {
                                    context: 'Analytics',
                                    details: {
                                        src: provider.src,
                                        error:
                                            error instanceof Error ? error.message : 'Unknown error'
                                    }
                                });
                                loadingProvidersRef.current.delete(customProviderKey);
                            });

                        logDebug('Custom provider loading initiated', {
                            context: 'Analytics',
                            details: {
                                src: provider.src,
                                inlineScript: !!provider.inlineScript,
                                loadMethod: provider.loadMethod,
                                options: provider.options
                            }
                        });
                        break;
                    }

                    default:
                        logWarn(
                            `Unknown analytics provider type: ${(provider as Record<string, unknown>).type}`,
                            {
                                context: 'Analytics',
                                details: { provider }
                            }
                        );
                }
            } catch (error) {
                // Clear loading state for this provider
                const errorProviderKey =
                    provider.type === 'custom'
                        ? provider.type + ':' + (provider as BaseProvider & { src?: string }).src
                        : provider.type +
                          ':' +
                          (provider as BaseProvider & { id?: string | number }).id;
                handleProviderLoadSuccess(errorProviderKey);

                logWarn(`Failed to load analytics provider at index ${index}`, {
                    context: 'Analytics',
                    details: {
                        provider,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }
                });
            }
        });

        // Update the loaded providers state
        if (newLoadedProviders.size > loadedProviders.size) {
            dispatch(ConsentActions.setLoadedProviders(newLoadedProviders));
        }
    }, [config.providers, config.cookieName, loadedProviders, handleProviderLoadSuccess]);

    const saveGranularConsent = useCallback(
        (accepted: boolean, providerChoices?: Record<string, boolean>): void => {
            const consentData: ConsentData = {
                accepted,
                timestamp: new Date().toISOString(),
                version: '1.0',
                providers: providerChoices || providerConsents
            };

            try {
                localStorage.setItem(config.cookieName, JSON.stringify(consentData));
                dispatch(ConsentActions.setConsentStatus(accepted));

                if (providerChoices) {
                    dispatch(ConsentActions.setProviderConsents(providerChoices));
                    dispatch(ConsentActions.setSavedProviderConsents(providerChoices));
                }

                // Emit custom event for real-time updates
                const event = new CustomEvent('cookieConsentChanged', {
                    detail: { accepted, consentData }
                });
                window.dispatchEvent(event);

                // Load analytics after saving consent
                // Use setTimeout to ensure state updates have completed
                setTimeout(() => {
                    if (accepted || Object.values(consentData.providers || {}).some((v) => v)) {
                        loadAnalytics();
                    }
                }, 100);

                logDebug('Cookie consent saved', {
                    context: 'Consent',
                    details: {
                        accepted,
                        timestamp: consentData.timestamp,
                        providers: consentData.providers
                    }
                });
            } catch (error) {
                logWarn('Failed to save cookie consent', {
                    context: 'Consent',
                    details: {
                        error: error instanceof Error ? error.message : 'Unknown error',
                        hint: 'Consent banner will remain visible'
                    }
                });
                // FAIL-SAFE: Keep the banner visible if we can't save the consent
                // and DO NOT load any analytics scripts
                dispatch(ConsentActions.setConsentStatus(null));
                // Alert user about the issue
                if (typeof window !== 'undefined') {
                    console.error(
                        '[Cookie Consent] Unable to save your cookie preferences. No tracking will be enabled.'
                    );
                }
            }
        },
        [config.cookieName, loadAnalytics, providerConsents]
    );

    const saveConsent = useCallback(
        (accepted: boolean): void => {
            // When accepting/declining all, set all providers accordingly
            const enabledProviders = config.providers?.filter((p) => p.enabled !== false) || [];
            const allProvidersConsent: Record<string, boolean> = {};

            enabledProviders.forEach((provider) => {
                allProvidersConsent[provider.type] = accepted || provider.required === true;
            });

            saveGranularConsent(accepted, allProvidersConsent);
        },
        [config.providers, saveGranularConsent]
    );

    useEffect(() => {
        if (!canUseDOM) {
            return;
        }

        const consent = hasConsent();
        dispatch(ConsentActions.setConsentStatus(consent));

        // Load saved consents on mount
        loadSavedConsents();

        if (consent === null) {
            // No consent decision made - show banner
            dispatch(ConsentActions.showBanner(true));
        }
    }, [canUseDOM, hasConsent, loadSavedConsents]);

    // Reset state when modal opens
    useEffect(() => {
        if (showBanner && canUseDOM) {
            loadSavedConsents();
        }
    }, [showBanner, canUseDOM, loadSavedConsents]);

    // Load analytics based on saved consent status, not temporary UI state
    useEffect(() => {
        if (!canUseDOM) {
            return;
        }

        // Only load analytics if we have a saved consent decision
        if (consentStatus === true) {
            loadAnalytics();
        }
    }, [canUseDOM, consentStatus, loadAnalytics]);

    const handleAccept = useCallback((): void => {
        saveConsent(true);
        dispatch(
            ConsentActions.showFeedback(
                texts.choicesSaved || 'Your choices have been saved.',
                'success'
            )
        );
    }, [saveConsent, texts.choicesSaved]);

    const handleAcceptSelected = useCallback((): void => {
        // Accept only the selected providers
        const hasAnySelection = Object.values(providerConsents).some((v) => v);
        saveGranularConsent(hasAnySelection, providerConsents);
        dispatch(
            ConsentActions.showFeedback(
                texts.choicesSaved || 'Your choices have been saved.',
                'success'
            )
        );
    }, [providerConsents, saveGranularConsent, texts.choicesSaved]);

    const handleDismiss = useCallback((): void => {
        // Just hide the banner for this page view
        // Don't store anything - banner will show again on reload
        dispatch(ConsentActions.showBanner(false));

        // Emit event for tracking purposes
        const event = new CustomEvent('cookieConsentDismissed', {
            detail: { timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }, []);

    const resetConsent = useCallback((): void => {
        logDebug('resetConsent() called', { context: 'API' });
        // Show the banner again but DON'T remove the stored consent
        // This allows users to see their current status and change if needed
        const currentConsent = hasConsent();
        dispatch(ConsentActions.setConsentStatus(currentConsent));
        dispatch(ConsentActions.showBanner(true));
        // The modal open effect will handle loading the saved state
        logDebug('Banner visibility set to true', {
            context: 'API',
            details: { currentConsent }
        });
    }, [hasConsent]);

    // Expose API to window for programmatic control
    useEffect(() => {
        if (!canUseDOM) {
            return;
        }

        window.CookieConsent = {
            reset: resetConsent,
            getStatus: () => consentStatus,
            updateConsent: (accepted: boolean) => {
                saveConsent(accepted);
                dispatch(ConsentActions.showBanner(false));
            },
            getConsentData: () => {
                const consent = localStorage.getItem(config.cookieName);
                return consent ? JSON.parse(consent) : null;
            }
        };
        logDebug('window.CookieConsent API initialized', { context: 'API' });
    }, [canUseDOM, consentStatus, config.cookieName, resetConsent, saveConsent]);

    // Auto-hide feedback messages after 3 seconds
    useEffect(() => {
        if (feedbackMessage) {
            const timer = setTimeout(() => {
                dispatch(ConsentActions.hideFeedback());
            }, 3000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [feedbackMessage]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        const timeouts = loadingTimeoutsRef.current;
        const providers = loadingProvidersRef.current;

        return () => {
            // Clear all pending timeouts
            timeouts.forEach((timeout) => {
                clearTimeout(timeout);
            });
            timeouts.clear();
            providers.clear();
        };
    }, []);

    if (!canUseDOM || !showBanner) {
        if (canUseDOM) {
            logDebug('Banner not shown', {
                context: 'Render',
                details: { showBanner }
            });
        }
        return null;
    }

    return (
        <>
            <div
                className={styles.cookieConsentOverlay}
                onClick={handleDismiss}
                aria-hidden="true"
            />
            <div
                id="cookie-consent-banner"
                className={clsx(styles.cookieConsentModal, styles.cookieConsentShow)}
                role="dialog"
                aria-label="Cookie consent"
                aria-modal="true"
            >
                <div className={styles.cookieConsentHeader}>
                    <h2 className={styles.cookieConsentTitle}>
                        {texts.title}
                        {/* Add tracking status indicator */}
                        {trackingStatus === 'disabled' && (
                            <span className={styles.trackingStatusDisabled}>
                                {' '}
                                {texts.trackingDisabled}
                            </span>
                        )}
                        {trackingStatus === 'enabled' && (
                            <span className={styles.trackingStatusEnabled}>
                                {' '}
                                {texts.trackingEnabled}
                            </span>
                        )}
                        {trackingStatus === 'partial' && (
                            <span className={styles.trackingStatusPartial}>
                                {' '}
                                {texts.trackingPartial}
                            </span>
                        )}
                    </h2>
                    <button
                        className={styles.cookieConsentClose}
                        onClick={handleDismiss}
                        aria-label={texts.closeButtonAriaLabel}
                        title="Close"
                        type="button"
                    >
                        ×
                    </button>
                </div>
                <div className={styles.cookieConsentContent}>
                    <p className={styles.cookieConsentText}>{texts.description}</p>
                    <p className={styles.cookieConsentText}>{texts.consentHelp}</p>

                    {/* Provider selection checkboxes */}
                    {config.providers && config.providers.length > 0 ? (
                        <>
                            <div className={styles.cookieConsentProvidersHeader}>
                                <h3 className={styles.cookieConsentProvidersTitle}>
                                    {texts.providerSelectionTitle ||
                                        'Please select which services you allow to collect data:'}
                                </h3>
                                <div className={styles.cookieConsentToggleWrapper}>
                                    <label className={styles.cookieConsentToggleLabel}>
                                        <span className={styles.cookieConsentToggleText}>
                                            {texts.selectAll || 'Select All'}
                                        </span>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={selectAllToggle}
                                            className={clsx(
                                                styles.cookieConsentToggle,
                                                selectAllToggle && styles.cookieConsentToggleChecked
                                            )}
                                            onClick={() => {
                                                const newToggleState = !selectAllToggle;
                                                dispatch(
                                                    ConsentActions.setSelectAllToggle(
                                                        newToggleState
                                                    )
                                                );

                                                const enabledProviders =
                                                    config.providers?.filter(
                                                        (p) => p.enabled !== false && !p.required
                                                    ) || [];
                                                const updatedConsents: Record<string, boolean> = {
                                                    ...providerConsents
                                                };

                                                enabledProviders.forEach((p) => {
                                                    updatedConsents[p.type] = newToggleState;
                                                });

                                                dispatch(
                                                    ConsentActions.setProviderConsents(
                                                        updatedConsents
                                                    )
                                                );
                                            }}
                                        >
                                            <span className={styles.cookieConsentToggleSlider} />
                                        </button>
                                    </label>
                                </div>
                            </div>
                            <div className={styles.cookieConsentProviders}>
                                {config.providers
                                    .filter((p) => p.enabled !== false)
                                    .map((provider) => {
                                        // Get provider name and description from i18n field first, then fallback to translations
                                        const providerI18n =
                                            provider.i18n?.[locale] || provider.i18n?.en;
                                        const providerName =
                                            providerI18n?.name ||
                                            texts.providers?.[provider.type]?.name ||
                                            provider.type;
                                        const providerDescription =
                                            providerI18n?.description ||
                                            texts.providers?.[provider.type]?.description ||
                                            '';

                                        return (
                                            <div
                                                key={provider.type}
                                                className={styles.cookieConsentProvider}
                                            >
                                                <label
                                                    className={styles.cookieConsentProviderLabel}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className={
                                                            styles.cookieConsentProviderCheckbox
                                                        }
                                                        checked={
                                                            providerConsents[provider.type] ||
                                                            provider.required === true
                                                        }
                                                        disabled={provider.required === true}
                                                        onChange={(e) => {
                                                            const newConsents = {
                                                                ...providerConsents,
                                                                [provider.type]: e.target.checked
                                                            };
                                                            dispatch(
                                                                ConsentActions.setProviderConsents(
                                                                    newConsents
                                                                )
                                                            );

                                                            // Update toggle state based on selections
                                                            const enabledProviders =
                                                                config.providers?.filter(
                                                                    (p) =>
                                                                        p.enabled !== false &&
                                                                        !p.required
                                                                ) || [];
                                                            const allSelected =
                                                                enabledProviders.every(
                                                                    (p) =>
                                                                        newConsents[p.type] === true
                                                                );
                                                            dispatch(
                                                                ConsentActions.setSelectAllToggle(
                                                                    allSelected
                                                                )
                                                            );

                                                            // If unchecking, we should save the consent immediately
                                                            if (!e.target.checked) {
                                                                // Note: We can't remove already loaded scripts due to browser limitations
                                                                // But we prevent them from loading on next page load
                                                                logInfo(
                                                                    `Provider ${provider.type} disabled by user`,
                                                                    {
                                                                        context: 'Consent'
                                                                    }
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <div
                                                        className={styles.cookieConsentProviderInfo}
                                                    >
                                                        <span
                                                            className={
                                                                styles.cookieConsentProviderName
                                                            }
                                                        >
                                                            {providerName}
                                                            {provider.required && ' (Required)'}
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.cookieConsentProviderDescription
                                                            }
                                                        >
                                                            {providerDescription}
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>
                                        );
                                    })}
                            </div>
                        </>
                    ) : (
                        /* No providers configured - show info message */
                        <div className={styles.cookieConsentNoProviders}>
                            <p className={styles.cookieConsentInfoBox}>
                                {texts.noProvidersInfo ||
                                    'No analytics providers are configured for this site.'}
                            </p>
                        </div>
                    )}

                    {/* Feedback message */}
                    {feedbackMessage && (
                        <div className={styles.cookieConsentFeedbackWrapper}>
                            <div
                                className={clsx(
                                    styles.cookieConsentFeedback,
                                    feedbackType === 'success' &&
                                        styles.cookieConsentFeedbackSuccess,
                                    feedbackType === 'error' && styles.cookieConsentFeedbackError
                                )}
                                role="status"
                                aria-live="polite"
                            >
                                {feedbackMessage}
                            </div>
                        </div>
                    )}

                    <div ref={actionsRef} className={styles.cookieConsentActions}>
                        <button
                            className={clsx(
                                styles.cookieConsentButton,
                                styles.cookieConsentButtonPrimary
                            )}
                            onClick={
                                config.providers && config.providers.length > 0
                                    ? handleAcceptSelected
                                    : handleAccept
                            }
                            aria-label={texts.saveMyChoicesButton || 'Save My Choices'}
                        >
                            {texts.saveMyChoicesButton || 'Save My Choices'}
                        </button>
                        <button
                            className={clsx(
                                styles.cookieConsentButton,
                                styles.cookieConsentButtonSecondary
                            )}
                            onClick={handleDismiss}
                            aria-label={texts.closeButton || 'Close'}
                        >
                            {texts.closeButton || 'Close'}
                        </button>
                        {config.privacyPolicyUrl && (
                            <a
                                className={styles.cookieConsentActionsLink}
                                href={config.privacyPolicyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {texts.privacyPolicyLinkText}
                            </a>
                        )}
                    </div>

                    {/* Debug Panel */}
                    {config.enableDebugPanel && (
                        <div className={styles.cookieConsentDebugPanel}>
                            <button
                                className={styles.cookieConsentDebugToggle}
                                onClick={() => dispatch(ConsentActions.toggleDebugPanel())}
                                type="button"
                            >
                                🐞 {showDebugPanel ? 'Hide' : 'Show'} Debug Info
                            </button>

                            {showDebugPanel && (
                                <div className={styles.cookieConsentDebugContent}>
                                    <h4>Analytics Status</h4>

                                    {/* Google Analytics Status */}
                                    {config.providers?.some((p) => p.type === 'google') && (
                                        <div className={styles.cookieConsentDebugProvider}>
                                            <strong>Google providers:</strong>
                                            <ul>
                                                <li>
                                                    gtag exists: {window.gtag ? '✅ Yes' : '❌ No'}
                                                </li>
                                                <li>
                                                    dataLayer exists:{' '}
                                                    {window.dataLayer ? '✅ Yes' : '❌ No'}
                                                </li>
                                                <li>
                                                    dataLayer length:{' '}
                                                    {window.dataLayer?.length || 0}
                                                </li>
                                            </ul>
                                            <button
                                                className={styles.cookieConsentDebugButton}
                                                onClick={() => {
                                                    if (window.gtag) {
                                                        window.gtag('event', 'test_event', {
                                                            event_category: 'debug',
                                                            event_label: 'manual_test',
                                                            value: Date.now()
                                                        });
                                                        logInfo(
                                                            'Test event sent to Google Analytics',
                                                            {
                                                                context: 'Debug',
                                                                details: { timestamp: Date.now() }
                                                            }
                                                        );
                                                        alert(
                                                            'Test event sent! Check GA DebugView or Real-Time reports.'
                                                        );
                                                    } else {
                                                        alert('Google Analytics not loaded yet!');
                                                    }
                                                }}
                                            >
                                                Send Test Event to GA
                                            </button>
                                        </div>
                                    )}

                                    {/* Hotjar Status */}
                                    {config.providers?.some((p) => p.type === 'hotjar') && (
                                        <div className={styles.cookieConsentDebugProvider}>
                                            <strong>Hotjar:</strong>
                                            <ul>
                                                <li>hj exists: {window.hj ? '✅ Yes' : '❌ No'}</li>
                                                <li>
                                                    _hjSettings exists:{' '}
                                                    {window._hjSettings ? '✅ Yes' : '❌ No'}
                                                </li>
                                                <li>
                                                    Protocol: {window.location.protocol}{' '}
                                                    {window.location.protocol === 'https:'
                                                        ? '✅'
                                                        : '⚠️ HTTPS required'}
                                                </li>
                                            </ul>
                                            <button
                                                className={styles.cookieConsentDebugButton}
                                                onClick={() => {
                                                    if (window.hj) {
                                                        window.hj('event', 'test_event_from_debug');
                                                        logInfo('Test event sent to Hotjar', {
                                                            context: 'Debug',
                                                            details: { timestamp: Date.now() }
                                                        });
                                                        alert(
                                                            'Test event sent! Check Hotjar dashboard.'
                                                        );
                                                    } else {
                                                        alert(
                                                            'Hotjar not loaded! ' +
                                                                (window.location.protocol !==
                                                                'https:'
                                                                    ? 'HTTPS is required.'
                                                                    : '')
                                                        );
                                                    }
                                                }}
                                            >
                                                Send Test Event to Hotjar
                                            </button>
                                        </div>
                                    )}

                                    {/* GTM Status */}
                                    {config.providers?.some((p) => p.type === 'gtm') && (
                                        <div className={styles.cookieConsentDebugProvider}>
                                            <strong>Google Tag Manager:</strong>
                                            <ul>
                                                <li>
                                                    dataLayer exists:{' '}
                                                    {window.dataLayer ? '✅ Yes' : '❌ No'}
                                                </li>
                                                <li>
                                                    dataLayer length:{' '}
                                                    {window.dataLayer?.length || 0}
                                                </li>
                                            </ul>
                                            <button
                                                className={styles.cookieConsentDebugButton}
                                                onClick={() => {
                                                    if (window.dataLayer) {
                                                        window.dataLayer.push({
                                                            event: 'test_event',
                                                            event_category: 'debug',
                                                            event_label: 'manual_test',
                                                            value: Date.now()
                                                        });
                                                        logInfo('Test event pushed to dataLayer', {
                                                            context: 'Debug',
                                                            details: {
                                                                timestamp: Date.now(),
                                                                dataLayer: window.dataLayer
                                                            }
                                                        });
                                                        alert(
                                                            'Test event pushed to dataLayer! Check GTM Preview mode.'
                                                        );
                                                    } else {
                                                        alert('GTM dataLayer not initialized!');
                                                    }
                                                }}
                                            >
                                                Push Test Event to GTM
                                            </button>
                                        </div>
                                    )}

                                    <div className={styles.cookieConsentDebugHelp}>
                                        <h5>How to verify:</h5>
                                        <ul>
                                            <li>
                                                <strong>GA:</strong> Check DebugView in GA4 or
                                                install GA Debugger extension
                                            </li>
                                            <li>
                                                <strong>Hotjar:</strong> Check dashboard for
                                                recordings (requires HTTPS)
                                            </li>
                                            <li>
                                                <strong>GTM:</strong> Use GTM Preview mode to see
                                                events
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
