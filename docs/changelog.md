---
title: Changelog
permalink: /changelog
nav_order: 10
---

# Changelog

## v1.0

- **Breaking**: End support for Node v10. Node v12.13 or later is now required.
- **Breaking**: Switch to Webpack 5 and Webpack DevServer 4
- **Breaking**: Include a contenthash string in default bundle file names. Set `filename: '[name].js'` in your output configuration to restore the old behavior.
- **Breaking**: Default DevServer manifest name is now `development-asset-manifest.json`, not `asset-manifest.json`.
- **Breaking**: Replace `filterLoaders` system with [individual hooks accesible via the new `addFilter` and `removeFilter` helpers](https://humanmade.github.io/webpack-helpers/modules/presets.html#customizing-presets).
- **Breaking**: Remove deprecated `eslint-loader` and add `eslint-webpack-plugin` to presets as `plugins.eslint()`.
- **Potentially Breaking**: Remove `loaders.url()` and `loaders.file()` in favor of Webpack 5 [`asset` modules](https://webpack.js.org/guides/asset-modules/), now usable by including `loaders.asset()` (for assets which can be inlined) and `loaders.resource()` (as a catch-all for other types) in your module rules list. Asset modules are handled automatically in both presets, so this is only breaking if `loaders.url()` or `loaders.file()` was used directly.
- A `webpack-bundle-analyzer` plugin is now automatically added to production builds when Webpack is invoked with the `--analyze` flag.
- Add the [`simple-build-report-webpack-plugin`](https://github.com/kadamwhite/simple-build-report-webpack-plugin) as `plugins.simpleBuildReport()`
- Include a `plugins.simpleBuildReport()` instance in production preset builds to improve legibility of Webpack console output.
- `plugins.fixStyleOnlyEntries()` now uses [`webpack-remove-empty-scripts`](https://github.com/webdiscus/webpack-remove-empty-scripts#webpack-remove-empty-scripts) instead of `webpack-fix-style-only-entries` due to Webpack 5 compatiblity issues with the original plugin.
- Allow `null` to be returned from an `addFilter` callback to skip a loader when using a configuration preset.
- Do not deep merge options passed to `plugins.terserPlugin()`: options object can now fully overwrite `terserOptions` property if needed.
- Permit filtering the Terser default configuration using `addFilter( 'plugin/terser/defaults', cb )`.
- Remove `OptimizeCssAssetsPlugin` (`plugins.optimizeCssAssets()`) in favor of Webpack 5-compatible [CssMinimizerPlugin](https://github.com/webpack-contrib/css-minimizer-webpack-plugin) (`plugins.cssMinimizer()`)
- Remove `plugins.hotModuleReplacement()`, which is now handled automatically by the DevServer in `hot` mode.
- Include the `contenthash` in generated CSS filenames. [#204](https://github.com/humanmade/webpack-helpers/pull/204)

## v0.11.1

- Do not compress output or strip comments in the SASS loader. This fixes an issue where autoprefixer directive comments would be removed by `sass-loader`, potentially causing compilation errors. [#180](https://github.com/humanmade/webpack-helpers/pull/180)

## v0.11.0

- Correctly output `.rtl.css` manifest entries when using the `WebpackRTLPlugin`. [#171](https://github.com/humanmade/webpack-helpers/pull/171)
- **Breaking**: Require Webpack CLI version 3 to avoid DevServer issues. If your project uses v4, run `npm install webpack-cli@3` to downgrade. [#168](https://github.com/humanmade/webpack-helpers/pull/168)
- **Potentially Breaking:** Extend auto-shared seeds for manifest generation to `development` preset. The upshot of this is that multi-config setups in development don't need custom manifest configurations to use the same manifest--they'll do so automatically. [#166](https://github.com/humanmade/webpack-helpers/pull/166)
- Internal: Pin `run-parallel` subdependency (required by `copy-webpack-plugin`) to 1.1.9 to guarantee Node v10 compatibility. [#167](https://github.com/humanmade/webpack-helpers/pull/167)

## v0.10.2

- Correctly infer a default publicPath when using `withDynamicPort` helper. [#161](https://github.com/humanmade/webpack-helpers/pull/161)

## v0.10.1

- Update WordPress `externals` object to match latest bundled scripts. [#160](https://github.com/humanmade/webpack-helpers/pull/160)

## v0.10

**New Features**

- Adapt the value of `output.path` when inferring `output.publicPath` in DevServer so that all assets are correctly served in multi-config situations. [#156](https://github.com/humanmade/webpack-helpers/pull/156)
- Generate a `production-asset-manifest.json` for all production preset builds. [#153](https://github.com/humanmade/webpack-helpers/pull/153) Builds in a multi-configuration setup which target the same output folder will share a manifest. [#154](https://github.com/humanmade/webpack-helpers/pull/154)

**Upgrades & Changes**

- **Potentially Breaking**: Update `mini-css-extract-plugin` to v1.3.4. [Changelog](https://github.com/webpack-contrib/mini-css-extract-plugin/blob/master/CHANGELOG.md). [#148](https://github.com/humanmade/webpack-helpers/pull/148)
- **Potentially Breaking**: Update `css-loader` to v5.0.1. [Changelog](https://github.com/webpack-contrib/css-loader/blob/master/CHANGELOG.md). [#136](https://github.com/humanmade/webpack-helpers/pull/136)
- **Potentially Breaking**: Update `style-loader` to v2.0.0. [Changelog](https://github.com/webpack-contrib/style-loader/blob/master/CHANGELOG.md). [#127](https://github.com/humanmade/webpack-helpers/pull/127)

All three of the above dependency upgrades include breaking API changes. None of these changes should impact vanilla usage of the [presets](https://humanmade.github.io/webpack-helpers/modules/presets.html) provided by these helpers, but we recommend reviewing all three libraries' changelogs to identify potential issues if you are [customizing presets or loader behavior](https://humanmade.github.io/webpack-helpers/modules/presets.html#customizing-presets) relating to stylesheets.

- **Potentially Breaking**: Update `webpack-manifest-plugin` to v3.0.0. [Changelog](https://github.com/shellscape/webpack-manifest-plugin/releases). [#143](https://github.com/humanmade/webpack-helpers/pull/143)

The manifest plugin now exports its constructor as a named export, not a default, so any custom builds which pull in the `ManifestPlugin` constructor directly from the plugin dependency (as opposed to using the recommended `plugins.manifest()` factory function) will need to switch to using `plugins.constructors.ManifestPlugin`. This should not impact un-customized presets.

- **Potentially Breaking**: Update `postcss-flexbugs-fixes` to v5.0.2 and update `postcss-loader` to v4.1.0. [#152](https://github.com/humanmade/webpack-helpers/pull/152)

The upgrade to `postcss-loader` requires nesting PostCSS configuration options within a `.postcssOptions` key on the object passed to the webpack loader. As with the style loading changes above, if you use the presets without customization this should not impact your project. Otherwise, ensure you have added this level of nesting to any code which customizes the `postcss-loader`'s configuration object. Consult the [`postcss-loader` changelog](https://github.com/webpack-contrib/postcss-loader/blob/master/CHANGELOG.md#-breaking-changes) for more information.

- Upgrade `webpack-fix-style-only-entries` plugin to v0.6.0. This may resolve the issue previously documented in [#93](https://github.com/humanmade/webpack-helpers/pull/93) where files would be incorrectly deleted when processing an array of webpack configuration objects. [#129](https://github.com/humanmade/webpack-helpers/pull/129)
- Include `postcss` as a direct dependency of this package, rather than a subdependency. [#151](https://github.com/humanmade/webpack-helpers/pull/151)
- Update `webpack-bundle-analyzer` bundled plugin to v4.3.0. [#146](https://github.com/humanmade/webpack-helpers/pull/146)

- Internal: Add the generation of a basic development and production bundle, including scss styles, to the CI job. [#149](https://github.com/humanmade/webpack-helpers/pull/149)
- Internal: Upgrade local development dependencies to latest versions. [#150](https://github.com/humanmade/webpack-helpers/pull/150)

## v0.9

- Introduce support for filtering entire stylesheet loader chain by matching against the special `loaderKey` value "stylesheet" [when passing a `filterLoaders` method into a preset](https://humanmade.github.io/webpack-helpers/modules/presets.html#customizing-presets). [#124](https://github.com/humanmade/webpack-helpers/pull/124)
- The bundled version of `terser-webpack-plugin` has been upgraded from 3.1.0 to 4.2.0. Consult the [breaking changes in `terser-webpack-plugin` 4.0](https://github.com/webpack-contrib/terser-webpack-plugin/blob/master/CHANGELOG.md#400-2020-08-04) if you utilize this plugin with any custom configuration or options. [#123](https://github.com/humanmade/webpack-helpers/pull/123)
- The bundled version of `css-loader` has been upgraded from 3.6.0 to 4.3.0. Consult the [breaking changes in `css-loader` 4.0](https://github.com/webpack-contrib/css-loader/blob/master/CHANGELOG.md#400-2020-07-25) if you utilize this loader with any custom configuration or options. [#120](https://github.com/humanmade/webpack-helpers/pull/120)
- The bundled version of `sass-loader` has been upgraded from 9.0.3 to 10.0.2. Consult the [breaking changes in `sass-loader` 10.0](https://github.com/webpack-contrib/sass-loader/blob/master/CHANGELOG.md#1000-rc0-2020-08-24) if you utilize this loader with any custom configuration or options. [#119](https://github.com/humanmade/webpack-helpers/pull/119)
- The bundled version of `mini-css-extract-plugin` has been upgraded from 0.9.0 to 0.11.2. [#122](https://github.com/humanmade/webpack-helpers/pull/122)

## v0.8.2

- Fix issue where `plugins.clean()` triggered an error. [#106](https://github.com/humanmade/webpack-helpers/pull/106)

## v0.8.1

- Permit `withDynamicPort` helper to work with multi-configuration Webpack files. [#103](https://github.com/humanmade/webpack-helpers/pull/103)

## v0.8.0

- **Breaking**: End support for Node v8. Node v10.13 or later is now required.
- **Breaking**: Remove `fix-style-only-entries` plugin from production preset. This plugin can incorrectly remove files in certain [multi-configuration](https://webpack.js.org/configuration/configuration-types/#exporting-multiple-configurations) scenarios. [#93](https://github.com/humanmade/webpack-helpers/pull/93)
- **Breaking**: Update `clean-webpack-plugin` factory to reflect API changes in the latest bundled version. `plugins.clean()` can now be added to a webpack configuration's `plugins` array with no additional arguments. [#31](https://github.com/humanmade/webpack-helpers/issues/31)
- **Breaking**: Update `copy-webpack-plugin` factory to reflect API changes in the latest bundled version. `plugins.copy()` now takes a sole object argument specifying a `patterns: []` array key, where before patterns were passed as a first argument. [#96](https://github.com/humanmade/webpack-helpers/pull/96)
- **Breaking**: End support for TypeScript 3.5 and earlier following upgrate to latest `ts-loader`. [#102](https://github.com/humanmade/webpack-helpers/pull/102)
- Switch optional SCSS dependency from `node-sass` to `sass` (a pure JavaScript implementation of `dart-sass`), to avoid the need to compile our sass dependency.
- Introduce [`withDynamicPort` helper function](https://humanmade.github.io/webpack-helpers/modules/helpers.html#withdynamicport) to simplify implementation of open port fallback logic. [#89](https://github.com/humanmade/webpack-helpers/pull/89)
- Output CSS sourcemaps in production if `devtool` option is set. [#94](https://github.com/humanmade/webpack-helpers/issues/94)
- Add [postcss-preset-env](https://github.com/csstools/postcss-preset-env) to postcss webpack configuration and configure it to transform Stage 3 CSS features [#91](https://github.com/humanmade/webpack-helpers/pull/91)

## v0.7.1

- Resolve issue where `{bundle name}.LICENSE.txt` files were output by Terser in situations where these files were not generated prior to 0.7.0. [#51](https://github.com/humanmade/webpack-helpers/pull/51)

## v0.7.0

- Include `plugins.fixStyleOnlyEntries()` in the production preset. [#33](https://github.com/humanmade/webpack-helpers/issues/33)
- Bump dependency versions to resolve `npm audit` security warnings. [#40](https://github.com/humanmade/webpack-helpers/issues/40)
  - `copy-webpack-plugin` has been upgraded from 4.6 to 5.1.1. Consult the [breaking changes in `copy-webpack-plugin` 5.0](https://github.com/webpack-contrib/copy-webpack-plugin/blob/master/CHANGELOG.md#500-2019-02-20) if you utilize this plugin with any custom configuration or options.
  - `terser-webpack-plugin` has been upgraded from 1.3 to 32.3.5. Consult the [breaking changes in `terser-webpack-plugin` 2.0](https://github.com/webpack-contrib/terser-webpack-plugin/blob/master/CHANGELOG.md#200-2019-09-05) if you utilize this plugin with any custom configuration or options. Several flags in our Terser configuration within `plugins.js` have been removed because those options are now Terser's default behavior.

## v0.6.1

- Set `emitWarning: true` in development preset's `eslint-loader` configuration so that lint errors do not block hot updates. [#39](https://github.com/humanmade/webpack-helpers/pull/39)

## v0.6.0

- Add TypeScript support. If the `typescript` package is detected, the presets will use `ts-loader` to interpret `.ts` and `.tsx` files. [#38](https://github.com/humanmade/webpack-helpers/pull/38)
- Add default `chunkFilename` to output configuration to ensure chunks are generated using hashed filenames. [#34](https://github.com/humanmade/webpack-helpers/pull/34)

## v0.5.2

- Fix bug where bundle keys in the `entry` configuration object were not respected. [#30](https://github.com/humanmade/webpack-helpers/issues/30)

## v0.5.1

- Provide default values for `entry` and `output.path` configuration options. [#28](https://github.com/humanmade/webpack-helpers/pull/28)
- Update `externals` to include latest WordPress core package names. [#26](https://github.com/humanmade/webpack-helpers/issues/26)
- Add `@babel/plugin-proposal-class-properties` plugin to permit use of class instance properties. [#24](https://github.com/humanmade/webpack-helpers/issues/24)
- Cache babel preset configuration for performance. [#23](https://github.com/humanmade/webpack-helpers/pull/23)

## v0.5.0

- First public release (remove beta notice from README).
- Release [documentation site](https://humanmade.github.io/webpack-helpers/).
- Bundle [`block-editor-hmr`](https://github.com/kadamwhite/block-editor-hmr) package. [#15](https://github.com/humanmade/webpack-helpers/pull/15)
- Revert `plugins.fixStyleOnlyEntries()` to the official version of `webpack-fix-style-only-entries` plugin. [#21](https://github.com/humanmade/webpack-helpers/pull/21)
- Only inject `eslint-loader` if `eslint` is installed. [#16](https://github.com/humanmade/webpack-helpers/issues/16)
- Add a reusable preset babel configuration as `@humanmade/webpack-helpers/babelrc-preset`. [#13](https://github.com/humanmade/webpack-helpers/pull/13)
- Remove `package-lock.json` from distributed npm package. [#6](https://github.com/humanmade/webpack-helpers/pull/6)

## v0.4.0

- Add OptimizeCssAssets plugin to production preset.
- Throw errors on port conflict instead of using `console.error` and `process.exit`.

## v0.3.2

- First usable beta.
