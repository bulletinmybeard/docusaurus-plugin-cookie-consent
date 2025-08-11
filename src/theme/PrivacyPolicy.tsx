import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Type definitions for react-markdown components
interface MarkdownComponentProps {
    children?: React.ReactNode;
    href?: string;
    inline?: boolean;
    [key: string]: unknown;
}

type MarkdownComponents = {
    [key: string]: React.ComponentType<MarkdownComponentProps>;
};

interface PrivacyPolicyProps {
    readonly content: string;
}

export default function PrivacyPolicy(props: PrivacyPolicyProps): React.JSX.Element {
    // Import Docusaurus components dynamically at runtime
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Layout = require('@theme/Layout').default;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { translate } = require('@docusaurus/Translate');

    // Extract the markdown content without frontmatter
    const content = props.content || '';
    const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');

    // Custom components for markdown elements to match Docusaurus styling
    const markdownComponents: MarkdownComponents = {
        // Ensure links open in new tab for external URLs
        a: ({ href, children }: MarkdownComponentProps) => {
            const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
            return (
                <a
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                    {children}
                </a>
            );
        },
        // Add classes for proper Docusaurus styling
        h1: ({ children }: MarkdownComponentProps) => <h1 className="hero__title">{children}</h1>,
        h2: ({ children }: MarkdownComponentProps) => <h2>{children}</h2>,
        h3: ({ children }: MarkdownComponentProps) => <h3>{children}</h3>,
        ul: ({ children }: MarkdownComponentProps) => <ul className="markdown-list">{children}</ul>,
        ol: ({ children }: MarkdownComponentProps) => <ol className="markdown-list">{children}</ol>,
        code: ({ inline, children }: MarkdownComponentProps) => {
            if (inline) {
                return <code>{children}</code>;
            }
            return (
                <pre>
                    <code>{children}</code>
                </pre>
            );
        }
    };

    return (
        <Layout
            title={translate({
                id: 'cookieConsent.privacyPolicy.title',
                message: 'Privacy Policy',
                description: 'Privacy policy page title'
            })}
            description={translate({
                id: 'cookieConsent.privacyPolicy.description',
                message: 'Our privacy policy and cookie usage information',
                description: 'Privacy policy page description'
            })}
        >
            <main>
                <div className="container margin-vert--lg">
                    <div className="row">
                        <div className="col col--8 col--offset-2">
                            <div className="markdown">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={markdownComponents}
                                >
                                    {contentWithoutFrontmatter}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    );
}
