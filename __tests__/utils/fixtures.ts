import type { CookieConsentPluginOptions, ConsentData } from '../../src/plugin/types';

export const validPluginOptions: CookieConsentPluginOptions = {
  privacyPolicy: {
    url: '/privacy'
  },
  cookieConfig: {
    name: 'test_consent',
    expiry: 30
  },
  providers: [
    {
      type: 'google',
      id: 'G-TESTID123'
    }
  ],
  features: {
    sillyDeclineButton: true
  }
};

export const invalidPluginOptions: CookieConsentPluginOptions = {
  cookieConfig: {
    expiry: 0 // Invalid: must be at least 1
  }
};

export const mockConsentData: ConsentData = {
  accepted: true,
  timestamp: new Date('2024-01-01').toISOString(),
  version: '1.0.0'
};

export const expiredConsentData: ConsentData = {
  accepted: true,
  timestamp: new Date('2020-01-01').toISOString(),
  version: '1.0.0'
};

// Helper to create localStorage consent data
export function setMockConsent(
  cookieName: string,
  consentData: ConsentData
): void {
  localStorage.setItem(cookieName, JSON.stringify(consentData));
}

// Helper to verify gtag calls
export function mockGtag() {
  const gtagMock = jest.fn();
  (window as any).gtag = gtagMock;
  (window as any).dataLayer = [];
  return gtagMock;
}
