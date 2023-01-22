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
    // resolverMainFields: ["browser","react-native", "main"],
    extraNodeModules: {
      stream: require.resolve("readable-stream"),
      crypto: require.resolve("react-native-crypto"),
    },
  },
};
