module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Reanimated 4 + worklets: babel-preset-expo already injects
    // react-native-worklets/plugin when the package is installed.
    // Do not add react-native-reanimated/plugin here — it re-exports the
    // same plugin and running it twice causes "Duplicate __self" Babel errors.
    plugins: [],
  };
};
