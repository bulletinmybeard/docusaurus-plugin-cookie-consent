import React from 'react';
import { render, screen } from '@testing-library/react';
import PrivacyPolicy from '../PrivacyPolicy';

// Mock react-markdown and remark-gfm since they're optional dependencies
jest.mock('react-markdown');
jest.mock('remark-gfm');

// Mock Docusaurus modules
jest.mock('@theme/Layout', () => ({
    __esModule: true,
    default: ({ children, title }: { children: React.ReactNode; title?: string }) => (
        <div data-testid="layout" data-title={title}>
            {children}
        </div>
    )
}));

jest.mock('@docusaurus/Translate', () => ({
    translate: ({ message }: { message: string }) => message
}));

describe('PrivacyPolicy', () => {
    const mockContent = `---
title: Privacy Policy
slug: /privacy-policy
---

# Privacy Policy

This is a test privacy policy with **bold text** and [a link](https://example.com).

## Section 1

- Item 1
- Item 2

### Subsection

Some \`inline code\` and a code block:

\`\`\`
const test = "hello";
\`\`\`
`;

    it('should render without crashing', () => {
        render(<PrivacyPolicy content={mockContent} />);
        expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('should remove frontmatter from content', () => {
        render(<PrivacyPolicy content={mockContent} />);
        const markdown = screen.getByTestId('react-markdown');
        expect(markdown.textContent).not.toContain('---');
        expect(markdown.textContent).not.toContain('slug: /privacy-policy');
        expect(markdown.textContent).toContain('# Privacy Policy');
    });

    it('should render markdown content', () => {
        render(<PrivacyPolicy content={mockContent} />);
        const markdown = screen.getByTestId('react-markdown');
        expect(markdown.textContent).toContain('This is a test privacy policy');
        expect(markdown.textContent).toContain('Section 1');
        expect(markdown.textContent).toContain('Item 1');
    });

    it('should handle empty content', () => {
        render(<PrivacyPolicy content="" />);
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
    });

    it('should set proper page metadata', () => {
        render(<PrivacyPolicy content={mockContent} />);
        const layout = screen.getByTestId('layout');
        expect(layout).toHaveAttribute('data-title', 'Privacy Policy');
    });
});
