# Configuration Reference

This document provides a complete reference for all configuration options available in the Docusaurus Cookie Consent plugin.

## Table of Contents

- [Basic Configuration](#basic-configuration)
- [Cookie Settings](#cookie-settings)
- [Provider Configuration](#provider-configuration)
- [Privacy Policy Configuration](#privacy-policy-configuration)
- [UI Features](#ui-features)
- [Internationalization](#internationalization)
- [Environment-based Configuration](#environment-based-configuration)
- [Full Configuration Example](#full-configuration-example)

## Basic Configuration

### Minimal Setup

```js
module.exports = {
  plugins: [
    'docusaurus-plugin-cookie-consent'  // Works with defaults
  ]
};
```

### With Analytics Provider

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

## Cookie Settings

Configure how consent is stored:

```js
cookieConfig: {
  name: 'my_consent',     // Cookie name (default: 'docusaurus_cookie_consent')
  expiry: 180            // Days until expiry (default: 365)
}
```

## Provider Configuration

### Google Analytics

```js
{
  type: 'google',
  id: 'G-XXXXXXXXXX',           // Required: Your GA4 Measurement ID
  name: 'Google Analytics',      // Optional: Custom display name
  description: 'Site analytics', // Optional: Custom description
  enabled: true,                 // Optional: Enable/disable (default: true)
  required: false,               // Optional: Make mandatory (default: false)
  debug: false,                  // Optional: Enable debug mode (default: false)
  options: {
    anonymizeIp: true,          // Optional: Anonymize IP addresses
    cookieFlags: 'SameSite=None;Secure'  // Optional: Cookie flags
  }
}
```

### Google Tag Manager

```js
{
  type: 'gtm',
  id: 'GTM-XXXXXXX',           // Required: Container ID
  options: {
    dataLayerName: 'dataLayer'  // Optional: Custom dataLayer name
  }
}
```

### Hotjar (Experimental)

⚠️ **Note**: Hotjar support is experimental and requires enabling experimental features.

```js
{
  type: 'hotjar',
  id: 1234567,                  // Required: Hotjar Site ID (number)
  options: {
    version: 6                  // Optional: Hotjar version (default: 6)
  }
}
```

### Custom Provider

```js
{
  type: 'custom',
  src: 'https://example.com/analytics.js',  // Required: Script URL
  name: 'Custom Analytics',                  // Optional: Display name
  description: 'Our analytics solution',     // Optional: Description
  options: {
    async: true,                             // Script loading attributes
    defer: false,
    crossorigin: 'anonymous',
    integrity: 'sha384-...',
    'data-domain': 'example.com'             // Custom attributes
  }
}
```

### Provider Internationalization

Each provider can have localized names and descriptions:

```js
{
  type: 'google',
  id: 'G-XXXXXXXXXX',
  i18n: {
    en: {
      name: 'Google Analytics',
      description: 'Helps us understand how you use our site'
    },
    de: {
      name: 'Google Analytics',
      description: 'Hilft uns zu verstehen, wie Sie unsere Seite nutzen'
    }
  }
}
```

## Privacy Policy Configuration

Configure the auto-generated privacy policy demo page:

```js
privacyPolicy: {
  url: '/privacy-policy-demo',  // Demo page URL (default: '/privacy-policy-demo')
  disable: false,               // Disable demo page (default: false)
}
```

To use your own privacy policy:

```js
privacyPolicy: {
  disable: true  // Disable the demo page
}
```

Then create your own at `src/pages/privacy-policy.md`.

## UI Features

### Cookie Settings Link Selector

Specify which elements should open the cookie settings modal:

```js
cookieSettingsSelector: '.my-cookie-settings-link'  // Default: '.footer__link-item--cookie-settings'
```

### Silly Decline Button

Enable a playful decline button that dodges the cursor:

```js
features: {
  sillyDeclineButton: true  // Default: false
}
```

## Internationalization

### Force Specific Locale

Useful for testing:

```js
i18n: {
  forceLocale: 'de'  // Force German locale
}
```

### Custom Translations

Override any text in the plugin:

```js
i18n: {
  texts: {
    en: {
      title: 'Cookie Preferences',
      description: 'We use cookies to improve your experience.',
      acceptButton: 'Accept All',
      declineButton: 'Reject All',
      manageButton: 'Manage Preferences',
      closeButton: 'Close',
      requiredLabel: 'Required',
      settingsTitle: 'Cookie Settings',
      settingsDescription: 'Choose which cookies you want to accept.',
      acceptSelectedButton: 'Accept Selected',
      acceptAllButton: 'Accept All',
      declineAllButton: 'Decline All',
      privacyPolicyLink: 'Privacy Policy',
      // ... more translation keys
    },
    de: {
      title: 'Cookie-Einstellungen',
      // ... German translations
    }
  }
}
```

## Environment-based Configuration

Load different configurations based on environment:

```js
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  plugins: [
    ['docusaurus-plugin-cookie-consent', {
      // Always load Google Analytics
      providers: [
        {
          type: 'google',
          id: process.env.GA_ID || 'G-XXXXXXXXXX',
          debug: isDevelopment  // Enable debug in development
        },
        // Only load Hotjar in production
        ...(isProduction ? [{
          type: 'hotjar',
          id: parseInt(process.env.HOTJAR_ID) || 1234567
        }] : []),
        // Load test analytics in development
        ...(isDevelopment ? [{
          type: 'custom',
          src: 'http://localhost:8080/test-analytics.js',
          name: 'Test Analytics'
        }] : [])
      ],
      // Different cookie expiry for development
      cookieConfig: {
        expiry: isDevelopment ? 1 : 365
      }
    }]
  ]
};
```

## Full Configuration Example

Complete example with all options:

```js
module.exports = {
  plugins: [
    ['docusaurus-plugin-cookie-consent', {
      // Enable experimental features
      enableExperimental: true,
      
      // Cookie configuration
      cookieConfig: {
        name: 'my_consent',
        expiry: 180
      },

      // Analytics providers
      providers: [
        {
          type: 'google',
          id: 'G-XXXXXXXXXX',
          debug: true,
          i18n: {
            en: {
              name: 'Google Analytics',
              description: 'Helps us understand site usage'
            }
          },
          options: {
            anonymizeIp: true
          }
        },
        {
          type: 'gtm',
          id: 'GTM-XXXXXXX'
        },
        {
          type: 'hotjar',
          id: 1234567
        },
        {
          type: 'custom',
          src: 'https://analytics.example.com/script.js',
          name: 'Custom Analytics',
          options: {
            async: true,
            'data-site-id': 'ABC123'
          }
        }
      ],

      // Privacy policy
      privacyPolicy: {
        url: '/privacy-policy-demo',
        disable: false
      },

      // UI features
      features: {
        sillyDeclineButton: false
      },

      // Cookie settings link
      cookieSettingsSelector: '.footer__link-item--cookie-settings',

      // Internationalization
      i18n: {
        forceLocale: null,
        texts: {
          en: {
            title: 'We Value Your Privacy',
            acceptButton: 'Accept All Cookies'
          }
        }
      }
    }]
  ]
};
```

## Configuration Tips

1. **Start Simple**: Begin with minimal configuration and add options as needed
2. **Test Locally**: Use `debug: true` on providers to verify they're loading correctly
3. **Environment Variables**: Use environment variables for sensitive IDs
4. **Gradual Rollout**: Test with a subset of providers before enabling all
5. **Custom Providers**: Use the custom provider type for any analytics service not built-in

## See Also

- [Providers Documentation](./PROVIDERS.md) - Detailed provider setup and examples
- [API Reference](./API.md) - Client-side API for consent management
- [Customization Guide](./CUSTOMIZATION.md) - UI and text customization
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
