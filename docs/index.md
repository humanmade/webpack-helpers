---
# Webpack Helpers
title: Introduction
nav_order: 0
---

# @humanmade/webpack-helpers

Your comprehensive toolkit for asset bundling in complex WordPress projects!

## Background

An enterprise-scale WordPress project involves a large number of individual themes & custom plugins, and any of these components may contain frontend scripts or styles. This package provides _**configuration generators, reusable Webpack configuration fragments, and associated helper methods**_ that would otherwise need to be duplicated across each project component.

**What about `@wordpress/scripts`?**

`@humanmade/webpack-helpers` is not meant to replace the core [`@wordpress/scripts` package](https://developer.wordpress.org/block-editor/packages/packages-scripts/) — if you need to package a single bundle for a theme or custom block plugin, that library may be a better option for your project.

If, however, you need to use SCSS, customize the Webpack configuration, or ensure a half-dozen bundles are all using the same configuration, then read on!

## What's In The Box

### Common Dependencies

Stop thinking about Webpack loader and plugin package versions and free yourself up for other tasks: installing `@humanmade/webpack-helpers` brings a common set of bundled loaders and plugins along for the ride, including `babel-loader`, `sass-loader`, `webpack-manifest-plugin`, `mini-css-extract-plugin`, and more. Manage one dependency instead of a dozen makes it easier to maintain your npm dependency list across related projects.

### Opinionated Base Configurations

If you manage multiple development and production Webpack configurations, reiterating the same properties in each config results in a lot of duplicate code that may drift out of sync over time. This package provides functions to generate a full Webpack configuration for both development and production builds. Nothing but the output path and entry object is required, and everything can be overridden: use as much or as little of these presets as you need.

```js
// Example webpack.config.prod.js file.
const { presets } = require( '@humanmade/webpack-helpers' );

module.exports = presets.production( {
	name: 'theme',
	entry: {
		theme: 'content/themes/best-theme-ever/src/theme.js',
	},
	output: {
		path: 'content/themes/best-theme-ever/build',
	},
} );
```

### Loader Helpers

Instead of manually declaring the same loader rules in every Webpack configuration, specify only those configuration options specific to your project: including `loaders.js()` in your configuration, for example, brings along sensible defaults for transpiling modern JavaScript with Babel.

```js
// Before
module.exports = {
	// ...
	module: {
		rules: [ {
			test: /\.js$/,
			include: srcDirPath,
			loader: require.resolve( 'babel-loader' ),
			options: {
				cacheDirectory: true,
			},
		}, {
			test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
			loader: require.resolve( 'url-loader' ),
			options: {
				limit: 10000,
			},
		} ],
	},
};
```
```js
// After
const { loaders } = require( '@humanmade/webpack-helpers' );

module.exports = {
	// ...
	module: {
		rules: [
			loaders.js( { include: srcDirPath } ),
			loaders.url(),
		],
	},
};
```

### Plugin Helpers

Instead of copying and pasting your webpack plugin dependencies between projects, declare one dependency and get access to several commonly-needed plugins with `import { plugins } from '@humanmade/webpack-helpers'`.

```js
// Before
const ManifestPlugin = require( 'webpack-manifest-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const TerserPlugin = require( 'terser-webpack-plugin' );
module.exports = {
	// ...
	optimization: {
		minimizer: [
			new TerserPlugin( {
				/* Dozens of lines of complex options */
			} ),
		],
	},
	plugins: [
		new ManifestPlugin( {
			/* Several required options */
		} ),
		new MiniCssExtractPlugin( { filename: '[name].css' } ),
	]
};
```
```js
// After
const { plugins } = require( '@humanmade/webpack-helpers' );
module.exports = {
	// ...
	optimization: {
		minimizer: [
			// Preconfigured with reasonable defaults
			plugins.terser(),
		],
	},
	plugins: [
		plugins.manifest( { publicPath: '...' } ),
		plugins.miniCssExtract(),
	],
}
```
