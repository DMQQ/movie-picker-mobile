const createExpoWebboardConfig = require("@expo/webpack-config");
const path = require("path");

module.exports = async function (env, argv) {
  const config = await createExpoWebboardConfig(env, argv);

  // Add support for loading fonts
  config.module.rules.push({
    test: /\.ttf$/,
    type: "asset/resource",
    include: [path.resolve(__dirname, "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts")],
  });

  // Required aliases
  config.resolve.alias = {
    ...config.resolve.alias,
    "react-native-vector-icons": "react-native-vector-icons/dist",
    "@expo/vector-icons": "@expo/vector-icons/build/vendor/react-native-vector-icons",
  };

  return config;
};
