import type { ConsentData } from '../../plugin/types';

// State shape for the consent component
export interface ConsentState {
    showBanner: boolean;
    consentStatus: boolean | null;
    providerConsents: Record<string, boolean>;
    savedProviderConsents: Record<string, boolean>;
    loadedProviders: Set<string>;
    selectAllToggle: boolean;
    showDebugPanel: boolean;
    feedbackMessage: string | null;
    feedbackType: 'success' | 'info' | 'error' | null;
}

/**
 * Action types for the consent reducer
 * @typedef {Object} ConsentAction
 */
export type ConsentAction =
    | { type: 'SHOW_BANNER'; payload: boolean }
    | { type: 'SET_CONSENT_STATUS'; payload: boolean | null }
    | { type: 'SET_PROVIDER_CONSENTS'; payload: Record<string, boolean> }
    | { type: 'UPDATE_PROVIDER_CONSENT'; payload: { provider: string; consent: boolean } }
    | { type: 'SET_SAVED_PROVIDER_CONSENTS'; payload: Record<string, boolean> }
    | { type: 'ADD_LOADED_PROVIDER'; payload: string }
    | { type: 'SET_LOADED_PROVIDERS'; payload: Set<string> }
    | { type: 'SET_SELECT_ALL_TOGGLE'; payload: boolean }
    | { type: 'TOGGLE_DEBUG_PANEL' }
    | { type: 'SET_DEBUG_PANEL'; payload: boolean }
    | { type: 'LOAD_SAVED_CONSENTS'; payload: ConsentData | null }
    | { type: 'RESET_CONSENT' }
    | { type: 'ACCEPT_ALL'; payload: string[] }
    | { type: 'REJECT_ALL' }
    | { type: 'BATCH_UPDATE'; payload: Partial<ConsentState> }
    | { type: 'SHOW_FEEDBACK'; payload: { message: string; type: 'success' | 'info' | 'error' } }
    | { type: 'HIDE_FEEDBACK' };

/**
 * Initial state for the consent component
 * @type {ConsentState}
 */
export const initialConsentState: ConsentState = {
    showBanner: false,
    consentStatus: null,
    providerConsents: {},
    savedProviderConsents: {},
    loadedProviders: new Set(),
    selectAllToggle: false,
    showDebugPanel: false,
    feedbackMessage: null,
    feedbackType: null
};

/**
 * Reducer to handle actions in the consent component
 * @param {ConsentState} state
 * @param {ConsentAction} action
 * @returns {ConsentState}
 */
export function consentReducer(state: ConsentState, action: ConsentAction): ConsentState {
    switch (action.type) {
        case 'SHOW_BANNER':
            return { ...state, showBanner: action.payload };

        case 'SET_CONSENT_STATUS':
            return { ...state, consentStatus: action.payload };

        case 'SET_PROVIDER_CONSENTS':
            return { ...state, providerConsents: action.payload };

        case 'UPDATE_PROVIDER_CONSENT':
            return {
                ...state,
                providerConsents: {
                    ...state.providerConsents,
                    [action.payload.provider]: action.payload.consent
                }
            };

        case 'SET_SAVED_PROVIDER_CONSENTS':
            return { ...state, savedProviderConsents: action.payload };

        case 'ADD_LOADED_PROVIDER':
            return {
                ...state,
                loadedProviders: new Set([...state.loadedProviders, action.payload])
            };

        case 'SET_LOADED_PROVIDERS':
            return { ...state, loadedProviders: action.payload };

        case 'SET_SELECT_ALL_TOGGLE':
            return { ...state, selectAllToggle: action.payload };

        case 'TOGGLE_DEBUG_PANEL':
            return { ...state, showDebugPanel: !state.showDebugPanel };

        case 'SET_DEBUG_PANEL':
            return { ...state, showDebugPanel: action.payload };

        case 'LOAD_SAVED_CONSENTS': {
            if (!action.payload) {
                return state;
            }

            const providers = action.payload.providers || {};
            const hasProviders = Object.keys(providers).length > 0;

            if (!action.payload.providers && action.payload.accepted) {
                return {
                    ...state,
                    providerConsents: {},
                    savedProviderConsents: {},
                    selectAllToggle: true
                };
            }

            return {
                ...state,
                providerConsents: providers,
                savedProviderConsents: providers,
                selectAllToggle: hasProviders && Object.values(providers).every((v) => v === true)
            };
        }

        case 'RESET_CONSENT':
            return {
                ...initialConsentState,
                showBanner: true
            };

        case 'ACCEPT_ALL': {
            const acceptedProviders: Record<string, boolean> = {};
            action.payload.forEach((provider) => {
                acceptedProviders[provider] = true;
            });
            return {
                ...state,
                providerConsents: acceptedProviders,
                savedProviderConsents: acceptedProviders,
                selectAllToggle: true,
                showBanner: false
            };
        }

        case 'REJECT_ALL':
            return {
                ...state,
                providerConsents: {},
                savedProviderConsents: {},
                selectAllToggle: false,
                showBanner: false
            };

        case 'BATCH_UPDATE':
            return {
                ...state,
                ...action.payload,
                // Preserve Set type for loadedProviders if included in batch
                loadedProviders: action.payload.loadedProviders || state.loadedProviders
            };

        case 'SHOW_FEEDBACK':
            return {
                ...state,
                feedbackMessage: action.payload.message,
                feedbackType: action.payload.type
            };

        case 'HIDE_FEEDBACK':
            return {
                ...state,
                feedbackMessage: null,
                feedbackType: null
            };

        default:
            return state;
    }
}

