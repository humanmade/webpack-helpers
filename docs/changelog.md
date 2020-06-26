---
title: Changelog
permalink: /changelog
nav_order: 10
---

# Changelog

## v0.8.0

- **Breaking**: End support for Node v8. Node v10 or later is now required.
- Introduce [`withDynamicPort` helper function](https://humanmade.github.io/webpack-helpers/modules/helpers.html#withdynamicport) to simplify implementation of open port fallback logic. [#89](https://github.com/humanmade/webpack-helpers/pull/89)

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
