module.exports = {
  compile: jest.fn(() => (vars) => 'Mock Privacy Policy Template'),
  registerHelper: jest.fn(),
  SafeString: jest.fn(function(value) {
    this.toString = () => value;
    return value;
  }),
  create: jest.fn(() => ({
    compile: jest.fn(() => (vars) => 'Mock Privacy Policy Template'),
    registerHelper: jest.fn(),
    SafeString: jest.fn((value) => value)
  }))
};
