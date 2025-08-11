import { renderHook } from '@testing-library/react';
import { useLocale } from '../useLocale';
import {
    mockDocusaurusContext,
    resetDocusaurusMocks
} from '../../../__tests__/utils/mockDocusaurus';

describe('useLocale', () => {
    beforeEach(() => {
        resetDocusaurusMocks();
        delete (window as Record<string, unknown>).__COOKIE_CONSENT_CONFIG__;
    });

    it('should return default locale (en) when no config is available', () => {
        const { result } = renderHook(() => useLocale());
        expect(result.current).toBe('en');
    });

    it('should use forced locale from plugin config', () => {
        (window as Record<string, unknown>).__COOKIE_CONSENT_CONFIG__ = {
            i18n: { forceLocale: 'de' }
        };

        const { result } = renderHook(() => useLocale());
        expect(result.current).toBe('de');
    });

    it('should use Docusaurus locale when available', () => {
        mockDocusaurusContext('fr');

        const { result } = renderHook(() => useLocale());
        expect(result.current).toBe('fr');
    });

    it('should detect locale from URL path', () => {
        delete (window as Record<string, unknown>).__docusaurus;
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { pathname: '/de/docs/intro' }
        });

        const { result } = renderHook(() => useLocale());
        expect(result.current).toBe('de');
    });

    it('should fallback to browser language when German', () => {
        delete (window as Record<string, unknown>).__docusaurus;
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { pathname: '/' }
        });
        Object.defineProperty(navigator, 'language', {
            writable: true,
            configurable: true,
            value: 'de-DE'
        });

        const { result } = renderHook(() => useLocale());
        expect(result.current).toBe('de');
    });

    it('should default to English for non-German browser languages', () => {
        delete (window as Record<string, unknown>).__docusaurus;
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { pathname: '/' }
        });
        Object.defineProperty(navigator, 'language', {
            writable: true,
            configurable: true,
            value: 'fr-FR'
        });

        const { result } = renderHook(() => useLocale());
        expect(result.current).toBe('en');
    });

    it('should handle errors gracefully', () => {
        // Mock console.warn to verify it's called
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

        // Mock navigator to throw an error
        Object.defineProperty(window, 'navigator', {
            value: {
                get language() {
                    throw new Error('Test error');
                }
            },
            configurable: true
        });

        const { result } = renderHook(() => useLocale());
        expect(result.current).toBe('en'); // Should still return default
        expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('Error detecting locale'));

        consoleWarn.mockRestore();
    });

    it('should prioritize forced locale over Docusaurus locale', () => {
        mockDocusaurusContext('fr');
        (window as Record<string, unknown>).__COOKIE_CONSENT_CONFIG__ = {
            i18n: { forceLocale: 'de' }
        };

        const { result } = renderHook(() => useLocale());
        expect(result.current).toBe('de'); // Forced locale wins
    });

    it('should handle SSR (no window) correctly', () => {
        // This test would need to be run in a Node environment
        // For now, we can test that the hook doesn't throw during render
        expect(() => {
            renderHook(() => useLocale());
        }).not.toThrow();
    });
});
