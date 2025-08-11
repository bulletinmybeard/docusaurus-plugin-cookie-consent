# Customization Guide

Learn how to customize the appearance, text, and behavior of the cookie consent plugin.

## Table of Contents

- [Text Customization](#text-customization)
- [Adding Translations](#adding-translations)
- [Styling](#styling)
- [Cookie Settings Link](#cookie-settings-link)
- [Privacy Policy](#privacy-policy)
- [UI Features](#ui-features)

## Text Customization

### Override Default Texts

Customize any text displayed by the plugin:

```js
module.exports = {
  plugins: [
    ['docusaurus-plugin-cookie-consent', {
      i18n: {
        texts: {
          en: {
            title: 'We Value Your Privacy',
            description: 'We use cookies to enhance your browsing experience.',
            acceptButton: 'Accept All',
            declineButton: 'Reject All',
            manageButton: 'Manage Preferences',
            closeButton: 'Close',
            requiredLabel: 'Required',
            settingsTitle: 'Cookie Preferences',
            settingsDescription: 'Choose which cookies to accept.',
            acceptSelectedButton: 'Accept Selected',
            acceptAllButton: 'Accept All',
            declineAllButton: 'Decline All',
            privacyPolicyLink: 'Privacy Policy'
          }
        }
      }
    }]
  ]
};
```

### Available Text Keys

| Key | Default | Description |
|-----|---------|-------------|
| `title` | "Manage Consent" | Modal title |
| `description` | "This site uses cookies..." | Main description |
| `acceptButton` | "Accept" | Accept button text |
| `declineButton` | "Decline" | Decline button text |
| `manageButton` | "Manage Preferences" | Settings button text |
| `closeButton` | "Close" | Close button text |
| `requiredLabel` | "Required" | Label for required cookies |
| `settingsTitle` | "Cookie Settings" | Settings modal title |
| `settingsDescription` | "Choose your cookie preferences" | Settings description |
| `acceptSelectedButton` | "Accept Selected" | Accept selected cookies |
| `acceptAllButton` | "Accept All" | Accept all in settings |
| `declineAllButton` | "Decline All" | Decline all in settings |
| `privacyPolicyLink` | "Privacy Policy" | Privacy policy link text |

## Adding Translations

### Add a New Language

1. Create a translation file in your project:

```js
// translations/fr.js
module.exports = {
  texts: {
    fr: {
      title: 'Gestion du Consentement',
      description: 'Ce site utilise des cookies...',
      acceptButton: 'Accepter',
      declineButton: 'Refuser',
      manageButton: 'Gérer les Préférences',
      closeButton: 'Fermer',
      requiredLabel: 'Requis',
      settingsTitle: 'Paramètres des Cookies',
      settingsDescription: 'Choisissez vos préférences de cookies',
      acceptSelectedButton: 'Accepter la Sélection',
      acceptAllButton: 'Tout Accepter',
      declineAllButton: 'Tout Refuser',
      privacyPolicyLink: 'Politique de Confidentialité'
    }
  }
};
```

2. Add to plugin configuration:

```js
const frenchTranslations = require('./translations/fr');

module.exports = {
  plugins: [
    ['docusaurus-plugin-cookie-consent', {
      i18n: {
        texts: {
          ...frenchTranslations.texts,
          // Other languages...
        }
      }
    }]
  ]
};
```

### Force a Specific Locale

Useful for testing translations:

```js
i18n: {
  forceLocale: 'fr'  // Always use French
}
```

### Provider-Specific Translations

Translate provider names and descriptions:

```js
providers: [
  {
    type: 'google',
    id: 'G-XXXXXXXXXX',
    i18n: {
      en: {
        name: 'Google Analytics',
        description: 'Helps us understand site usage'
      },
      fr: {
        name: 'Google Analytics',
        description: 'Nous aide à comprendre l\'utilisation du site'
      },
      de: {
        name: 'Google Analytics',
        description: 'Hilft uns, die Nutzung zu verstehen'
      }
    }
  }
]
```

## Styling

### CSS Variables

Override CSS variables to match your theme:

```css
/* In your custom.css */
:root {
  /* Colors */
  --cookie-consent-primary: #1890ff;
  --cookie-consent-primary-hover: #40a9ff;
  --cookie-consent-text: #333333;
  --cookie-consent-text-secondary: #666666;
  --cookie-consent-border: #d9d9d9;
  --cookie-consent-background: #ffffff;
  --cookie-consent-overlay: rgba(0, 0, 0, 0.45);
  
  /* Spacing */
  --cookie-consent-modal-padding: 24px;
  --cookie-consent-button-padding: 8px 16px;
  
  /* Typography */
  --cookie-consent-font-size: 14px;
  --cookie-consent-title-size: 20px;
  
  /* Layout */
  --cookie-consent-modal-width: 500px;
  --cookie-consent-modal-max-height: 80vh;
}

/* Dark mode overrides */
[data-theme='dark'] {
  --cookie-consent-primary: #177ddc;
  --cookie-consent-text: #ffffff;
  --cookie-consent-background: #1f1f1f;
  --cookie-consent-border: #434343;
}
```

### Component Classes

Target specific components:

```css
/* Modal container */
.cookieConsentModal {
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Title */
.cookieConsentModal h2 {
  font-weight: 600 !important;
  margin-bottom: 16px !important;
}

/* Buttons */
.cookieConsentModal button {
  border-radius: 6px !important;
  font-weight: 500 !important;
}

/* Accept button */
.cookieConsentModal button[class*='accept'] {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

/* Debug widget */
.cookieDebugWidget {
  bottom: 100px !important;  /* Move higher */
  right: 30px !important;
}
```

### Animation Customization

```css
/* Smooth modal entrance */
.cookieConsentModal {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Disable animations */
.cookieConsentModal,
.cookieConsentModal * {
  animation: none !important;
  transition: none !important;
}
```

## Cookie Settings Link

### Default Selector

The plugin looks for elements with class `footer__link-item--cookie-settings`:

```js
// In docusaurus.config.js
footer: {
  links: [{
    items: [{
      label: 'Cookie Settings',
      href: '#',
      className: 'footer__link-item--cookie-settings'
    }]
  }]
}
```

### Custom Selector

Use any CSS selector:

```js
module.exports = {
  plugins: [
    ['docusaurus-plugin-cookie-consent', {
      cookieSettingsSelector: '.my-cookie-link'
    }]
  ]
};
```

Then add the class anywhere:

```jsx
// In a React component
<button className="my-cookie-link">
  Manage Cookie Preferences
</button>

// In navbar
navbar: {
  items: [{
    label: '🍪 Settings',
    href: '#',
    className: 'my-cookie-link'
  }]
}

// In custom footer
<footer>
  <a href="#" className="my-cookie-link">
    Privacy & Cookies
  </a>
</footer>
```

### Multiple Triggers

Use a selector that matches multiple elements:

```js
cookieSettingsSelector: '.cookie-settings, [data-cookie-settings]'
```

```html
<button className="cookie-settings">Settings</button>
<a data-cookie-settings href="#">Cookies</a>
<div className="cookie-settings">Manage</div>
```

## Privacy Policy

### Using the Demo Template

The plugin provides a demo privacy policy at `/privacy-policy-demo`:

```js
privacyPolicy: {
  url: '/privacy-policy-demo',  // URL for the demo page
  disable: false                // Keep demo enabled
}
```

⚠️ **Important**: The demo is only an example. Create your own at `/privacy-policy`.

### Creating Your Own Privacy Policy

1. Disable the demo page:

```js
privacyPolicy: {
  disable: true
}
```

2. Create your policy at `src/pages/privacy-policy.md`:

```markdown
---
title: Privacy Policy
---

# Privacy Policy

Last updated: [Date]

## Information We Collect

[Your content here]

## How We Use Cookies

[Your cookie usage]

## Your Rights

[User rights under GDPR/CCPA]
```

### Linking to Privacy Policy

The plugin automatically links to your privacy policy. Customize the link text:

```js
i18n: {
  texts: {
    en: {
      privacyPolicyLink: 'Our Privacy Policy'
    }
  }
}
```

## UI Features

### Silly Decline Button

Add a playful interaction where the decline button dodges the cursor:

```js
features: {
  sillyDeclineButton: true
}
```

This creates a fun UX that encourages users to read the consent text. The button becomes clickable after a few attempts.

### Disable Specific Features

```js
features: {
  sillyDeclineButton: false,    // Disable silly button
  showDebugWidget: false,        // Hide debug widget even in debug mode
  animateModal: false,          // Disable modal animations
  persistSettings: true         // Remember UI state (expanded/collapsed)
}
```

### Custom Modal Behavior

```js
modalBehavior: {
  closeOnOverlayClick: false,   // Don't close when clicking overlay
  closeOnEscape: true,           // Close with Escape key
  focusTrap: true,              // Trap focus within modal
  autoFocus: 'accept'           // Focus accept button on open
}
```

## Advanced Customization

### Custom Modal Component

For complete control, you can swizzle the component:

```bash
npm run swizzle docusaurus-plugin-cookie-consent CookieConsent
```

Then modify the component in `src/theme/CookieConsent/index.tsx`.

### Conditional Styling

Apply styles based on consent status:

```jsx
import { useConsentStatus } from 'docusaurus-plugin-cookie-consent/client/hooks';

function MyComponent() {
  const hasConsent = useConsentStatus();
  
  return (
    <div className={hasConsent ? 'consent-granted' : 'consent-pending'}>
      {/* Your content */}
    </div>
  );
}
```

```css
.consent-granted {
  /* Styles when cookies accepted */
}

.consent-pending {
  /* Styles when waiting for consent */
  filter: blur(2px);
  pointer-events: none;
}
```

## Best Practices

1. **Keep text concise** - Users don't read long descriptions
2. **Use clear CTAs** - Make button actions obvious
3. **Match your brand** - Customize colors to fit your theme
4. **Test translations** - Verify all languages display correctly
5. **Provide context** - Explain why you need each cookie type
6. **Make it accessible** - Ensure keyboard navigation works
7. **Test on mobile** - Verify responsive design

## See Also

- [Configuration Reference](./CONFIGURATION.md) - All configuration options
- [API Reference](./API.md) - Programmatic customization
- [FAQ](./FAQ.md) - Common customization questions
