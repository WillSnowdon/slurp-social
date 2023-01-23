const { getDefaultConfig } = require("expo/metro-config");

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    extraNodeModules: {
      stream: require.resolve("readable-stream"),
      crypto: require.resolve("react-native-crypto"),
      zlib: require.resolve("readable-stream"),
      path: require.resolve("readable-stream"),
    },
  },
};
