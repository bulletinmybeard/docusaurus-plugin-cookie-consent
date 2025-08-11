// Mock Docusaurus globals and modules

export function mockDocusaurusContext(locale: string = 'en') {
  // Mock window.__docusaurus
  Object.defineProperty(window, '__docusaurus', {
    writable: true,
    configurable: true,
    value: {
      globalData: {
        i18n: {
          currentLocale: locale,
          locales: ['en', 'de'],
          defaultLocale: 'en'
        }
      }
    }
  });
}

// Mock Docusaurus router
export const mockUseLocation = jest.fn(() => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null
}));


// Mock Docusaurus types
export const mockLoadContext = {
  siteDir: '/test/site',
  generatedFilesDir: '/test/site/.docusaurus',
  i18n: {
    currentLocale: 'en',
    locales: ['en', 'de'],
    defaultLocale: 'en'
  }
};

// Reset mocks
export function resetDocusaurusMocks() {
  mockUseLocation.mockReset();
  mockUseLocation.mockReturnValue({
    pathname: '/',
    search: '',
    hash: '',
    state: null
  });
  
  if ('__docusaurus' in window) {
    delete (window as any).__docusaurus;
  }
}