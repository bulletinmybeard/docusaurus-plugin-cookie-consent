const React = require('react');

const Layout = ({ children, title }) => {
  return React.createElement('div', { 'data-testid': 'layout', 'data-title': title }, children);
};

module.exports = Layout;
module.exports.default = Layout;