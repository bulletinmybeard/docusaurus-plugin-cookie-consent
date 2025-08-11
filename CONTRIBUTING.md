# Contributing to Docusaurus Cookie Consent

Thank you for your interest in contributing to the Docusaurus Cookie Consent plugin! I'm excited to have you here, and I value all types of contributions.

## You Don't Need to Be a Coder to Contribute!

There are many ways to help make this plugin better:

- **Documentation**: Help improve the README, fix typos, or clarify confusing sections
- **Bug Reports**: Found something that doesn't work? Open an issue with details
- **Feature Requests**: Have an idea? I'd love to hear it
- **Testing**: Try the plugin in your Docusaurus site and report your experience
- **Translations**: Help make the plugin accessible in more languages
- **Code**: Fix bugs, add features, or improve performance

Every contribution, no matter how small, makes a difference!

## For Developers

This document provides technical details and guidelines for code contributions. If you're new to Docusaurus plugin development, don't worry - I'll guide you through the process.

## Table of Contents

- [Key Terms](#key-terms)
- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Code Structure](#code-structure)
- [Building and Testing](#building-and-testing)
- [Adding Translations](#adding-translations)
- [Working with Templates](#working-with-templates)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)

## Key Terms

If you're new to Docusaurus plugin development, here are some key terms used throughout this guide:

- **Docusaurus Plugin**: A package that extends Docusaurus functionality. Plugins can add routes, inject scripts, provide theme components, and more.

- **Theme Components**: React components that override or extend Docusaurus's default UI. This plugin uses theme components to inject the cookie consent UI.

- **Swizzling**: Docusaurus's term for overriding theme components. This plugin provides theme components but doesn't require users to swizzle anything.

- **SSR (Server-Side Rendering)**: Docusaurus generates static HTML on the server. Plugins must handle both server and client environments.

- **i18n (Internationalization)**: The process of making the plugin work in multiple languages. Docusaurus has built-in i18n support.

- **Lifecycle Hooks**: Plugin methods that run at different stages (e.g., `getThemePath`, `injectHtmlTags`, `contentLoaded`).

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- A Docusaurus project for testing (v3.0.0 or higher)

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/bulletinmybeard/docusaurus-plugin-cookie-consent.git
cd docusaurus-plugin-cookie-consent
```

2. Install dependencies:

```bash
npm install
```

3. Build the plugin:

```bash
npm run build
```

4. Link the plugin for local development:

```bash
npm link
```

5. In your test Docusaurus project:

```bash
npm link docusaurus-plugin-cookie-consent
```

6. Add the plugin to your `docusaurus.config.js`:

```js
module.exports = {
  plugins: ['docusaurus-plugin-cookie-consent']
};
```

## Architecture Overview

### How the Plugin Works

At a high level, the Cookie Consent plugin follows this flow:

1. **Plugin Registration**: Docusaurus loads the plugin from `docusaurus.config.js`
2. **Client Module Loading**: Plugin's client module automatically runs on page load
3. **Component Injection**: Cookie consent components are injected into the DOM
4. **Configuration Loading**: Settings are injected as global variables
5. **User Interaction**: Cookie consent modal appears on first visit
6. **Consent Storage**: User choice is saved to localStorage
7. **Analytics Loading**: Scripts load only after consent is given

### Conceptual Architecture

```
┌───────────────────-─┐
│  Docusaurus Starts  │
└──────────┬─────────-┘
           │
           ▼
┌────────────────┐     ┌──--─────────────────-─┐
│  Plugin Loads  │────▶│  Injects Config        │
│  (index.ts)    │     │  (window.__CONFIG__)  │
└──────────┬─────┘     └────────────────────---┘
           │
           ▼
┌─────────────────────----┐     ┌──────────────--─┐
│  Client Module          │────▶│  Auto-loads on  │
│  (CookieConsentLoader)  |     │  Page Mount     │
└──────────┬──────────----┘     └──────────────--─┘
           │
           ▼
┌─────────────────┐     ┌───────────────────--─┐
│  DOM Injection  │────▶│  Creates React Root  │
└──────────┬──────┘     │  Injects Components  │
           |            └───────────────────--─┘
           │
           ▼
┌─────────────────────┐
│  Cookie Components  │
├─────────────────────┤
│ • CookieConsent     │ ← Shows modal UI
│ • CookieSettings    │ ← Footer link handler
│ • Analytics Loader  │ ← Loads after consent
└─────────────────────┘
```

### Technical Details

The plugin uses Docusaurus's plugin system and theme components:

### Core Components

1. **Plugin Entry** (`src/plugin/index.ts`)
   - Implements Docusaurus plugin interface
   - Provides theme components via `getThemePath()`
   - Provides client modules via `getClientModules()`
   - Injects configuration via `injectHtmlTags()`
   - Handles privacy policy generation with `contentLoaded()`
   - **Important**: Do NOT export `validateOptions` unless it matches Docusaurus's expected signature

2. **Cookie Consent Loader** (`src/theme/CookieConsentLoader.tsx`)
   - Client module that auto-loads on every page
   - Injects cookie consent components into DOM
   - Creates React root for rendering
   - No user configuration required

3. **Cookie Consent Modal** (`src/components/CookieConsent/index.tsx`)
   - Main UI component
   - Handles accept/decline logic
   - Manages localStorage
   - Implements button swap animation

4. **Cookie Settings Footer** (`src/components/CookieSettingsFooter/index.tsx`)
   - Attaches click handler to footer links
   - Reopens cookie consent modal
   - Uses configurable CSS selector

5. **Translations** (`src/translations/`)
   - Language files for each supported locale
   - Merged with user-provided overrides
   - Automatic locale detection

### Plugin Lifecycle

1. **Registration Phase**:
   - Docusaurus reads plugin from config
   - Plugin validates options
   - Configuration is merged with defaults

2. **Build Phase**:
   - Theme components are copied
   - Configuration is injected as script tag
   - Privacy policy routes are generated (if enabled)

3. **Runtime Phase**:
   - Root component wraps the app
   - Cookie consent checks localStorage
   - Analytics scripts load based on consent

## Code Structure

```bash
src/
├── client/                      # Client API module
│   ├── index.ts                 # Core API functions
│   ├── hooks.ts                 # React hooks
│   └── __tests__/               # Client API tests
├── components/                  # React components
│   ├── CookieConsent/           # Main consent modal
│   │   ├── index.tsx            # Component logic
│   │   ├── consentReducer.ts    # State management
│   │   ├── CookieConsent.module.css
│   │   └── __tests__/           # Component tests
│   ├── CookieDebugWidget/       # Debug panel component
│   │   ├── index.tsx            # Debug widget logic
│   │   └── CookieDebugWidget.module.css
│   ├── CookieSettingsFooter/    # Footer link handler
│   │   ├── index.tsx
│   │   └── __tests__/           # Footer tests
│   └── index.ts                 # Component exports
├── hooks/                       # React hooks
│   ├── index.ts                 # Hook exports
│   ├── useLocale.ts             # Locale detection
│   ├── usePluginConfig.ts        # Config access
│   ├── useTranslations.ts       # Translation loading
│   └── __tests__/               # Hook tests
├── plugin/                      # Docusaurus plugin
│   ├── index.ts                 # Plugin entry point
│   ├── types.ts                 # TypeScript types
│   └── __tests__/               # Plugin tests
├── theme/                       # Theme components
│   ├── CookieConsentLoader.tsx  # Client module for auto-injection
│   ├── PrivacyPolicy.tsx        # Privacy policy page component
│   └── __tests__/               # Theme tests
├── translations/                # i18n files
│   ├── en.ts                    # English (default)
│   ├── de.ts                    # German
│   ├── index.ts                 # Export all translations
│   └── __tests__/               # Translation tests
├── types/                       # TypeScript definitions
│   ├── css-modules.d.ts         # CSS module types
│   └── global.d.ts              # Global type definitions
└── utils/                       # Utilities
    ├── analyticsHelpers.ts      # Analytics utility functions
    ├── configDefaults.ts         # Default configuration
    ├── logger.ts                # Logging utilities
    ├── providerLoader.ts        # Provider loading logic
    ├── validation.ts            # Config validation
    └── __tests__/               # Utility tests
```

## Building and Testing

### Commands

```bash
# Compile TypeScript
npm run build

# Watch mode (auto-compile)
npm run dev

# Run ESLint
npm run lint

# Format with Prettier
npm run format

# Type checking
npm run typecheck
```

### Testing in a Docusaurus Project

1. Create a test Docusaurus site:

```bash
npx create-docusaurus@latest test-site classic
cd test-site
```

2. Link your local plugin:

```bash
npm link ../path/to/docusaurus-plugin-cookie-consent
```

3. Add to `docusaurus.config.js`:

```js
plugins: [
  ['docusaurus-plugin-cookie-consent', {
    providers: [
      {
        type: 'google',
        id: 'G-XXXXXXXXXX'
      }
    ]
  }]
]
```

4. Start the dev server:

```bash
npm start
```

### Testing Checklist

- [ ] Cookie consent modal appears on first visit
- [ ] Save My Choices button works correctly
- [ ] Close button dismisses the modal without saving
- [ ] Feedback message appears after saving choices
- [ ] Choice persists after page reload
- [ ] Analytics scripts load only after consent
- [ ] Footer "Cookie Settings" link works
- [ ] i18n translations display correctly
- [ ] Dark mode styling works
- [ ] No console errors
- [ ] Build succeeds (`npm run build`)
- [ ] Client API functions work correctly
- [ ] React hooks update reactively
- [ ] **Plugin exports are correct** (no `validateOptions` export unless properly implemented)
- [ ] **Test build in a real Docusaurus project** (not just unit tests)

## Adding Translations

### Adding a New Language

1. Create a new translation file:

```js
// src/translations/fr.ts
import type { CookieConsentTranslations } from '../plugin/types';

export const fr: CookieConsentTranslations = {
  title: 'Gérer le consentement',
  description: 'Ce site utilise des cookies et des technologies similaires...',
  consentHelp: 'Votre consentement nous aide à offrir une meilleure expérience.',
  analyticsEnabled: '✓ Suivi analytique activé',
  analyticsDisabled: '✗ Suivi analytique désactivé',
  acceptButton: 'Accepter',
  declineButton: 'Refuser',
  closeButtonAriaLabel: 'Fermer la boîte de dialogue',
  privacyPolicyLinkText: 'Politique de confidentialité',
  cookieSettingsText: 'Paramètres des cookies',
  saveMyChoicesButton: 'Enregistrer mes choix',
  closeButton: 'Fermer',
  selectAll: 'Tout sélectionner',
  choicesSaved: 'Vos choix ont été enregistrés. Vous pouvez les modifier à tout moment.'
};
```

2. Export from translations index:

```js
// src/translations/index.ts
export { en } from './en';
export { de } from './de';
export { fr } from './fr'; // Add this line
```

3. Update the README to mention the new language

4. Test thoroughly with the new locale

### Translation Guidelines

- Keep translations concise (especially buttons)
- Maintain consistent tone across languages
- Consider cultural differences
- Test UI layout with longer text
- Ensure legal accuracy for privacy-related text

## Working with Custom Providers

### Overview

The custom provider type supports advanced features for integrating any third-party analytics or tracking service. It provides multiple loading methods, security features, and lifecycle management.

### Custom Provider Features

#### Loading Methods
- **script-tag**: Traditional script element insertion (default)
- **fetch**: Fetch script with custom headers for authenticated endpoints
- **inline**: Direct inline script execution

#### Security Features
- CORS configuration (crossorigin attribute)
- Subresource integrity (SRI) validation
- Content Security Policy (CSP) nonce support
- Referrer policy control

#### Lifecycle Management
- `onBeforeLoad`: Prepare environment before loading
- `onLoad`: Execute code after successful load
- `onError`: Handle loading failures
- `initCode`: Run initialization after script loads

#### Advanced Options
- Retry logic with exponential backoff
- Timeout configuration
- Wait for global variables
- Custom DOM placement
- Request headers for authenticated endpoints

### Adding New Provider Features

When adding features to custom providers:

1. **Update Types** (`src/plugin/types.ts`):
   - Add new fields to `CustomProvider` interface
   - Ensure backward compatibility

2. **Update Loader** (`src/utils/providerLoader.ts`):
   - Implement loading logic for new features
   - Add error handling and logging

3. **Update Component** (`src/components/CookieConsent/index.tsx`):
   - Integrate new loader capabilities
   - Handle provider validation

4. **Add Tests**:
   - Test new loading methods
   - Verify error scenarios
   - Check backward compatibility

5. **Update Documentation**:
   - Add examples to README
   - Document in this file
   - Update type definitions

## Working with the Client API

### Overview

The client API module provides programmatic access to consent status without requiring developers to know internal implementation details like localStorage keys.

### Adding New API Functions

When adding new functions to the client API:

1. **Add to CookieConsentClient class** (`src/client/index.ts`):
   ```js
   class CookieConsentClient {
     myNewFunction(): ReturnType {
       // Implementation
     }
   }
   ```

2. **Export as convenience function**:
   ```js
   export const myNewFunction = () => cookieConsent.myNewFunction();
   ```

3. **Add TypeScript types** if needed

4. **Create React hook** if appropriate (`src/client/hooks.ts`):
   ```js
   export function useMyNewFeature() {
     // Hook implementation
   }
   ```

5. **Add tests** in `src/client/__tests__/`

6. **Update documentation** in README.md

### Testing Client API

Run client API tests:
```bash
npm test src/client/__tests__
```

Test in a Docusaurus project:
```js
import { getConsentStatus } from 'docusaurus-plugin-cookie-consent/client';

console.log('Consent:', getConsentStatus());
```

### Client API Design Principles

- **SSR Safe**: All functions must handle server-side rendering
- **Type Safe**: Full TypeScript support
- **Reactive**: Changes should trigger updates in React components
- **Backward Compatible**: Don't break existing `window.CookieConsent` API
- **Zero Config**: Work without requiring configuration

## Working with Templates

### Privacy Policy Templates

Templates use Handlebars syntax and are located in `templates/privacy-policy/`.

To modify templates:

1. Edit the `.hbs` files in `templates/privacy-policy/`
2. Keep legal language accurate and GDPR-compliant
3. Test template generation
4. Ensure both language versions are updated

### Adding Template Variables

If you need more variables:

1. Update `PrivacyPolicyConfig` type in `src/plugin/types.ts`
2. Pass variables in the plugin's `generatePrivacyPolicy` function
3. Update documentation

## Code Style

### TypeScript Guidelines

- Use explicit types (avoid `any`)
- Prefer interfaces over type aliases for objects
- Use const assertions for literal types
- Document complex types with JSDoc

### React Guidelines

- Use functional components with hooks
- Implement proper SSR checks (`typeof window !== 'undefined'`)
- Handle loading states gracefully
- Ensure accessibility (ARIA labels, keyboard navigation)

### CSS Guidelines

- Use CSS modules for component styles
- Support both light and dark themes
- Use CSS variables from Docusaurus theme
- Mobile-first responsive design

## Submitting Changes

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run linting and formatting: `npm run lint && npm run format`
5. Build the plugin: `npm run build`
6. Test in a real Docusaurus project
7. Commit with descriptive message
8. Push to your fork
9. Open Pull Request with:
   - Clear description of changes
   - Screenshots if UI changes
   - Test instructions
   - Related issue reference

### Commit Guidelines

- Use conventional commits format
- Examples:
  - `feat: add French translations`
  - `fix: modal not closing on escape key`
  - `docs: update configuration examples`
  - `chore: update dependencies`

## CI/CD

### GitHub Actions

The project uses GitHub Actions for:

1. **CI Workflow**: Runs on every push and PR
   - Linting and type checking
   - Building the plugin
   - Testing on multiple Node versions

2. **Release Workflow**: Triggered by version tags
   - Builds and publishes to NPM
   - Creates GitHub release

## Additional Resources

- [Docusaurus Plugin Development](https://docusaurus.io/docs/api/plugin-methods)
- [Docusaurus Theme Components](https://docusaurus.io/docs/swizzling)
- [Docusaurus i18n](https://docusaurus.io/docs/i18n/introduction)
- [React Documentation](https://react.dev)

## Troubleshooting Common Issues

### Build Error: "The 'path' argument must be of type string"

This error typically occurs when the plugin exports a `validateOptions` function that doesn't match Docusaurus's expected signature.

**Symptoms:**
- Build fails with `TypeError [ERR_INVALID_ARG_TYPE]`
- Error mentions `plugin.options.id` is undefined
- Stack trace points to `@docusaurus/core/lib/server/plugins/actions.js`

**Solution:**
Remove or comment out the `validateOptions` export from `src/plugin/index.ts`:

```js
// DON'T export validateOptions unless it matches Docusaurus's API
// module.exports.validateOptions = validateOptions;  // ❌ Remove this
```

**Why this happens:**
Docusaurus expects `validateOptions` to have the signature `({ validate, options }) => validatedOptions`. If your function has a different signature, it causes the plugin options to be incorrectly nested.

For more details, see [FIX_DOCUMENTATION.md](./FIX_DOCUMENTATION.md).

### Plugin Not Loading

1. Ensure the plugin is properly built: `npm run build`
2. Check that all required files are in the `dist/` directory
3. Verify the plugin is correctly referenced in `docusaurus.config.js`
4. Clear Docusaurus cache: `npx docusaurus clear`

## Questions?

Feel free to open an issue for any questions about the codebase or development process.
