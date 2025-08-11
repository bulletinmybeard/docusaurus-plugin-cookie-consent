# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-08-11

### Initial Release

**Docusaurus Cookie Consent** - A GDPR-compliant cookie consent plugin for Docusaurus v3 with zero configuration required.

### ✨ Key Features

- **Zero Configuration**: Works immediately after installation with sensible defaults
- **No Theme Swizzling**: Automatic component injection without modifying Docusaurus themes
- **GDPR Compliant**: Scripts only load after explicit user consent
- **Multi-Provider Support**: Built-in support for Google Analytics, Google Tag Manager, Hotjar, and custom scripts
- **Granular Consent**: Users can choose which analytics providers to allow
- **Built-in Translations**: English and German included, easy to add more languages
- **User-Friendly UI**: Clean modal with feedback messages after saving choices
- **Theme-Aware**: Automatically matches Docusaurus light/dark mode
- **TypeScript Support**: Full type definitions for better developer experience

### Client API

Programmatic access to consent management:

- `getConsentStatus()` - Check current consent status
- `updateConsent()` - Update consent programmatically
- `resetConsent()` - Show consent modal again
- React hooks for reactive consent status

### Requirements

- Docusaurus v3.0.0 or higher
- Node.js 18.0.0 or higher
- React 18 or 19

### Notes

This is the first stable release. Please report any issues on [GitHub](https://github.com/bulletinmybeard/docusaurus-plugin-cookie-consent/issues).
