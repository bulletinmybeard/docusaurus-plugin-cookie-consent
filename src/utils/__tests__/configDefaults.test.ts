import { mergeWithDefaults, defaultPluginOptions } from '../configDefaults';
import type { CookieConsentPluginOptions } from '../../plugin/types';

describe('configDefaults', () => {
    describe('defaultPluginOptions', () => {
        it('should have all required default values', () => {
            expect(defaultPluginOptions.privacyPolicy.url).toBe('/privacy-policy-demo');
            expect(defaultPluginOptions.cookieConfig.name).toBe('docusaurus_cookie_consent');
            expect(defaultPluginOptions.cookieConfig.expiry).toBe(365);
            expect(defaultPluginOptions.features.sillyDeclineButton).toBe(false);
            expect(defaultPluginOptions.theme.position).toBe('center');
            expect(defaultPluginOptions.i18n.defaultLocale).toBe('en');
        });
    });

    describe('mergeWithDefaults', () => {
        it('should return complete config with defaults when no options provided', () => {
            const config = mergeWithDefaults();

            expect(config.cookieName).toBe('docusaurus_cookie_consent');
            expect(config.cookieExpiry).toBe(365);
            expect(config.position).toBe('center');
            expect(config.privacyPolicyUrl).toBe('/privacy-policy-demo');
            expect(config.features.sillyDeclineButton).toBe(false);
        });

        it('should override defaults with user options', () => {
            const options: CookieConsentPluginOptions = {
                cookieConfig: {
                    name: 'custom_cookie',
                    expiry: 30
                },
                theme: {
                    position: 'bottom'
                }
            };

            const config = mergeWithDefaults(options);

            expect(config.cookieName).toBe('custom_cookie');
            expect(config.cookieExpiry).toBe(30);
            expect(config.position).toBe('bottom');
        });

        it('should merge nested objects properly', () => {
            const options: CookieConsentPluginOptions = {
                privacyPolicy: {
                    url: '/custom-privacy'
                },
                features: {
                    sillyDeclineButton: true
                }
            };

            const config = mergeWithDefaults(options);

            expect(config.privacyPolicyUrl).toBe('/custom-privacy');
            expect(config.features.sillyDeclineButton).toBe(true);
        });

        it('should handle analytics configuration correctly', () => {
            // No analytics - should be empty array
            const config1 = mergeWithDefaults({});
            expect(config1.providers).toEqual([]);

            // With single Google Analytics provider
            const config2 = mergeWithDefaults({
                providers: [
                    {
                        type: 'google',
                        id: 'G-TEST123'
                    }
                ]
            });
            expect(config2.providers).toHaveLength(1);
            expect(config2.providers[0].type).toBe('google');
            expect(config2.providers[0].id).toBe('G-TEST123');

            // With multiple providers
            const config3 = mergeWithDefaults({
                providers: [
                    {
                        type: 'google',
                        id: 'G-TEST123'
                    },
                    {
                        type: 'hotjar',
                        id: 1234567
                    },
                    {
                        type: 'custom',
                        src: 'https://example.com/analytics.js'
                    }
                ]
            });
            expect(config3.providers).toHaveLength(3);
            expect(config3.providers[0].type).toBe('google');
            expect(config3.providers[1].type).toBe('hotjar');
            expect(config3.providers[2].type).toBe('custom');
        });

        it('should support backward compatibility for sillyDeclineButton', () => {
            const options: CookieConsentPluginOptions = {
                features: {
                    sillyDeclineButton: false
                }
            };

            const config = mergeWithDefaults(options);
            expect(config.features.sillyDeclineButton).toBe(false);
        });

        it('should handle empty nested objects', () => {
            const options: CookieConsentPluginOptions = {
                privacyPolicy: {},
                cookieConfig: {},
                providers: [],
                theme: {},
                features: {},
                i18n: {}
            };

            const config = mergeWithDefaults(options);

            // All defaults should be used
            expect(config.cookieName).toBe('docusaurus_cookie_consent');
            expect(config.cookieExpiry).toBe(365);
            expect(config.position).toBe('center');
            expect(config.privacyPolicyUrl).toBe('/privacy-policy-demo');
            expect(config.features.sillyDeclineButton).toBe(false);
        });

        it('should handle null/undefined values gracefully', () => {
            const options: CookieConsentPluginOptions = {
                cookieConfig: {
                    name: undefined as unknown as string,
                    expiry: null as unknown as number
                }
            };

            const config = mergeWithDefaults(options);

            expect(config.cookieName).toBe('docusaurus_cookie_consent');
            expect(config.cookieExpiry).toBe(365);
        });

        it('should include texts from translations', () => {
            const config = mergeWithDefaults();

            expect(config.texts).toBeDefined();
            expect(config.texts.title).toBeDefined();
            expect(config.texts.description).toBeDefined();
            expect(config.texts.acceptButton).toBeDefined();
        });

        it('should preserve all feature flags', () => {
            const options: CookieConsentPluginOptions = {
                features: {
                    sillyDeclineButton: false
                }
            };

            const config = mergeWithDefaults(options);

            expect(config.features.sillyDeclineButton).toBe(false);
        });
    });
});
