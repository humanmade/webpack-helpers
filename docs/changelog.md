---
title: Changelog
permalink: /changelog
nav_order: 10
---

# Changelog

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