/**
 * Action creators for the consent reducer
 * @type {Object}
 */
export const ConsentActions = {
    showBanner: (show: boolean): ConsentAction => ({ type: 'SHOW_BANNER', payload: show }),
    setConsentStatus: (status: boolean | null): ConsentAction => ({
        type: 'SET_CONSENT_STATUS',
        payload: status
    }),
    setProviderConsents: (consents: Record<string, boolean>): ConsentAction => ({
        type: 'SET_PROVIDER_CONSENTS',
        payload: consents
    }),
    updateProviderConsent: (provider: string, consent: boolean): ConsentAction => ({
        type: 'UPDATE_PROVIDER_CONSENT',
        payload: { provider, consent }
    }),
    setSavedProviderConsents: (consents: Record<string, boolean>): ConsentAction => ({
        type: 'SET_SAVED_PROVIDER_CONSENTS',
        payload: consents
    }),
    addLoadedProvider: (provider: string): ConsentAction => ({
        type: 'ADD_LOADED_PROVIDER',
        payload: provider
    }),
    setLoadedProviders: (providers: Set<string>): ConsentAction => ({
        type: 'SET_LOADED_PROVIDERS',
        payload: providers
    }),
    setSelectAllToggle: (selected: boolean): ConsentAction => ({
        type: 'SET_SELECT_ALL_TOGGLE',
        payload: selected
    }),
    toggleDebugPanel: (): ConsentAction => ({ type: 'TOGGLE_DEBUG_PANEL' }),
    setDebugPanel: (show: boolean): ConsentAction => ({ type: 'SET_DEBUG_PANEL', payload: show }),
    loadSavedConsents: (data: ConsentData | null): ConsentAction => ({
        type: 'LOAD_SAVED_CONSENTS',
        payload: data
    }),
    resetConsent: (): ConsentAction => ({ type: 'RESET_CONSENT' }),
    acceptAll: (providers: string[]): ConsentAction => ({ type: 'ACCEPT_ALL', payload: providers }),
    rejectAll: (): ConsentAction => ({ type: 'REJECT_ALL' }),
    batchUpdate: (updates: Partial<ConsentState>): ConsentAction => ({
        type: 'BATCH_UPDATE',
        payload: updates
    }),
    showFeedback: (
        message: string,
        type: 'success' | 'info' | 'error' = 'info'
    ): ConsentAction => ({
        type: 'SHOW_FEEDBACK',
        payload: { message, type }
    }),
    hideFeedback: (): ConsentAction => ({ type: 'HIDE_FEEDBACK' })
};
