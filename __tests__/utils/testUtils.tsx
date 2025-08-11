import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { PluginConfigContext } from '../../src/hooks/usePluginConfig';
import type { CookieConsentConfig } from '../../src/plugin/types';

export const mockConfig: CookieConsentConfig = {
  cookieName: 'test_cookie_consent',
  cookieExpiry: 365,
  position: 'center',
  privacyPolicyUrl: '/privacy-policy',
  providers: [
    {
      type: 'google',
      id: 'G-TEST123'
    }
  ],
  texts: {
    title: 'We use cookies',
    description: 'This website uses cookies to improve your experience.',
    acceptButton: 'Accept',
    declineButton: 'Decline',
    closeButtonAriaLabel: 'Close dialog',
    consentHelp: 'Your consent helps to improve your experience.',
    analyticsEnabled: '✓ Analytics tracking enabled',
    analyticsDisabled: '✗ Analytics tracking disabled',
    privacyPolicyLinkText: 'Privacy Policy',
    cookieSettingsText: 'Cookie Settings',
    saveMyChoicesButton: 'Save My Choices',
    closeButton: 'Close',
    selectAll: 'Select All',
    choicesSaved: 'Your choices have been saved. You can change them anytime.'
  },
  features: {
    sillyDeclineButton: false
  },
  enableDebugPanel: false
};

interface TestWrapperProps {
  children: React.ReactNode;
  config?: Partial<CookieConsentConfig>;
}

export function TestWrapper({ children, config = {} }: TestWrapperProps) {
  const mergedConfig = { ...mockConfig, ...config };

  return (
    <PluginConfigContext.Provider value={mergedConfig}>
      {children}
    </PluginConfigContext.Provider>
  );
}

export function renderWithConfig(
  ui: React.ReactElement,
  config?: Partial<CookieConsentConfig>,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => <TestWrapper config={config}>{children}</TestWrapper>,
    ...options
  });
}

// Helper to wait for async updates
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
