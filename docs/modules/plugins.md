---
title: Plugins Module
parent: Modules
nav_order: 4
---

# Plugins Module

`const { plugins } = require( '@humanmade/webpack-helpers' );`

This module provides methods which create new instances of commonly-needed Webpack plugins.

- `plugins.bundleAnalyzer()`: Create and return a new [`webpack-bundle-analyzer`](https://github.com/webpack-contrib/webpack-bundle-analyzer) instance. When included this plugin is disabled by default unless the `--analyze` flag is passed on the command line.
- `plugins.clean()`: Create and return a new [`clean-webpack-plugin`](https://github.com/johnagan/clean-webpack-plugin) instance.
- `plugins.copy()`: Create and return a new [`copy-webpack-plugin`](https://github.com/webpack-contrib/copy-webpack-plugin) instance.
- `plugins.fixStyleOnlyEntries()`: Create and return a plugin instance that removes empty JS bundles for style-only entrypoints after build.
- `plugins.hotModuleReplacement()`: Create and return a new [`webpack.HotModuleReplacementPlugin`](https://webpack.js.org/plugins/hot-module-replacement-plugin/) instance.
- `plugins.manifest()`: : Create and return a new [`webpack-manifest-plugin`](https://github.com/danethurber/webpack-manifest-plugin) instance, preconfigured to write the manifest file while running from a dev server.
- `plugins.miniCssExtract()`: Create and return a new [`mini-css-extract-plugin`](https://github.com/webpack-contrib/mini-css-extract-plugin) instance.
- `plugins.terser()`: Create and return a new [`terser-webpack-plugin`](https://github.com/webpack-contrib/terser-webpack-plugin) instance, preconfigured with defaults based on `create-react-app`.
