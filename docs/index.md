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

## Getting Started

Visit the [Getting Started guide](https://humanmade.github.io/webpack-helpers/guides/getting-started.html) for complete instructions for setting up these helpers in your own project.

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

The included presets provide the following out of the box:

- Modern JavaScript compilation using [Babel](https://babeljs.io/) for `.js` or `.jsx` files.
- SASS compilation for `.scss` files.
- Automatic inlining of small image and font assets as Data URI strings.
- PostCSS [Autoprefixer](https://github.com/postcss/autoprefixer#readme) support and Flexbox bug fixes.
- [TypeScript](https://www.typescriptlang.org/) compilation for `.ts` and `.tsx` files, if the `typescript` npm package is installed.
- Automatic [ESLint](https://eslint.org/) linting on build, if the `eslint` npm package is installed.

### WordPress Core Externals

If you are building custom blocks for the WordPress Block Editor, you can easily include a list of WordPress core scripts as [externals](https://webpack.js.org/configuration/externals) so that you may write code like

```js
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
```

in your modules and have those "imports" automatically mapped to the proper `wp.{package name}` browser globals. This lets you use core block editor modules, as well as JavaScript libraries like React or jQuery which are bundled within WordPress, without increasing the size of your first-party code bundle.

If you use this externals config, please note that you must ensure your script registration lists the WordPress core script handles on which your bundle depends. If you require your build process to generate a list of required script handles per-bundle, consider an alternative approach such as the [WordPress dependency extraction Webpack plugin](https://developer.wordpress.org/block-editor/packages/packages-dependency-extraction-webpack-plugin/).

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
