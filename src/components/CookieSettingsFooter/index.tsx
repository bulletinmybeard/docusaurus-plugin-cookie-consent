import { useEffect } from 'react';
import { usePluginConfig } from '../../hooks/usePluginConfig';
import { logDebug, logWarn } from '../../utils/logger';

// Create a symbol for storing the handler to avoid naming convention issues
const HANDLER_SYMBOL = Symbol('cookieSettingsHandler');

interface ExtendedHTMLElement extends HTMLElement {
    [HANDLER_SYMBOL]?: (e: Event) => void;
}

export function CookieSettingsFooter(): null {
    const config = usePluginConfig();

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const selector = config.cookieSettingsSelector || '.footer__link-item--cookie-settings';

        const attachHandlers = (): void => {
            const elements = document.querySelectorAll(selector);
            logDebug(`Found ${elements.length} cookie settings link(s)`, {
                context: 'Footer',
                details: { selector, count: elements.length }
            });

            elements.forEach((element) => {
                const handleClick = (e: Event): void => {
                    e.preventDefault();
                    logDebug('Cookie settings link clicked', { context: 'Footer' });

                    if (
                        (window as unknown as { CookieConsent?: { reset: () => void } })
                            .CookieConsent
                    ) {
                        (
                            window as unknown as { CookieConsent: { reset: () => void } }
                        ).CookieConsent.reset();
                    } else {
                        logWarn('window.CookieConsent not found', {
                            context: 'Footer',
                            details: {
                                hint: 'CookieConsent component may not be mounted yet'
                            }
                        });
                    }
                };

                // Remove any existing listener to avoid duplicates
                element.removeEventListener('click', handleClick);
                element.addEventListener('click', handleClick);

                // Store the handler on the element for cleanup
                (element as ExtendedHTMLElement)[HANDLER_SYMBOL] = handleClick;
            });
        };

        // Initial attachment
        attachHandlers();

        // Watch for DOM changes (e.g., footer dynamically loaded)
        const observer = new MutationObserver(() => {
            attachHandlers();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => {
            // Clean up event listeners
            const elements = document.querySelectorAll(selector);
            elements.forEach((element) => {
                const extElement = element as ExtendedHTMLElement;
                const handler = extElement[HANDLER_SYMBOL];
                if (handler) {
                    element.removeEventListener('click', handler);
                    delete extElement[HANDLER_SYMBOL];
                }
            });

            // Disconnect observer
            observer.disconnect();
        };
    }, [config.cookieSettingsSelector]);

    // This component doesn't render anything itself
    // It just adds click handlers to existing footer links
    return null;
}

export default CookieSettingsFooter;
