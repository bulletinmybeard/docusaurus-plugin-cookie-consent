# Frequently Asked Questions

Common questions about the Docusaurus Cookie Consent plugin.

## Table of Contents

- [General Questions](#general-questions)
- [GDPR & Compliance](#gdpr--compliance)
- [Technical Questions](#technical-questions)
- [Docusaurus Questions](#docusaurus-questions)

## General Questions

### What cookies does this plugin use?

The plugin itself only creates one cookie:

| Cookie Name | Purpose | Duration | Type |
|------------|---------|----------|------|
| `docusaurus_cookie_consent` | Stores user's consent choice | 365 days | Functional |

Your Docusaurus site may also use:
- `theme` - Light/dark mode preference (Docusaurus)
- `docusaurus.tab.*` - Selected tabs in code blocks (Docusaurus)
- Analytics cookies - Only loaded after consent

### Can I use this with other analytics providers?

Yes! The plugin supports:
- **Built-in**: Google Analytics, Google Tag Manager, Hotjar
- **Custom**: Any analytics service via custom provider type

See [Providers Documentation](./PROVIDERS.md) for examples.

### How do I test different languages?

```js
// Force a specific locale for testing
i18n: {
  forceLocale: 'de'  // Test German
}
```

Or change your browser's language settings.

### Can I use this without any analytics?

Yes! The plugin works standalone:

```js
plugins: ['docusaurus-plugin-cookie-consent']
```

This is useful for:
- Compliance demonstration
- Future analytics readiness
- Managing Docusaurus's own cookies

### Is this plugin free to use?

Yes, it's MIT licensed. Use it in commercial projects, modify it, distribute it - completely free.

## GDPR & Compliance

### What is GDPR?

General Data Protection Regulation - EU law protecting user privacy. Key requirements:

- **Explicit consent** before collecting data
- **Clear information** about data usage
- **Easy withdrawal** of consent
- **Data portability** and deletion rights

### What regulations does this comply with?

The plugin helps with:
- **GDPR** (European Union)
- **CCPA** (California)
- **ePrivacy Directive** (EU Cookie Law)
- **LGPD** (Brazil)
- **PIPEDA** (Canada)

Note: Compliance depends on proper configuration and privacy policy.

### Do I need a privacy policy?

**Yes!** The plugin provides a demo template, but you must create your own:

1. The demo at `/privacy-policy-demo` is just an example
2. Create your real policy at `/privacy-policy`
3. Include your actual data practices
4. Consult legal counsel if needed

### When do I need cookie consent?

You need consent when:
- Using analytics (Google Analytics, etc.)
- Tracking user behavior
- Using marketing cookies
- Collecting personal data

You don't need consent for:
- Essential cookies (authentication, security)
- User preference cookies (with clear notice)
- Anonymous analytics (in some jurisdictions)

### What happens if users decline cookies?

When users decline:
- No analytics scripts load
- No tracking occurs
- Site remains fully functional
- Choice is remembered (ironically, via a cookie)

## Technical Questions

### Why isn't the modal showing?

Common reasons:
1. You already consented (clear cookies)
2. JavaScript error (check console)
3. Plugin not installed correctly
4. Browser blocking localStorage

See [Troubleshooting](./TROUBLESHOOTING.md) for solutions.

### Can I programmatically control consent?

Yes! Use the client API:

```js
import { updateConsent, resetConsent } from 'docusaurus-plugin-cookie-consent/client';

// Accept cookies
updateConsent(true);

// Show modal again
resetConsent();
```

See [API Reference](./API.md) for details.

### How do I style the modal?

Use CSS variables or custom styles:

```css
:root {
  --cookie-consent-primary: #007bff;
  --cookie-consent-text: #333;
}
```

See [Customization Guide](./CUSTOMIZATION.md).

### Does this work with SSR/SSG?

Yes! The plugin handles both:
- **SSG**: Scripts injected at build time
- **Client**: Consent checked at runtime
- **Hydration**: Smooth transition

### Can I use this with TypeScript?

Yes, the plugin is written in TypeScript and includes type definitions:

```js
import { ConsentStatus } from 'docusaurus-plugin-cookie-consent/client';
```

### How do I debug analytics issues?

Enable debug mode:

```js
providers: [{
  type: 'google',
  id: 'G-XXXXXXXXXX',
  debug: true  // Shows debug panel
}]
```

## Docusaurus Questions

### Do I need to swizzle any components?

**No!** The plugin works without swizzling. It automatically injects components.

### Which Docusaurus versions are supported?

- Docusaurus 3.0+
- Node.js 18.0+
- React 18 or 19

### Can I use this with Docusaurus themes?

Yes, works with:
- Classic theme (recommended)
- Custom themes
- Modified themes

### How does this differ from gtag plugin?

| Feature | This Plugin | @docusaurus/plugin-gtag |
|---------|------------|-------------------------|
| GDPR Compliant | ✅ Yes | ❌ No |
| Consent UI | ✅ Built-in | ❌ None |
| Multiple Providers | ✅ Yes | ❌ Google only |
| Granular Consent | ✅ Yes | ❌ No |
| No Swizzling | ✅ Yes | ✅ Yes |

### Can I use both plugins together?

Not recommended. This plugin replaces gtag functionality with consent management.

### Does this work with Docusaurus i18n?

Yes! The plugin:
- Detects site locale automatically
- Supports multiple languages
- Allows locale overrides

### Will this slow down my site?

Minimal impact:
- ~15KB gzipped
- Lazy loads analytics
- No render blocking
- Efficient React components

### Can I use this in Docusaurus blog?

Yes, works everywhere:
- Blog posts
- Documentation
- Pages
- Landing pages

## Privacy Policy Questions

### Should I use the demo privacy policy?

**No!** The demo is only an example. You must:
1. Create your own at `/privacy-policy`
2. Include your actual practices
3. List all data collected
4. Explain user rights
5. Provide contact information

### What should my privacy policy include?

Essential sections:
- Data collected
- Purpose of collection
- Third parties involved
- User rights
- Contact information
- Cookie details
- Data retention
- Security measures

### How often should I update it?

Update when:
- Adding new analytics
- Changing data practices
- Regulations change
- Adding third-party services

## Getting Started Questions

### What's the minimal setup?

```js
// docusaurus.config.js
module.exports = {
  plugins: ['docusaurus-plugin-cookie-consent']
};
```

### How do I add Google Analytics?

```js
plugins: [
  ['docusaurus-plugin-cookie-consent', {
    providers: [{
      type: 'google',
      id: 'G-XXXXXXXXXX'
    }]
  }]
]
```

### Where do I find my GA4 ID?

1. Go to Google Analytics
2. Admin → Data Streams
3. Select your web stream
4. Copy Measurement ID (G-XXXXXXXXXX)

### How do I test locally?

1. Start dev server: `npm run start`
2. Open incognito window
3. Visit localhost:3000
4. Modal should appear

## Still Have Questions?

- Check [full documentation](../README.md)
- [Open an issue](https://github.com/bulletinmybeard/docusaurus-plugin-cookie-consent/issues)
- [Start a discussion](https://github.com/bulletinmybeard/docusaurus-plugin-cookie-consent/discussions)

## See Also

- [Configuration Reference](./CONFIGURATION.md)
- [Providers Documentation](./PROVIDERS.md)
- [API Reference](./API.md)
- [Customization Guide](./CUSTOMIZATION.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
