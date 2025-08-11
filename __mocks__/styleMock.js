module.exports = {
  // CSS Module mock - returns the class name as-is
  default: new Proxy({}, {
    get: (target, prop) => prop
  })
};