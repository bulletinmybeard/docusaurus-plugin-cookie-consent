# Docusaurus Cookie Consent

[![NPM Version](https://img.shields.io/npm/v/docusaurus-plugin-cookie-consent)](https://www.npmjs.com/package/docusaurus-plugin-cookie-consent)
[![CI](https://github.com/bulletinmybeard/docusaurus-plugin-cookie-consent/actions/workflows/ci.yml/badge.svg)](https://github.com/bulletinmybeard/docusaurus-plugin-cookie-consent/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)
[![NPM Downloads](https://img.shields.io/npm/dm/docusaurus-plugin-cookie-consent)](https://www.npmjs.com/package/docusaurus-plugin-cookie-consent)
[![Docusaurus](https://img.shields.io/badge/Docusaurus-3.0%2B-green)](https://docusaurus.io/)
[![Node](https://img.shields.io/badge/Node-18.0%2B-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5%2B-blue)](https://www.typescriptlang.org/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

GDPR-compliant cookie consent plugin for Docusaurus - no configuration required!

## Features

- **Zero Configuration** - Works immediately after installation
- **Beautiful UI** - Matches your Docusaurus theme automatically
- **Multi-language** - Built-in translations (EN, DE) with easy expansion
- **Analytics Ready** - Supports Google Analytics, GTM, Hotjar, and custom providers
- **GDPR Compliant** - Blocks scripts until consent is given
- **Lightweight** - ~15KB gzipped, no performance impact
-  **Developer Friendly** - TypeScript support, React hooks, comprehensive API

## Documentation

- [Configuration Reference](./docs/CONFIGURATION.md) - All configuration options
- [Provider Setup](./docs/PROVIDERS.md) - Analytics provider documentation
- [API Reference](./docs/API.md) - Client-side API and React hooks
- [Customization Guide](./docs/CUSTOMIZATION.md) - Styling and text customization
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and solutions
- [FAQ](./docs/FAQ.md) - Frequently asked questions

## Quick Start

### Installation

```bash
npm install docusaurus-plugin-cookie-consent
```

### Basic Setup

Add to your `docusaurus.config.js`:

```js
module.exports = {
  plugins: [
    'docusaurus-plugin-cookie-consent'  // That's it!
  ]
};
```

The plugin works immediately with smart defaults.

![Cookie Consent Modal](./screenshots/cookie-consent-modal.png)

### With Analytics Provider

Add Google Analytics that loads only after consent:

```js
module.exports = {
  plugins: [
    ['docusaurus-plugin-cookie-consent', {
      providers: [
        {
          type: 'google',
          id: 'G-XXXXXXXXXX'  // Your Google Analytics ID
        }
      ]
    }]
  ]
};
```

The plugin automatically blocks analytics until users consent, keeping you GDPR compliant!

## Screenshots

### Cookie Consent Modal
![Cookie Consent Modal - Light and Dark Theme](./screenshots/modal-light-dark.png)

Automatically matches your Docusaurus theme (light/dark mode).

### Debug Panel
![Debug Panel](./screenshots/debug-panel.png)

Built-in debug mode for testing analytics integration.

## Advanced Usage

### Multiple Providers

```js
providers: [
  { type: 'google', id: 'G-XXXXXXXXXX' },
  { type: 'gtm', id: 'GTM-XXXXXXX' },
  { type: 'hotjar', id: 1234567 },  // Requires enableExperimental: true
  { type: 'custom', src: 'https://example.com/analytics.js' }
]
```

### Custom Styling

```css
:root {
  --cookie-consent-primary: #007bff;
  --cookie-consent-text: #333;
  --cookie-consent-background: #fff;
}
```

### Client API

```js
import { getConsentStatus, onConsentChange } from 'docusaurus-plugin-cookie-consent/client';

// Check consent
const hasConsent = getConsentStatus();

// Listen for changes
onConsentChange((accepted) => {
  console.log('Consent:', accepted);
});
```

### React Hooks

```jsx
import { useConsentStatus } from 'docusaurus-plugin-cookie-consent/client/hooks';

function MyComponent() {
  const consentStatus = useConsentStatus();
  
  return consentStatus ? <Analytics /> : <Placeholder />;
}
```

## Common Questions

**Q: What cookies does this plugin use?**
A: Only one: `docusaurus_cookie_consent` to store consent (365 days)

**Q: Can I use custom analytics providers?**
A: Yes! Use the `custom` provider type for any analytics service

**Q: Does this work with TypeScript?**
A: Yes, full TypeScript support with type definitions included

**Q: Do I need to swizzle components?**
A: No! Works without any swizzling

See [FAQ](./docs/FAQ.md) for more questions.

## Requirements

- Docusaurus 3.0+
- Node.js 18.0+  
- React 18 or 19

## Support & Contributing

- [Documentation](./docs/) - Comprehensive guides
- [Report Issues](https://github.com/bulletinmybeard/docusaurus-plugin-cookie-consent/issues)
- [Request Features](https://github.com/bulletinmybeard/docusaurus-plugin-cookie-consent/discussions)
- [Ask Questions](https://github.com/bulletinmybeard/docusaurus-plugin-cookie-consent/discussions)

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT License](LICENSE) - Free for commercial and personal use.
