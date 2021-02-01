const {
    override,
    addDecoratorsLegacy,
    addWebpackAlias,
  } = require("customize-cra");
  const path = require("path");

  module.exports = override(
    addDecoratorsLegacy(),
    addWebpackAlias({
        'mobx': path.resolve(__dirname, '/node_modules/mobx/lib/mobx.es6.js'),
    }),
  );