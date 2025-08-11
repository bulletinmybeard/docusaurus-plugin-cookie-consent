import type { CookieConsentTranslations } from '../plugin/types';

export const en: CookieConsentTranslations = {
    // Modal texts
    title: 'Manage Consent',
    description:
        'This site uses cookies and similar technologies to store information on your device and better understand how you interact with the content.',
    consentHelp: 'Your consent helps to provide a better experience.',

    // Status messages
    analyticsEnabled: '✓ Analytics tracking enabled',
    analyticsDisabled: '✗ Analytics tracking disabled',

    // Header status indicators
    trackingEnabled: '(tracking enabled)',
    trackingDisabled: '(tracking disabled)',
    trackingPartial: '(partial tracking)',

    // No providers messages
    noProvidersInfo: 'No analytics providers are configured for this site.',
    noTrackingInfo: 'This site does not use any tracking or analytics services.',

    // Buttons
    acceptButton: 'Accept',
    declineButton: 'Decline',
    closeButtonAriaLabel: 'Close dialog',

    // Links
    privacyPolicyLinkText: 'Privacy Policy',
    cookieSettingsText: 'Cookie Settings',

    // Provider selection
    providerSelectionTitle: 'Please select which services you allow to collect data:',
    acceptAllButton: 'Accept All',
    rejectAllButton: 'Reject All',
    saveMyChoicesButton: 'Save My Choices',
    closeButton: 'Close',
    selectAll: 'Select All',
    choicesSaved: 'Your choices have been saved. You can change them anytime.',
    choicesCanceled: 'No changes were made.',

    // Default provider names and descriptions
    providers: {
        google: {
            name: 'Google Analytics',
            description:
                'Provides insights into how visitors interact with our content to help us improve documentation quality and usability'
        },
        gtm: {
            name: 'Google Tag Manager',
            description:
                'Helps manage and deploy marketing and analytics tags efficiently without requiring code changes'
        },
        hotjar: {
            name: 'Hotjar',
            description:
                'Captures anonymized session data like clicks, scrolls, and heatmaps to help us enhance your user experience'
        },
        custom: {
            name: 'Custom Provider',
            description: 'Other third-party tracking service'
        }
    }
};
