const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { assetExts } = config.resolver;
if (!assetExts.includes('mp4')) {
  assetExts.push('mp4');
}

module.exports = config;
