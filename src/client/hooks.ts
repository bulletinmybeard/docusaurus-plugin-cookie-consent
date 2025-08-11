import { useState, useEffect } from 'react';
import { getConsentStatus, getConsentData, onConsentChange, canLoadAnalytics } from './index';
import type { ConsentData } from '../plugin/types';

/**
 * Hook to get and monitor consent status
 * @returns Current consent status (true/false/null) that updates in real-time
 */
export function useConsentStatus(): boolean | null {
    const [status, setStatus] = useState<boolean | null>(() => getConsentStatus());

    useEffect(() => {
        // Subscribe to changes
        const unsubscribe = onConsentChange((accepted) => {
            setStatus(accepted);
        });

        // Check current status in case it changed before mount
        setStatus(getConsentStatus());

        return unsubscribe;
    }, []);

    return status;
}

/**
 * Hook to get and monitor full consent data
 * @returns Current consent data that updates in real-time
 */
export function useConsentData(): ConsentData | null {
    const [data, setData] = useState<ConsentData | null>(() => getConsentData());

    useEffect(() => {
        // Subscribe to changes
        const unsubscribe = onConsentChange((_, consentData) => {
            setData(consentData);
        });

        // Check current data in case it changed before mount
        setData(getConsentData());

        return unsubscribe;
    }, []);

    return data;
}

/**
 * Hook to listen for consent changes
 * @param callback Function to call when consent changes
 */
export function useConsentListener(
    callback: (accepted: boolean, consentData: ConsentData) => void
): void {
    useEffect(() => {
        return onConsentChange(callback);
    }, [callback]);
}

/**
 * Hook to check if analytics can be loaded
 * @returns Boolean indicating if analytics scripts are allowed
 */
export function useAnalyticsReady(): boolean {
    const [ready, setReady] = useState(() => canLoadAnalytics());

    useEffect(() => {
        const unsubscribe = onConsentChange((accepted) => {
            setReady(accepted);
        });

        // Check current status
        setReady(canLoadAnalytics());

        return unsubscribe;
    }, []);

    return ready;
}

/**
 * Hook to check if consent has been given (any decision made)
 * @returns Boolean indicating if user has made a consent decision
 */
export function useHasConsentDecision(): boolean {
    const status = useConsentStatus();
    return status !== null;
}
