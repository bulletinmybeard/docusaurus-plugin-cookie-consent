import React, { useState, useEffect } from 'react';
import { usePluginConfig } from '../../hooks/usePluginConfig';
import { checkAnalyticsStatus, sendTestEvent } from '../../utils/analyticsHelpers';
import { logInfo, logDebug } from '../../utils/logger';
import styles from './CookieDebugWidget.module.css';

export function CookieDebugWidget(): React.JSX.Element | null {
    const config = usePluginConfig();
    const [showDebug, setShowDebug] = useState(false);
    const [analyticsStatus, setAnalyticsStatus] = useState<ReturnType<typeof checkAnalyticsStatus>>(
        []
    );

    // Check if debug panel is enabled
    const debugPanelEnabled = config.enableDebugPanel;

    useEffect(() => {
        if (!debugPanelEnabled || typeof window === 'undefined') {
            return;
        }

        // Update analytics status every second
        const updateStatus = (): void => {
            const enabledProviders = config.providers?.filter((p) => p.enabled !== false) || [];
            setAnalyticsStatus(checkAnalyticsStatus(enabledProviders));
        };

        updateStatus();
        const interval = setInterval(updateStatus, 1000);

        return () => clearInterval(interval);
    }, [config.providers, debugPanelEnabled]);

    if (!debugPanelEnabled || typeof window === 'undefined') {
        return null;
    }

    const handleSendTestEvent = (providerType: string): void => {
        const success = sendTestEvent(providerType);
        if (success) {
            logInfo(`Test event sent to ${providerType}`, {
                context: 'Debug',
                details: { timestamp: Date.now() }
            });
            alert(`Test event sent! Check ${providerType} dashboard.`);
        } else {
            alert(`Failed to send test event. ${providerType} may not be loaded yet.`);
        }
    };

    const handleResetConsent = (): void => {
        if (window.CookieConsent?.reset) {
            window.CookieConsent.reset();
            logInfo('Cookie consent reset triggered', { context: 'Debug' });
        }
    };

    const handleClearConsent = (): void => {
        if (confirm('This will clear all saved consent data. Are you sure?')) {
            localStorage.removeItem(config.cookieName);
            window.location.reload();
        }
    };

    return (
        <>
            {/* Floating debug button */}
            <button
                className={styles.debugFloatingButton}
                onClick={() => setShowDebug(!showDebug)}
                title="Cookie Consent Debug Mode"
            >
                🐞
            </button>

            {/* Debug panel */}
            {showDebug && (
                <div className={styles.debugPanel}>
                    <div className={styles.debugHeader}>
                        <h3>🐞 Cookie Consent Debug</h3>
                        <button
                            className={styles.debugCloseButton}
                            onClick={() => setShowDebug(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className={styles.debugContent}>
                        {/* Quick Actions */}
                        <div className={styles.debugSection}>
                            <h4>Quick Actions</h4>
                            <div className={styles.debugActions}>
                                <button onClick={handleResetConsent}>Show Consent Modal</button>
                                <button onClick={handleClearConsent}>Clear All Consent Data</button>
                            </div>
                        </div>

                        {/* Analytics Status */}
                        <div className={styles.debugSection}>
                            <h4>Analytics Status</h4>
                            {analyticsStatus.map((status, index) => (
                                <div key={index} className={styles.debugProvider}>
                                    <div className={styles.debugProviderHeader}>
                                        <strong>{status.provider.type.toUpperCase()}</strong>
                                        <span
                                            className={
                                                status.loaded
                                                    ? styles.statusLoaded
                                                    : styles.statusNotLoaded
                                            }
                                        >
                                            {status.loaded ? '✅ Loaded' : '❌ Not Loaded'}
                                        </span>
                                    </div>

                                    <div className={styles.debugProviderDetails}>
                                        {Object.entries(status.details).map(([key, value]) => (
                                            <div key={key} className={styles.debugDetail}>
                                                <span className={styles.debugKey}>{key}:</span>
                                                <span className={styles.debugValue}>
                                                    {typeof value === 'boolean'
                                                        ? value
                                                            ? '✅'
                                                            : '❌'
                                                        : String(value)}
                                                </span>
                                            </div>
                                        ))}

                                        {status.errors &&
                                            status.errors.map((error, i) => (
                                                <div key={i} className={styles.debugError}>
                                                    ⚠️ {error}
                                                </div>
                                            ))}
                                    </div>

                                    {status.loaded && (
                                        <button
                                            className={styles.debugTestButton}
                                            onClick={() =>
                                                handleSendTestEvent(status.provider.type)
                                            }
                                        >
                                            Send Test Event
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Console Logs */}
                        <div className={styles.debugSection}>
                            <h4>Debug Console</h4>
                            <button
                                onClick={() => {
                                    logDebug('=== Cookie Consent Debug Info ===', {
                                        details: {
                                            config,
                                            analyticsStatus,
                                            'window.gtag': window.gtag,
                                            'window.dataLayer': window.dataLayer,
                                            'window.hj': window.hj,
                                            'window._hjSettings': window._hjSettings,
                                            savedConsent: localStorage.getItem(config.cookieName)
                                        }
                                    });
                                    alert('Debug info logged to console!');
                                }}
                            >
                                Log Debug Info to Console
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default CookieDebugWidget;
