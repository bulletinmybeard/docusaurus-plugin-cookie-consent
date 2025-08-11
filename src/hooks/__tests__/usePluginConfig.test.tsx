import React from 'react';
import { renderHook } from '@testing-library/react';
import { usePluginConfig, PluginConfigContext } from '../usePluginConfig';
import { mockConfig } from '../../../__tests__/utils/testUtils';
import type { CookieConsentConfig } from '../../plugin/types';

describe('usePluginConfig', () => {
    it('should return config from context', () => {
        const wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
            <PluginConfigContext.Provider value={mockConfig}>
                {children}
            </PluginConfigContext.Provider>
        );

        const { result } = renderHook(() => usePluginConfig(), { wrapper });

        expect(result.current).toEqual(mockConfig);
        expect(result.current.cookieName).toBe(mockConfig.cookieName);
        expect(result.current.providers).toEqual(mockConfig.providers);
    });

    it('should return defaults and warn when used outside of provider', () => {
        // Suppress console.warn for this test
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

        const { result } = renderHook(() => usePluginConfig());

        expect(consoleWarn).toHaveBeenCalledWith(
            expect.stringContaining('Plugin config context not found, using defaults')
        );
        expect(result.current).toBeDefined();
        expect(result.current.cookieName).toBe('docusaurus_cookie_consent');

        consoleWarn.mockRestore();
    });

    it('should update when context value changes', () => {
        const customConfig: CookieConsentConfig = {
            ...mockConfig,
            cookieName: 'updated_cookie',
            cookieExpiry: 180
        };

        let currentConfig = mockConfig;

        const wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
            <PluginConfigContext.Provider value={currentConfig}>
                {children}
            </PluginConfigContext.Provider>
        );

        const { result, rerender } = renderHook(() => usePluginConfig(), { wrapper });

        // Initial config
        expect(result.current.cookieName).toBe('test_cookie_consent');

        // Update config
        currentConfig = customConfig;
        rerender();

        expect(result.current.cookieName).toBe('updated_cookie');
        expect(result.current.cookieExpiry).toBe(180);
    });

    it('should handle partial config updates', () => {
        const partialConfig: Partial<CookieConsentConfig> = {
            position: 'bottom',
            features: {
                ...mockConfig.features,
                sillyDeclineButton: true
            }
        };

        const mergedConfig = { ...mockConfig, ...partialConfig };

        const wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
            <PluginConfigContext.Provider value={mergedConfig}>
                {children}
            </PluginConfigContext.Provider>
        );

        const { result } = renderHook(() => usePluginConfig(), { wrapper });

        expect(result.current.position).toBe('bottom');
        expect(result.current.features.sillyDeclineButton).toBe(true);
        expect(result.current.cookieName).toBe(mockConfig.cookieName); // Unchanged
    });

    it('should provide stable object reference when config does not change', () => {
        const wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
            <PluginConfigContext.Provider value={mockConfig}>
                {children}
            </PluginConfigContext.Provider>
        );

        const { result, rerender } = renderHook(() => usePluginConfig(), { wrapper });

        const firstRender = result.current;
        rerender();
        const secondRender = result.current;

        expect(firstRender).toBe(secondRender); // Same reference
    });

    it('should handle null context value', () => {
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

        const wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
            <PluginConfigContext.Provider value={null as unknown as CookieConsentConfig}>
                {children}
            </PluginConfigContext.Provider>
        );

        const { result } = renderHook(() => usePluginConfig(), { wrapper });

        expect(consoleWarn).toHaveBeenCalledWith(
            expect.stringContaining('Plugin config context not found, using defaults')
        );
        expect(result.current).toBeDefined();
        expect(result.current.cookieName).toBe('docusaurus_cookie_consent');

        consoleWarn.mockRestore();
    });
});
