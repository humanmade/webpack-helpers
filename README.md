# Webpack Helpers

A [Human Made](https://humanmade.com) project.

## Background

A WordPress project can encompass a number of individual themes & plugins, and any of these components may contain frontend scripts or styles. This package provides reusable fragments of Webpack configurations and associated helper methods that would otherwise need to be duplicated across many project components.

## What's In The Box

### Loader Helpers

Instead of manually declaring the same loader rules in every Webpack configuration, specify only the configuration options that are specific to your project:
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

Instead of copying and pasting your webpack plugin dependencies between projects, declare one dependency and get access to several commonly-needed plugins.
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

### Opinionated Base Configurations

If you manage multiple development and production Webpack configurations, reiterating the same properties in each config results in a lot of duplicate code that may drift out of sync over time. This package provides functions to generate a full Webpack configuration for both development and production builds. Nothing but the output path and entry object is required, and everything can be overridden: use as much or as little of these presets as you need.

```js
const { presets } = require( '@humanmade/webpack-helpers' );

module.exports = [
	presets.devConfig( {
		entry: {
			theme: 'content/themes/best-theme-ever/src/theme.js',
		},
		output: {
			path: 'content/themes/best-theme-ever/build',
		},
	} ),
	presets.devConfig( {
		entry: {
			blocks: 'content/mu-plugins/custom-editor-blocks/src/blocks.js',
		},
		output: {
			path: 'content/mu-plugins/custom-editor-blocks/build',
		},
	} ),
];
```
