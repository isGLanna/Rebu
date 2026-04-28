const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// This makes it possible to import .glb files in your code
config.resolver.assetExts = [...config.resolver.assetExts, "glb"];

module.exports = config;