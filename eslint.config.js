const js = require('@eslint/js');
const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const prettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
    // Base configuration
    js.configs.recommended,
    prettier,
    
    // Global ignores
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/*.tgz',
            '**/coverage/**',
            '**/*.log',
            '**/.DS_Store',
            '**/*.tmp',
            '**/*.temp',
            '**/templates/**/*.mdx'
        ]
    },
    
    // TypeScript files configuration
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                project: './tsconfig.json',
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2020,
                JSX: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': typescript,
            'react': react,
            'react-hooks': reactHooks
        },
        settings: {
            react: {
                version: 'detect'
            }
        },
        rules: {
            // TypeScript rules
            ...typescript.configs.recommended.rules,
            '@typescript-eslint/naming-convention': [
                'warn',
                {
                    selector: 'default',
                    format: ['camelCase']
                },
                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE', 'PascalCase']
                },
                {
                    selector: 'function',
                    format: ['camelCase', 'PascalCase']
                },
                {
                    selector: 'parameter',
                    format: ['camelCase'],
                    leadingUnderscore: 'allow'
                },
                {
                    selector: 'memberLike',
                    modifiers: ['private'],
                    format: ['camelCase'],
                    leadingUnderscore: 'allow'
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase']
                },
                {
                    selector: 'enumMember',
                    format: ['PascalCase']
                },
                {
                    selector: 'objectLiteralProperty',
                    format: null
                },
                {
                    selector: 'import',
                    format: null
                },
                {
                    selector: 'typeProperty',
                    filter: {
                        regex: '^(CookieConsent|__COOKIE_CONSENT_CONFIG__|__docusaurus)$',
                        match: true
                    },
                    format: null
                }
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ],
            '@typescript-eslint/explicit-function-return-type': [
                'warn',
                {
                    allowExpressions: true,
                    allowTypedFunctionExpressions: true
                }
            ],
            '@typescript-eslint/no-non-null-assertion': 'warn',
            
            // React rules
            ...react.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            
            // React Hooks rules
            ...reactHooks.configs.recommended.rules,
            
            // General rules
            'curly': 'warn',
            'eqeqeq': 'warn',
            'no-throw-literal': 'warn',
            'semi': 'warn'
        }
    },
    
    // Test files configuration
    {
        files: ['**/*.test.ts', '**/*.test.tsx'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                project: './tsconfig.test.json',
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                ...globals.jest,
                ...globals.browser,
                ...globals.node,
                JSX: 'readonly'
            }
        }
    }
];