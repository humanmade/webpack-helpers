---
title: Plugins Module
parent: Modules
nav_order: 4
---

# Plugins Module

`const { plugins } = require( '@humanmade/webpack-helpers' );`

This module provides methods which create new instances of commonly-needed Webpack plugins.

&nbsp; | Plugin | Description
------ | ------ | ------------
&nbsp; | `plugins.bundleAnalyzer()` | Create and return a new [`webpack-bundle-analyzer`](https://github.com/webpack-contrib/webpack-bundle-analyzer) instance. When included this plugin is disabled by default unless the `--analyze` flag is passed on the command line.
&nbsp; | `plugins.clean()` | Create and return a new [`clean-webpack-plugin`](https://github.com/johnagan/clean-webpack-plugin) instance.
&nbsp; | `plugins.copy()` | Create and return a new [`copy-webpack-plugin`](https://github.com/webpack-contrib/copy-webpack-plugin) instance.
&nbsp; | `plugins.errorBell()` | Create and return a new [`bell-on-bundle-error-plugin`](https://www.npmjs.com/package/bell-on-bundler-error-plugin) instance.
**P**  | `plugins.fixStyleOnlyEntries()` | Create and return a [`webpack-fix-style-only-entries`](https://github.com/fqborges/webpack-fix-style-only-entries) instance to remove empty JS bundles for style-only entrypoints.
**D**  | `plugins.hotModuleReplacement()` | Create and return a new [`webpack.HotModuleReplacementPlugin`](https://webpack.js.org/plugins/hot-module-replacement-plugin/) instance.
&nbsp; | `plugins.manifest()` | : Create and return a new [`webpack-manifest-plugin`](https://github.com/danethurber/webpack-manifest-plugin) instance, preconfigured to write the manifest file while running from a dev server.
**P**  | `plugins.miniCssExtract()` | Create and return a new [`mini-css-extract-plugin`](https://github.com/webpack-contrib/mini-css-extract-plugin) instance.
**P**  | `plugins.terser()` | Create and return a new [`terser-webpack-plugin`](https://github.com/webpack-contrib/terser-webpack-plugin) instance, preconfigured with defaults based on `create-react-app`.

**P**: Included in `presets.production()`

**D**: Included in `presets.development()`
