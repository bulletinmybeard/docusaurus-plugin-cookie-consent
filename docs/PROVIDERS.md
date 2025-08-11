# Analytics Providers Documentation

This guide covers all supported analytics providers and how to configure them.

## Table of Contents

- [Stable Providers](#stable-providers)
  - [Google Analytics](#google-analytics)
  - [Google Tag Manager](#google-tag-manager)
  - [Custom Scripts](#custom-scripts)
- [Experimental Providers](#experimental-providers)
  - [Hotjar](#hotjar)
- [Custom Provider Examples](#custom-provider-examples)
- [Multiple Providers](#multiple-providers)
- [Debug Mode](#debug-mode)

## Stable Providers

These providers are production-ready and fully supported.

### Google Analytics

Traditional page view and event tracking with Google Analytics 4.

#### Basic Setup

```js
{
  type: 'google',
  id: 'G-XXXXXXXXXX'  // Your GA4 Measurement ID
}
```

#### Advanced Configuration

```js
{
  type: 'google',
  id: 'G-XXXXXXXXXX',
  name: 'Google Analytics',      // Custom display name
  description: 'Site analytics',  // Custom description for users
  debug: true,                    // Enable debug mode
  options: {
    anonymizeIp: true,           // Anonymize IP addresses
    cookieFlags: 'SameSite=None;Secure',
    cookieDomain: 'auto',
    cookieExpires: 63072000,     // 2 years in seconds
    cookieUpdate: true,
    sendPageView: true           // Auto-send page views
  }
}
```

#### Finding Your GA4 ID

1. Go to Google Analytics
2. Admin → Data Streams
3. Select your web stream
4. Copy the Measurement ID (starts with `G-`)

### Google Tag Manager

Full tag management capabilities for complex tracking setups.

#### Basic Setup

```js
{
  type: 'gtm',
  id: 'GTM-XXXXXXX'  // Your GTM Container ID
}
```

#### Advanced Configuration

```js
{
  type: 'gtm',
  id: 'GTM-XXXXXXX',
  name: 'Google Tag Manager',
  description: 'Manages our marketing and analytics tools',
  options: {
    dataLayerName: 'dataLayer',  // Custom dataLayer name
    preview: 'env-x',            // GTM preview mode
    auth: 'your-auth-token'      // GTM auth token
  }
}
```

#### GTM Setup Tips

1. Configure triggers in GTM to respect consent
2. Use the `cookieConsentChanged` event for consent-based triggers
3. Test thoroughly in GTM Preview mode

### Custom Scripts

Support for any third-party analytics service.

#### Basic Custom Script

```js
{
  type: 'custom',
  src: 'https://analytics.example.com/script.js',
  name: 'Custom Analytics',
  description: 'Our analytics solution'
}
```

#### Script Loading Options

```js
{
  type: 'custom',
  src: 'https://cdn.analytics.com/v2/script.js',
  options: {
    async: true,         // Load asynchronously
    defer: false,        // Don't defer execution
    placement: 'head',   // 'head', 'body', or 'body-end'
    attributes: {
      'data-site-id': 'YOUR_SITE_ID',
      'data-config': 'production'
    }
  }
}
```

## Experimental Providers

These providers require enabling experimental features.

### Hotjar

Heatmaps, session recordings, and user feedback.

⚠️ **Important**: Requires `enableExperimental: true` in plugin configuration.

#### Setup

```js
module.exports = {
  plugins: [
    ['docusaurus-plugin-cookie-consent', {
      enableExperimental: true,  // Required for Hotjar
      providers: [
        {
          type: 'hotjar',
          id: 1234567,  // Your Hotjar Site ID (number)
          name: 'Hotjar Analytics',
          description: 'Records sessions to improve UX',
          options: {
            version: 6  // Hotjar version (default: 6)
          }
        }
      ]
    }]
  ]
};
```

#### Testing Hotjar Locally

Hotjar requires HTTPS. Use ngrok for local testing:

```bash
# Start your dev server
npm run start

# In another terminal, create HTTPS tunnel
ngrok http 3000

# Use the HTTPS URL provided by ngrok
```

## Custom Provider Examples

### Authenticated Analytics with Headers

```js
{
  type: 'custom',
  src: 'https://analytics.example.com/secure-script.js',
  loadMethod: 'fetch',  // Use fetch to include headers
  options: {
    fetchOptions: {
      headers: {
        'Authorization': 'Bearer YOUR_API_TOKEN',
        'X-Client-ID': 'docusaurus-site',
        'X-Environment': 'production'
      },
      credentials: 'include'  // Include cookies
    },
    onLoad: () => {
      console.log('Authenticated analytics loaded');
    },
    onError: (error) => {
      console.error('Failed to load analytics:', error);
    }
  }
}
```

### Third-Party Widget with Security

```js
{
  type: 'custom',
  src: 'https://widget.example.com/embed.js',
  options: {
    // Security attributes
    crossorigin: 'anonymous',
    integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/...',
    nonce: 'YOUR_CSP_NONCE',
    
    // Custom attributes
    attributes: {
      'data-widget-id': '12345',
      'data-theme': 'dark'
    },
    
    // Wait for widget to be ready
    waitForGlobals: ['WidgetAPI', 'WidgetAPI.ready'],
    
    // Initialize after loading
    initCode: () => {
      window.WidgetAPI.init({
        containerId: 'widget-container',
        apiKey: 'YOUR_WIDGET_KEY'
      });
    }
  }
}
```

### Inline Analytics Script

```js
{
  type: 'custom',
  loadMethod: 'inline',
  inlineScript: `
    (function() {
      var tracker = window.tracker || [];
      tracker.push(['setAccount', 'ACCOUNT_ID']);
      tracker.push(['trackPageView']);
      window.tracker = tracker;
    })();
  `,
  options: {
    placement: 'body-end',
    onLoad: () => {
      console.log('Inline tracking code executed');
    }
  }
}
```

### Analytics with Retry Logic

```js
{
  type: 'custom',
  src: 'https://cdn.analytics.com/v2/analytics.js',
  options: {
    // Retry configuration
    retry: {
      attempts: 3,      // Try 3 times
      delay: 2000,      // Wait 2 seconds between attempts
      backoff: true     // Exponential backoff (2s, 4s, 8s)
    },
    
    // Timeout configuration
    timeout: 10000,  // 10 second timeout
    
    // Lifecycle callbacks
    onBeforeLoad: async () => {
      // Prepare environment before loading
      window.analyticsConfig = {
        debug: true
      };
    },
    onLoad: () => {
      // Initialize after successful load
      window.analytics.init('YOUR_ACCOUNT_ID');
    },
    onError: (error) => {
      // Handle loading failure
      console.error('Analytics failed after retries:', error);
    }
  }
}
```

### Complex Multi-Step Initialization

```js
{
  type: 'custom',
  src: 'https://platform.example.com/sdk.js',
  options: {
    // Wait for SDK to be available
    waitForGlobals: ['PlatformSDK'],
    
    // Complex initialization
    initCode: async () => {
      // Step 1: Configure SDK
      await window.PlatformSDK.configure({
        apiKey: 'YOUR_API_KEY',
        environment: 'production',
        userId: getUserId()
      });
      
      // Step 2: Load additional modules
      await window.PlatformSDK.loadModule('analytics');
      await window.PlatformSDK.loadModule('feedback');
      
      // Step 3: Start tracking
      window.PlatformSDK.analytics.trackPageView();
      
      // Step 4: Setup event listeners
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-track]')) {
          window.PlatformSDK.analytics.track(
            e.target.dataset.track
          );
        }
      });
    },
    
    // Place in body for DOM access
    placement: 'body'
  }
}
```

## Multiple Providers

### Granular Consent

Users can choose which specific providers to enable:

```js
providers: [
  {
    type: 'google',
    id: 'G-XXXXXXXXXX',
    required: false,  // User can opt-out
    i18n: {
      en: {
        name: 'Google Analytics',
        description: 'Anonymous usage statistics'
      }
    }
  },
  {
    type: 'hotjar',
    id: 1234567,
    required: false,  // User can opt-out
    i18n: {
      en: {
        name: 'Session Recording',
        description: 'Records interactions to improve UX'
      }
    }
  },
  {
    type: 'custom',
    src: '/essential-monitoring.js',
    required: true,  // Always loaded (essential)
    i18n: {
      en: {
        name: 'Essential Monitoring',
        description: 'Required for site functionality'
      }
    }
  }
]
```

### Provider Groups

Organize providers by purpose:

```js
const analyticsProviders = [
  { type: 'google', id: 'G-XXXXXXXXXX' },
  { type: 'gtm', id: 'GTM-XXXXXXX' }
];

const marketingProviders = [
  { type: 'hotjar', id: 1234567 },
  { type: 'custom', src: 'https://pixel.example.com/track.js' }
];

module.exports = {
  plugins: [
    ['docusaurus-plugin-cookie-consent', {
      providers: [
        ...analyticsProviders.map(p => ({
          ...p,
          i18n: {
            en: { name: 'Analytics', description: 'Usage tracking' }
          }
        })),
        ...marketingProviders.map(p => ({
          ...p,
          i18n: {
            en: { name: 'Marketing', description: 'Marketing tools' }
          }
        }))
      ]
    }]
  ]
};
```

## Debug Mode

### Enabling Debug Mode

Add `debug: true` to any provider:

```js
providers: [
  {
    type: 'google',
    id: 'G-XXXXXXXXXX',
    debug: true  // Enables debug features
  }
]
```

### Debug Features

When debug mode is enabled:

1. **Floating Debug Widget** - 🐞 button in bottom-right corner
2. **Real-time Status** - Shows which analytics are loaded
3. **Test Events** - Send test events to verify tracking
4. **Enhanced Logging** - Detailed console logs

### Debug Panel

The debug panel displays:
- Provider initialization status (✅ Loaded / ❌ Not loaded)
- DataLayer contents for GTM
- Configuration details
- Test event buttons

### Using Debug Mode Effectively

1. Enable debug on providers during development
2. Click the 🐞 button to open the panel
3. Verify providers load correctly after consent
4. Send test events and check your analytics dashboard
5. Disable debug mode in production

## Best Practices

1. **Start with one provider** - Test thoroughly before adding more
2. **Use debug mode** - Verify providers load correctly
3. **Test consent flow** - Ensure scripts only load after consent
4. **Provide clear descriptions** - Help users understand what each provider does
5. **Group related providers** - Make consent choices clearer
6. **Handle failures gracefully** - Use error callbacks for custom providers
7. **Document your setup** - Keep track of all provider IDs and configurations

## See Also

- [Configuration Reference](./CONFIGURATION.md) - All configuration options
- [API Reference](./API.md) - Programmatic consent management
- [Troubleshooting](./TROUBLESHOOTING.md) - Common provider issues
