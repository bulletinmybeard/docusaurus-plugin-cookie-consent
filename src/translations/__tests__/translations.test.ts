import { en } from '../en';

describe('Translations', () => {
    it('should have all required translation keys', () => {
        const trans = en;

        // All translations
        expect(trans.title).toBeDefined();
        expect(trans.description).toBeDefined();
        expect(trans.acceptButton).toBeDefined();
        expect(trans.declineButton).toBeDefined();
        expect(trans.closeButtonAriaLabel).toBeDefined();
        expect(trans.consentHelp).toBeDefined();
        expect(trans.analyticsEnabled).toBeDefined();
        expect(trans.analyticsDisabled).toBeDefined();
        expect(trans.privacyPolicyLinkText).toBeDefined();
        expect(trans.cookieSettingsText).toBeDefined();
    });

    it('should have non-empty strings for all translations', () => {
        const checkNonEmpty = (obj: Record<string, unknown>, path = ''): void => {
            Object.entries(obj).forEach(([key, value]) => {
                const currentPath = path ? `${path}.${key}` : key;
                if (typeof value === 'string') {
                    expect(value.trim()).not.toBe('');
                } else if (typeof value === 'object' && value !== null) {
                    checkNonEmpty(value, currentPath);
                }
            });
        };

        checkNonEmpty(en);
    });

    it('should have proper English content', () => {
        // English should contain English text
        expect(en.title).toContain('Manage Consent');
        expect(en.acceptButton).toBe('Accept');
        expect(en.declineButton).toBe('Decline');
    });

    it('should not have any placeholder text', () => {
        const checkNoPlaceholders = (obj: Record<string, unknown>): void => {
            Object.values(obj).forEach((value) => {
                if (typeof value === 'string') {
                    expect(value).not.toMatch(/\{\{.*\}\}/); // No handlebars placeholders
                    expect(value).not.toMatch(/TODO|FIXME|XXX/i); // No TODO markers
                    expect(value).not.toMatch(/Lorem ipsum/i); // No Lorem ipsum
                } else if (typeof value === 'object' && value !== null) {
                    checkNoPlaceholders(value);
                }
            });
        };

        checkNoPlaceholders(en);
    });

    it('should have consistent button text formatting', () => {
        // Buttons should be properly capitalized
        expect(en.acceptButton).toMatch(/^[A-Z]/);
        expect(en.declineButton).toMatch(/^[A-Z]/);

        // Links should be properly formatted
        expect(en.privacyPolicyLinkText).toMatch(/^[A-Z]/);
    });
});
