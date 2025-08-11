import { renderHook } from '@testing-library/react';
import { useTranslations } from '../useTranslations';
import { en } from '../../translations/en';

// Mock useLocale hook
jest.mock('../useLocale', () => ({
    useLocale: jest.fn(() => 'en')
}));

import { useLocale } from '../useLocale';
const mockUseLocale = useLocale as jest.MockedFunction<typeof useLocale>;

describe('useTranslations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseLocale.mockReturnValue('en');
    });

    it('should return English translations for en locale', () => {
        mockUseLocale.mockReturnValue('en');

        const { result } = renderHook(() => useTranslations());

        expect(result.current).toEqual(en);
        expect(result.current.title).toBe(en.title);
        expect(result.current.description).toBe(en.description);
    });

    it('should fallback to English for unsupported locales', () => {
        mockUseLocale.mockReturnValue('fr');

        const { result } = renderHook(() => useTranslations());

        expect(result.current).toEqual(en);
    });

    it('should fallback to English for empty locale', () => {
        mockUseLocale.mockReturnValue('');

        const { result } = renderHook(() => useTranslations());

        expect(result.current).toEqual(en);
    });

    it('should update translations when locale changes', () => {
        const { result, rerender } = renderHook(() => useTranslations());

        // Initial render with English
        expect(result.current).toEqual(en);

        // Change locale to another unsupported locale
        mockUseLocale.mockReturnValue('es');
        rerender();

        // Should still be English as fallback
        expect(result.current).toEqual(en);
    });

    it('should have all required translation keys', () => {
        const { result } = renderHook(() => useTranslations());
        const translations = result.current;

        // All translations
        expect(translations.title).toBeDefined();
        expect(translations.description).toBeDefined();
        expect(translations.acceptButton).toBeDefined();
        expect(translations.declineButton).toBeDefined();
        expect(translations.closeButtonAriaLabel).toBeDefined();
        expect(translations.consentHelp).toBeDefined();
        expect(translations.analyticsEnabled).toBeDefined();
        expect(translations.analyticsDisabled).toBeDefined();
        expect(translations.privacyPolicyLinkText).toBeDefined();
        expect(translations.cookieSettingsText).toBeDefined();
    });

    it('should handle case-insensitive locale matching', () => {
        mockUseLocale.mockReturnValue('EN');

        const { result } = renderHook(() => useTranslations());

        expect(result.current).toEqual(en);
    });

    it('should handle locale with region codes', () => {
        mockUseLocale.mockReturnValue('en-US');

        const { result } = renderHook(() => useTranslations());

        expect(result.current).toEqual(en);
    });

    it('should return consistent content for same locale', () => {
        const { result, rerender } = renderHook(() => useTranslations());

        const firstRender = result.current;
        rerender();
        const secondRender = result.current;

        // Content should be the same even if reference might differ
        expect(secondRender).toEqual(firstRender);
    });
});
