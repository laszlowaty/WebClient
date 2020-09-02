const {
    override,
    addDecoratorsLegacy,
    disableEsLint,
    addBundleVisualizer,
    addWebpackAlias,
    adjustWorkbox
  } = require("customize-cra");
  const path = require("path");

  module.exports = override(
    addDecoratorsLegacy(),
    disableEsLint(),
    addWebpackAlias({
        'mobx': path.resolve(__dirname, '/node_modules/mobx/lib/mobx.es6.js'),
    }),
  );