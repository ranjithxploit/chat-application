// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for Firebase
config.resolver.assetExts.push('cjs');
config.resolver.sourceExts.push('cjs');

module.exports = config;