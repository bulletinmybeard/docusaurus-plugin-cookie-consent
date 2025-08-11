import type { CustomProvider } from '../plugin/types';
import { logInfo, logWarn, logError, logDebug } from './logger';

/**
 * Waits for global variables to be available
 */
async function waitForGlobals(globals: string[], timeout: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const allGlobalsAvailable = globals.every((globalName) => {
            try {
                const parts = globalName.split('.');
                let obj: unknown = window;
                for (const part of parts) {
                    obj = (obj as Record<string, unknown>)[part];
                    if (obj === undefined) {
                        return false;
                    }
                }
                return true;
            } catch {
                return false;
            }
        });

        if (allGlobalsAvailable) {
            return true;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return false;
}

/**
 * Loads a script using fetch with headers support
 */
async function loadScriptWithFetch(provider: CustomProvider): Promise<void> {
    if (!provider.src) {
        throw new Error('Script src is required for fetch loading');
    }

    const fetchOptions: RequestInit = {
        method: 'GET',
        ...provider.options?.fetchOptions
    };

    logDebug('Fetching script with custom options', {
        context: 'CustomProvider',
        details: {
            src: provider.src,
            headers: provider.options?.fetchOptions?.headers
        }
    });

    const response = await fetch(provider.src, fetchOptions);
    if (!response.ok) {
        throw new Error(`Failed to fetch script: ${response.status} ${response.statusText}`);
    }

    const scriptContent = await response.text();
    const script = document.createElement('script');
    script.textContent = scriptContent;

    if (provider.options?.nonce) {
        script.nonce = provider.options.nonce;
    }

    const target = getTargetElement(provider.options?.placement);
    target.appendChild(script);

    logInfo('Script loaded via fetch and injected', {
        context: 'CustomProvider',
        details: { src: provider.src }
    });
}

/**
 * Loads an inline script
 */
function loadInlineScript(provider: CustomProvider): void {
    if (!provider.inlineScript) {
        throw new Error('Inline script content is required for inline loading');
    }

    const script = document.createElement('script');
    script.textContent = provider.inlineScript;

    if (provider.options?.nonce) {
        script.nonce = provider.options.nonce;
    }

    const target = getTargetElement(provider.options?.placement);
    target.appendChild(script);

    logInfo('Inline script injected', {
        context: 'CustomProvider',
        details: { placement: provider.options?.placement || 'head' }
    });
}

/**
 * Loads a script using traditional script tag
 */
function loadScriptTag(provider: CustomProvider): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!provider.src) {
            reject(new Error('Script src is required for script-tag loading'));
            return;
        }

        const script = document.createElement('script');
        script.src = provider.src;

        script.async = provider.options?.async ?? true;
        if (provider.options?.defer) {
            script.defer = true;
        }

        if (provider.options?.crossorigin) {
            script.crossOrigin = provider.options.crossorigin;
        }
        if (provider.options?.integrity) {
            script.integrity = provider.options.integrity;
        }
        if (provider.options?.nonce) {
            script.nonce = provider.options.nonce;
        }
        if (provider.options?.referrerPolicy) {
            script.referrerPolicy = provider.options.referrerPolicy;
        }

        if (provider.options?.attributes) {
            Object.entries(provider.options.attributes).forEach(([key, value]) => {
                script.setAttribute(key, value);
            });
        }

        if (provider.options) {
            Object.entries(provider.options).forEach(([key, value]) => {
                if (
                    ![
                        'async',
                        'defer',
                        'crossorigin',
                        'integrity',
                        'nonce',
                        'referrerPolicy',
                        'attributes',
                        'fetchOptions',
                        'onBeforeLoad',
                        'onLoad',
                        'onError',
                        'initCode',
                        'retry',
                        'timeout',
                        'cookies',
                        'waitForGlobals',
                        'placement'
                    ].includes(key) &&
                    typeof value === 'string'
                ) {
                    script.setAttribute(key, value);
                }
            });
        }

        script.onload = () => {
            logInfo('Script loaded successfully', {
                context: 'CustomProvider',
                details: { src: provider.src }
            });
            resolve();
        };

        script.onerror = () => {
            const error = new Error(`Failed to load script: ${provider.src}`);
            logError('Script loading failed', {
                context: 'CustomProvider',
                details: { src: provider.src, error: error.message }
            });
            reject(error);
        };

        const target = getTargetElement(provider.options?.placement);
        target.appendChild(script);

        logDebug('Script tag created and appended', {
            context: 'CustomProvider',
            details: {
                src: provider.src,
                placement: provider.options?.placement || 'head'
            }
        });
    });
}

