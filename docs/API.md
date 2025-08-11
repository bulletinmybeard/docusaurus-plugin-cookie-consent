# API Reference

The plugin provides a comprehensive client-side API for managing cookie consent programmatically.

## Table of Contents

- [Client API](#client-api)
  - [Core Functions](#core-functions)
  - [Type Definitions](#type-definitions)
- [React Hooks](#react-hooks)
- [Window API (Legacy)](#window-api-legacy)
- [Events](#events)
- [Practical Examples](#practical-examples)

## Client API

Import functions from the client module to interact with consent status.

### Core Functions

```js
import {
  getConsentStatus,
  getConsentData,
  updateConsent,
  resetConsent,
  onConsentChange,
  canLoadAnalytics,
  getCookieName,
  getConfig
} from 'docusaurus-plugin-cookie-consent/client';
```

#### `getConsentStatus()`

Get the current consent status.

```js
const status = getConsentStatus();
// Returns: true | false | null
// - true: User accepted cookies
// - false: User declined cookies  
// - null: No decision made yet
```

#### `getConsentData()`

Get the full consent data object including granular provider choices.

```js
const data = getConsentData();
// Returns: {
//   accepted: boolean,
//   timestamp: number,
//   providers?: {
//     google?: boolean,
//     gtm?: boolean,
//     hotjar?: boolean,
//     custom?: boolean
//   }
// }
```

#### `updateConsent(accepted, providerChoices?)`

Update consent programmatically.

```js
// Accept all cookies
updateConsent(true);

// Decline all cookies
updateConsent(false);

// Accept specific providers only
updateConsent(true, {
  google: true,
  hotjar: false
});
```

#### `resetConsent()`

Clear consent and show the modal again.

```js
resetConsent();
// Clears stored consent and shows modal
```

#### `onConsentChange(callback)`

Subscribe to consent changes.

```js
const unsubscribe = onConsentChange((accepted, consentData) => {
  console.log('Consent changed:', accepted);
  console.log('Full data:', consentData);
  
  if (accepted) {
    // Initialize features that need consent
  } else {
    // Disable features
  }
});

// Clean up when done
unsubscribe();
```

#### `canLoadAnalytics(providerType?)`

Check if analytics can be loaded.

```js
// Check if any analytics can load
const canLoad = canLoadAnalytics();

// Check specific provider
const canLoadGoogle = canLoadAnalytics('google');
```

#### `getCookieName()`

Get the cookie storage key name.

```js
const cookieName = getCookieName();
// Returns: 'docusaurus_cookie_consent' (or custom name)
```

#### `getConfig()`

Get the plugin configuration.

```js
const config = getConfig();
// Returns the full plugin configuration object
```

### Type Definitions

```js
interface ConsentData {
  accepted: boolean;
  timestamp: number;
  providers?: {
    [key: string]: boolean;
  };
}

type ConsentStatus = boolean | null;

type ConsentChangeCallback = (
  accepted: boolean,
  consentData: ConsentData
) => void;

interface ProviderChoices {
  [providerType: string]: boolean;
}
```

## React Hooks

Use these hooks for reactive consent management in React components.

```js
import {
  useConsentStatus,
  useConsentData,
  useConsentListener,
  useAnalyticsReady,
  useHasConsentDecision
} from 'docusaurus-plugin-cookie-consent/client/hooks';
```

### `useConsentStatus()`

Monitor consent status reactively.

```jsx
function MyComponent() {
  const consentStatus = useConsentStatus();
  
  if (consentStatus === null) {
    return <p>Waiting for consent decision...</p>;
  }
  
  return (
    <div>
      {consentStatus ? 'Cookies accepted' : 'Cookies declined'}
    </div>
  );
}
```

### `useConsentData()`

Get full consent data with provider choices.

```jsx
function AnalyticsStatus() {
  const consentData = useConsentData();
  
  if (!consentData) {
    return <p>No consent data</p>;
  }
  
  return (
    <ul>
      <li>Google: {consentData.providers?.google ? '✅' : '❌'}</li>
      <li>Hotjar: {consentData.providers?.hotjar ? '✅' : '❌'}</li>
    </ul>
  );
}
```

### `useConsentListener(callback)`

Listen to consent changes with automatic cleanup.

```jsx
function ConsentWatcher() {
  useConsentListener((accepted, data) => {
    console.log('Consent updated:', accepted);
    // React to consent changes
  });
  
  return <div>Watching consent...</div>;
}
```

### `useAnalyticsReady(providerType?)`

Check if analytics are ready to use.

```jsx
function ContactForm() {
  const analyticsReady = useAnalyticsReady();
  const googleReady = useAnalyticsReady('google');
  
  return (
    <form>
      {/* Form fields */}
      
      {analyticsReady ? (
        <ReCaptcha />
      ) : (
        <p>Accept cookies to enable spam protection</p>
      )}
      
      {googleReady && (
        <GoogleAnalyticsWidget />
      )}
    </form>
  );
}
```

### `useHasConsentDecision()`

Check if user has made any consent decision.

```jsx
function ConsentPrompt() {
  const hasDecided = useHasConsentDecision();
  
  if (!hasDecided) {
    return <div>Please make a cookie consent decision</div>;
  }
  
  return null;
}
```

## Window API (Legacy)

The window API is available for backward compatibility and non-React contexts.

### Available Methods

```js
// Reset consent and show modal
window.CookieConsent.reset();

// Get current status
const status = window.CookieConsent.getStatus();

// Update consent
window.CookieConsent.updateConsent(true);

// Get full consent data
const data = window.CookieConsent.getConsentData();

// Check if analytics can load
const canLoad = window.CookieConsent.canLoadAnalytics();
```

### Window API Example

```html
<script>
  // Wait for plugin to initialize
  document.addEventListener('DOMContentLoaded', () => {
    // Check consent status
    if (window.CookieConsent?.getStatus()) {
      // Initialize features that need consent
      initializeChat();
    }
    
    // Listen for changes
    window.addEventListener('cookieConsentChanged', (e) => {
      if (e.detail.accepted) {
        initializeChat();
      } else {
        disableChat();
      }
    });
  });
</script>
```

## Events

Listen for consent changes using native DOM events.

### `cookieConsentChanged` Event

Fired whenever consent status changes.

```js
window.addEventListener('cookieConsentChanged', (e) => {
  console.log('Accepted:', e.detail.accepted);
  console.log('Consent Data:', e.detail.consentData);
  console.log('Provider Choices:', e.detail.consentData.providers);
});
```

### Event Detail Structure

```js
interface CookieConsentEvent extends CustomEvent {
  detail: {
    accepted: boolean;
    consentData: {
      accepted: boolean;
      timestamp: number;
      providers?: {
        [key: string]: boolean;
      };
    };
  };
}
```

## Practical Examples

### Conditional Component Loading

```jsx
import { useAnalyticsReady } from 'docusaurus-plugin-cookie-consent/client/hooks';

function LiveChat() {
  const analyticsReady = useAnalyticsReady();
  
  if (!analyticsReady) {
    return (
      <div className="chat-placeholder">
        <p>Accept cookies to enable live chat</p>
        <button onClick={() => window.CookieConsent.reset()}>
          Update Cookie Settings
        </button>
      </div>
    );
  }
  
  return <ChatWidget />;
}
```

### Custom Analytics Integration

```js
import { 
  getConsentStatus, 
  onConsentChange 
} from 'docusaurus-plugin-cookie-consent/client';

// Initialize only with consent
if (getConsentStatus() === true) {
  initializeCustomAnalytics();
}

// React to consent changes
const unsubscribe = onConsentChange((accepted) => {
  if (accepted) {
    initializeCustomAnalytics();
    trackEvent('consent_granted');
  } else {
    disableCustomAnalytics();
    clearAnalyticsCookies();
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', unsubscribe);
```

### Consent-Gated Features

```jsx
import { useConsentData } from 'docusaurus-plugin-cookie-consent/client/hooks';

function FeatureGates() {
  const consentData = useConsentData();
  
  return (
    <div>
      {consentData?.providers?.google && (
        <GoogleMapsWidget />
      )}
      
      {consentData?.providers?.hotjar && (
        <FeedbackWidget />
      )}
      
      {!consentData?.accepted && (
        <div className="consent-required">
          <p>Some features require cookie consent</p>
          <button onClick={() => window.CookieConsent.reset()}>
            Review Settings
          </button>
        </div>
      )}
    </div>
  );
}
```

### Programmatic Consent Management

```jsx
import { 
  updateConsent, 
  resetConsent 
} from 'docusaurus-plugin-cookie-consent/client';

function ConsentManager() {
  const handleAcceptAll = () => {
    updateConsent(true);
  };
  
  const handleAcceptEssential = () => {
    updateConsent(true, {
      google: false,
      hotjar: false,
      essential: true
    });
  };
  
  const handleDeclineAll = () => {
    updateConsent(false);
  };
  
  const handleReset = () => {
    resetConsent();
  };
  
  return (
    <div>
      <button onClick={handleAcceptAll}>Accept All</button>
      <button onClick={handleAcceptEssential}>Essential Only</button>
      <button onClick={handleDeclineAll}>Decline All</button>
      <button onClick={handleReset}>Change Settings</button>
    </div>
  );
}
```

### Server-Side Rendering Considerations

```jsx
import { useEffect, useState } from 'react';
import { getConsentStatus } from 'docusaurus-plugin-cookie-consent/client';

function SSRSafeComponent() {
  const [consent, setConsent] = useState(null);
  
  useEffect(() => {
    // Only run on client
    setConsent(getConsentStatus());
  }, []);
  
  if (typeof window === 'undefined') {
    // Server-side render
    return <div>Loading...</div>;
  }
  
  // Client-side render with consent status
  return (
    <div>
      Consent: {consent === null ? 'Undecided' : consent ? 'Granted' : 'Denied'}
    </div>
  );
}
```

## Best Practices

1. **Use hooks in React components** - More efficient than window API
2. **Handle null states** - Consent may not be decided yet
3. **Clean up listeners** - Prevent memory leaks
4. **Check SSR compatibility** - Some APIs only work client-side
5. **Provide fallbacks** - Show alternatives when consent is denied
6. **Test all states** - Verify behavior for accepted/declined/null

## See Also

- [Configuration Reference](./CONFIGURATION.md) - Plugin configuration
- [Providers Documentation](./PROVIDERS.md) - Analytics provider setup
- [Customization Guide](./CUSTOMIZATION.md) - UI customization
