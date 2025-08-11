/**
 * Logging utility for Cookie Consent plugin
 * Provides consistent logging with proper formatting and log levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
    context?: string;
    details?: Record<string, unknown>;
}

/**
 * Logs a message with the specified level
 * @param level - The log level (debug, info, warn, error)
 * @param message - The message to log (string or Error object)
 * @param options - Optional context and details
 */
export function log(level: LogLevel, message: string | Error, options: LogOptions = {}): void {
    const prefix = '[CookieConsent]';
    const { context, details } = options;
    const contextStr = context ? ` ${context}:` : '';

    // Format the main message
    let formattedMessage: string;
    if (message instanceof Error) {
        formattedMessage = `${prefix}${contextStr} ${message.message}`;
        // Include stack trace for errors in development
        if (process.env.NODE_ENV === 'development' && message.stack) {
            formattedMessage += `\n${message.stack}`;
        }
    } else {
        formattedMessage = `${prefix}${contextStr} ${message}`;
    }

    // Add details if provided
    if (details && Object.keys(details).length > 0) {
        formattedMessage += `\nDetails: ${JSON.stringify(details, null, 2)}`;
    }

    // Log based on level
    switch (level) {
        case 'debug':
            // Only log debug messages in development
            if (process.env.NODE_ENV === 'development') {
                console.log(formattedMessage);
            }
            break;
        case 'info':
            console.log(formattedMessage);
            break;
        case 'warn':
            console.warn(formattedMessage);
            break;
        case 'error':
            // We use console.error for error level, but the plugin should still continue
            console.error(formattedMessage);
            break;
    }
}

// Convenience functions for common log levels
export const logDebug = (message: string | Error, options?: LogOptions): void =>
    log('debug', message, options);

export const logInfo = (message: string | Error, options?: LogOptions): void =>
    log('info', message, options);

export const logWarn = (message: string | Error, options?: LogOptions): void =>
    log('warn', message, options);

export const logError = (message: string | Error, options?: LogOptions): void =>
    log('error', message, options);