/**
 * Gets the target element for script placement
 */
function getTargetElement(placement?: string): HTMLElement {
    switch (placement) {
        case 'body':
            return document.body;
        case 'body-end':
            return document.body;
        case 'head':
        default:
            return document.head;
    }
}

/**
 * Executes initialization code
 */
async function executeInitCode(initCode: string | (() => void)): Promise<void> {
    try {
        if (typeof initCode === 'string') {
            const fn = new Function(initCode);
            await fn();
        } else {
            await initCode();
        }
        logInfo('Initialization code executed', { context: 'CustomProvider' });
    } catch (error) {
        logError('Failed to execute initialization code', {
            context: 'CustomProvider',
            details: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
        throw error;
    }
}

/**
 * Main function to load a custom provider with all features
 */
export async function loadCustomProvider(provider: CustomProvider): Promise<void> {
    const { options } = provider;
    const timeout = options?.timeout || 10000;
    const retryConfig = {
        attempts: options?.retry?.attempts || 1,
        delay: options?.retry?.delay || 1000,
        backoff: options?.retry?.backoff ?? false
    };

    async function attemptLoad(): Promise<void> {
        if (options?.onBeforeLoad) {
            logDebug('Calling onBeforeLoad callback', { context: 'CustomProvider' });
            await options.onBeforeLoad();
        }

        const loadMethod = provider.loadMethod || (provider.inlineScript ? 'inline' : 'script-tag');
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Script loading timed out after ${timeout}ms`));
            }, timeout);
        });

        const loadPromise = (async () => {
            switch (loadMethod) {
                case 'fetch':
                    await loadScriptWithFetch(provider);
                    break;

                case 'inline':
                    loadInlineScript(provider);
                    break;

                case 'script-tag':
                default:
                    await loadScriptTag(provider);
                    break;
            }

            if (options?.waitForGlobals && options.waitForGlobals.length > 0) {
                logDebug('Waiting for global variables', {
                    context: 'CustomProvider',
                    details: { globals: options.waitForGlobals }
                });

                const globalsAvailable = await waitForGlobals(options.waitForGlobals, timeout);
                if (!globalsAvailable) {
                    throw new Error(
                        `Global variables not available: ${options.waitForGlobals.join(', ')}`
                    );
                }

                logInfo('Global variables are now available', {
                    context: 'CustomProvider',
                    details: { globals: options.waitForGlobals }
                });
            }

            if (options?.initCode) {
                await executeInitCode(options.initCode);
            }
        })();

        await Promise.race([loadPromise, timeoutPromise]);

        if (options?.onLoad) {
            logDebug('Calling onLoad callback', { context: 'CustomProvider' });
            options.onLoad();
        }
    }

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= retryConfig.attempts; attempt++) {
        try {
            logDebug(`Loading custom provider (attempt ${attempt}/${retryConfig.attempts})`, {
                context: 'CustomProvider',
                details: {
                    src: provider.src,
                    inlineScript: !!provider.inlineScript,
                    loadMethod: provider.loadMethod
                }
            });

            await attemptLoad();
            return; // Success!
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');

            logWarn(`Provider loading failed (attempt ${attempt}/${retryConfig.attempts})`, {
                context: 'CustomProvider',
                details: {
                    error: lastError.message,
                    src: provider.src
                }
            });

            if (attempt === retryConfig.attempts) {
                if (options?.onError) {
                    logDebug('Calling onError callback', { context: 'CustomProvider' });
                    options.onError(lastError);
                }
            } else {
                const delay = retryConfig.backoff
                    ? retryConfig.delay * Math.pow(2, attempt - 1)
                    : retryConfig.delay;

                logDebug(`Retrying in ${delay}ms`, { context: 'CustomProvider' });
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    if (lastError) {
        throw lastError;
    }
}
