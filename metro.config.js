const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Shim Node's `crypto` built-in so the Parse SDK can call crypto.randomUUID()
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve('./shims/crypto'),
};

module.exports = config;
