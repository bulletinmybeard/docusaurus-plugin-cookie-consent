module.exports = {
  __esModule: true,
  default: ({ children }) => {
    const React = require('react');
    // Simple mock that renders the markdown content
    return React.createElement('div', { 'data-testid': 'react-markdown' }, children);
  }
};
