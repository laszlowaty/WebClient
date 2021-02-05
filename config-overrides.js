const {
    override,
    addDecoratorsLegacy,
    addWebpackAlias,
    disableEsLint
  } = require("customize-cra");
  const path = require("path");

  module.exports = override(
    addDecoratorsLegacy(),
    disableEsLint(),
    addWebpackAlias({
        'mobx': path.resolve(__dirname, '/node_modules/mobx/lib/mobx.es6.js'),
    }),
  );