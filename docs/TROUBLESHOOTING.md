# Troubleshooting Guide

Solutions to common issues and debugging tips for the cookie consent plugin.

## Table of Contents

- [Common Issues](#common-issues)
- [Debug Mode](#debug-mode)
- [Analytics Issues](#analytics-issues)
- [Testing Locally](#testing-locally)
- [Browser-Specific Issues](#browser-specific-issues)
- [Getting Help](#getting-help)

## Common Issues

### Modal Not Showing

The consent modal isn't appearing when you expect it to.

#### Solutions

1. **Clear browser data**
   - You may have already made a consent decision
   - Clear cookies and localStorage for your site
   
2. **Check localStorage**
   ```js
   // In browser console
   localStorage.removeItem('docusaurus_cookie_consent');
   location.reload();
   ```

3. **Use incognito/private mode**
   - Fresh state for testing
   - No cached consent decisions

4. **Check browser console**
   - Look for JavaScript errors
   - Verify plugin is loading

5. **Verify installation**
   ```js
   // Check if plugin is loaded
   console.log(window.CookieConsent);
   ```

### Modal Shows on Every Page Load

The consent decision isn't being saved.

#### Solutions

1. **Check cookie settings**
   ```js
   // Verify cookies are enabled in browser
   document.cookie = "test=1";
   console.log(document.cookie);
   ```

2. **Check localStorage availability**
   ```js
   // Test localStorage
   try {
     localStorage.setItem('test', '1');
     localStorage.removeItem('test');
     console.log('localStorage works');
   } catch (e) {
     console.error('localStorage blocked:', e);
   }
   ```

3. **Verify cookie configuration**
   ```js
   cookieConfig: {
     name: 'docusaurus_cookie_consent',
     expiry: 365  // Make sure this is set
   }
   ```

### Styles Not Applying

Custom styles aren't showing up.

#### Solutions

1. **Check CSS specificity**
   ```css
   /* Use !important if needed */
   .cookieConsentModal {
     background: red !important;
   }
   ```

2. **Verify CSS is loaded**
   - Check network tab for your CSS file
   - Ensure it loads after plugin styles

3. **Use correct selectors**
   ```css
   /* Correct class names */
   .cookieConsentModal { }
   .cookieConsentModal__content { }
   .cookieConsentModal__buttons { }
   ```

## Debug Mode

### Enabling Debug Mode

Add `debug: true` to any provider:

```js
providers: [
  {
    type: 'google',
    id: 'G-XXXXXXXXXX',
    debug: true  // Enable debug mode
  }
]
```

### Debug Panel Features

Click the 🐞 button to open the debug panel:

- **Provider Status**: ✅ Loaded / ❌ Not loaded
- **Configuration**: View current settings
- **Test Events**: Send test analytics events
- **Console Logs**: Detailed logging enabled

### Debug Console Messages

With debug mode enabled, check console for:

```
[Cookie Consent] Initializing...
[Cookie Consent] Config: {...}
[Cookie Consent] Consent status: true
[Cookie Consent] Loading provider: google
[Cookie Consent] Provider loaded: google
[Cookie Consent] Test event sent
```

## Analytics Issues

### Google Analytics Not Tracking

GA4 events aren't showing up in your dashboard.

#### Solutions

1. **Verify GA4 ID**
   ```js
   // Correct format: G-XXXXXXXXXX
   {
     type: 'google',
     id: 'G-XXXXXXXXXX'  // Not UA-XXXXX
   }
   ```

2. **Check DebugView**
   - Go to GA4 → Admin → DebugView
   - Events appear in real-time
   - Enable debug mode in plugin

3. **Verify in Network tab**
   - Look for requests to `google-analytics.com/g/collect`
   - Should see 200 OK responses

4. **Check consent status**
   ```js
   // In console
   window.CookieConsent.getStatus();  // Should be true
   ```

5. **Cookie issues on localhost**
   ```js
   // Remove cookieFlags for local testing
   options: {
     // cookieFlags: 'SameSite=None;Secure'  // Comment out
   }
   ```

### Hotjar Not Working on Localhost

Hotjar requires HTTPS to function properly.

#### Solution: Use ngrok

1. **Install ngrok**
   ```bash
   npm install -g ngrok
   # or download from https://ngrok.com
   ```

2. **Start your dev server**
   ```bash
   npm run start  # Usually port 3000
   ```

3. **Create HTTPS tunnel**
   ```bash
   ngrok http 3000
   ```

4. **Use the HTTPS URL**
   ```
   Forwarding: https://abc123.ngrok.io → localhost:3000
   ```

5. **Visit HTTPS URL and accept cookies**

### Custom Provider Not Loading

Your custom analytics script isn't loading.

#### Solutions

1. **Check script URL**
   ```js
   {
     type: 'custom',
     src: 'https://example.com/script.js',  // Verify URL is correct
     debug: true  // Enable logging
   }
   ```

2. **Check CORS**
   - Script must allow cross-origin loading
   - Check browser console for CORS errors

3. **Verify load order**
   ```js
   options: {
     async: false,  // Load synchronously if needed
     defer: false   // Don't defer if dependencies exist
   }
   ```

4. **Add error handling**
   ```js
   options: {
     onError: (error) => {
       console.error('Script failed:', error);
     }
   }
   ```

## Testing Locally

### Testing Different Languages

```js
// Force specific locale for testing
i18n: {
  forceLocale: 'de'  // Test German translations
}
```

### Testing Consent Flow

1. **Reset consent between tests**
   ```js
   // In browser console
   window.CookieConsent.reset();
   ```

2. **Test all scenarios**
   - Accept all
   - Decline all
   - Accept specific providers
   - Change decision

3. **Automated testing**
   ```js
   // In your test file
   beforeEach(() => {
     localStorage.clear();
     document.cookie.split(";").forEach(c => {
       document.cookie = c.replace(/^ +/, "")
         .replace(/=.*/, "=;expires=" + new Date().toUTCString());
     });
   });
   ```

### Testing on Mobile

1. **Use responsive mode**
   - Chrome: F12 → Toggle device toolbar
   - Test different screen sizes

2. **Test on real devices**
   - Use local network IP
   - Or use ngrok for external access

3. **Check touch interactions**
   - Buttons are tappable
   - Modal is scrollable
   - No hover-dependent features

## Browser-Specific Issues

### Safari/iOS Issues

1. **Third-party cookie blocking**
   - Safari blocks third-party cookies by default
   - Test with first-party cookies only

2. **localStorage in private mode**
   - iOS Safari disables localStorage in private mode
   - Provide fallback or warning

### Firefox Issues

1. **Enhanced Tracking Protection**
   - May block analytics scripts
   - Test with protection disabled

2. **Strict cookie settings**
   - Check Firefox privacy settings
   - Test with standard settings

### Chrome Issues

1. **SameSite cookie warnings**
   ```js
   // Fix SameSite warnings
   options: {
     cookieFlags: 'SameSite=Lax;Secure'
   }
   ```

2. **Third-party cookie phase-out**
   - Chrome planning to block third-party cookies
   - Test with chrome://flags

## Getting Help

### Before Asking for Help

1. **Check documentation**
   - Read relevant docs sections
   - Search existing issues

2. **Gather information**
   ```js
   // Plugin version
   npm list docusaurus-plugin-cookie-consent
   
   // Docusaurus version
   npm list @docusaurus/core
   
   // Browser and OS
   navigator.userAgent
   
   // Plugin config (remove sensitive IDs)
   console.log(window.CookieConsent?.getConfig());
   ```

3. **Create minimal reproduction**
   - Isolate the issue
   - Remove unrelated code
   - Share reproducible example

### Where to Get Help

1. **GitHub Issues**
   - [Report bugs](https://github.com/bulletinmybeard/docusaurus-plugin-cookie-consent/issues)
   - Search existing issues first
   - Use issue templates

2. **GitHub Discussions**
   - [Ask questions](https://github.com/bulletinmybeard/docusaurus-plugin-cookie-consent/discussions)
   - Share tips and tricks
   - Request features

3. **Provide Details**
   - Exact error messages
   - Steps to reproduce
   - Expected vs actual behavior
   - Configuration used
   - Browser/OS information

### Debug Checklist

- [ ] Cleared browser cache and cookies
- [ ] Tested in incognito mode
- [ ] Checked browser console for errors
- [ ] Enabled debug mode
- [ ] Verified configuration syntax
- [ ] Tested in different browsers
- [ ] Checked network tab for failed requests
- [ ] Verified provider IDs are correct
- [ ] Tested with minimal configuration
- [ ] Read relevant documentation

## See Also

- [Configuration Reference](./CONFIGURATION.md) - Configuration options
- [Providers Documentation](./PROVIDERS.md) - Provider-specific issues
- [FAQ](./FAQ.md) - Frequently asked questions
- [API Reference](./API.md) - Debugging with API
