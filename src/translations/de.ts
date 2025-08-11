import type { CookieConsentTranslations } from '../plugin/types';

export const de: CookieConsentTranslations = {
    // Modal texts
    title: 'Einwilligungen verwalten',
    description:
        'Diese Website verwendet Cookies und ähnliche Technologien, um Informationen auf Ihrem Gerät zu speichern und besser zu verstehen, wie Sie mit unseren Inhalten interagieren.',
    consentHelp: 'Ihre Einwilligung hilft uns, eine bessere Erfahrung zu bieten.',

    // Status messages
    analyticsEnabled: '✓ Analytics-Tracking aktiviert',
    analyticsDisabled: '✗ Analytics-Tracking deaktiviert',

    // Header status indicators
    trackingEnabled: '(Tracking aktiviert)',
    trackingDisabled: '(Tracking deaktiviert)',
    trackingPartial: '(Teilweises Tracking)',

    // No providers messages
    noProvidersInfo: 'Für diese Website sind keine Analytics-Anbieter konfiguriert.',
    noTrackingInfo: 'Diese Website verwendet keine Tracking- oder Analytics-Dienste.',

    // Buttons
    acceptButton: 'Akzeptieren',
    declineButton: 'Ablehnen',
    closeButtonAriaLabel: 'Dialog schließen',

    // Links
    privacyPolicyLinkText: 'Datenschutzerklärung',
    cookieSettingsText: 'Cookie-Einstellungen',

    // Provider selection
    providerSelectionTitle: 'Bitte wählen Sie, welche Dienste Daten erfassen dürfen:',
    acceptAllButton: 'Alle akzeptieren',
    rejectAllButton: 'Alle ablehnen',
    saveMyChoicesButton: 'Auswahl speichern',
    closeButton: 'Schließen',
    selectAll: 'Alle auswählen',

    // Feedback messages
    choicesSaved: 'Ihre Auswahl wurde gespeichert. Sie können diese jederzeit ändern.',
    choicesCanceled: 'Es wurden keine Änderungen vorgenommen.',

    // Default provider names and descriptions
    providers: {
        google: {
            name: 'Google Analytics',
            description:
                'Bietet Einblicke in die Interaktion von Besuchern mit unseren Inhalten, um die Qualität und Benutzerfreundlichkeit der Dokumentation zu verbessern'
        },
        gtm: {
            name: 'Google Tag Manager',
            description:
                'Hilft bei der effizienten Verwaltung und Bereitstellung von Marketing- und Analytics-Tags ohne Code-Änderungen'
        },
        hotjar: {
            name: 'Hotjar',
            description:
                'Erfasst anonymisierte Sitzungsdaten wie Klicks, Scrolls und Heatmaps, um Ihre Benutzererfahrung zu verbessern'
        },
        custom: {
            name: 'Benutzerdefinierter Anbieter',
            description: 'Anderer Drittanbieter-Tracking-Dienst'
        }
    }
};
