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

## Modules Overview

This section elaborates on the modules and methods provided by `@humanmade/webpack-helpers`.

### `presets`

`const { presets } = require( '@humanmade/webpack-helpers' );`

This module provides functions that generate full Webpack configuration objects based on some opinionated default configuration values.

#### `presets.devConfig()`

Generate a development-oriented webpack configuration configured for use with `webpack-dev-server`. Any options specified on the argument passed to `devConfig()` will be deeply merged into the default configuration options object. The only required properties are the `.entry` and the `.output.path`, but a `.name` can also be useful when working with an array of configuration objects.

```js
// webpack.config.dev.js
const { join } = require( 'path' );
const { presets } = require( '@humanmade/webpack-helpers' );

module.exports = presets.devConfig( {
	name: 'bundle-name',
	entry: {
		bundleName: 'relative/path/to/bundle/entry-point.js',
	},
	output: {
		path: join( process.cwd(), 'path/to/output/folder' ),
	},
} );
```

#### `presets.prodConfig()`

Coming Soon!

### `externals`

`const { externals } = require( '@humanmade/webpack-helpers' );`

This module provides an `externals` object specifying all commonly-required admin-side WordPress core JavaScript libraries, such as `jquery` and `@wordpress/element`. Include `externals` in your webpack configuration and immediately begin `import`ing these modules from their corresponding browser globals, without any need to bundle them into your own package.

### `loaders`

`const { loaders } = require( '@humanmade/webpack-helpers' );`

This module provides functions that generate configurations for commonly-needed Webpack loaders. Use them within the `.module.rules` array, or use `presets.devConfig` to opt-in to some opinionated defaults.

- `loaders.eslint()`: Return a configured Webpack module loader rule for `eslint-loader`.
- `loaders.js()`: Return a configured Webpack module loader rule for `js-loader`.
- `loaders.url()`: Return a configured Webpack module loader rule for `url-loader`.
- `loaders.style()`: Return a configured Webpack module loader rule for `style-loader`.
- `loaders.css()`: Return a configured Webpack module loader rule for `css-loader`.
- `loaders.postcss()`: Return a configured Webpack module loader rule for `postcss-loader`.
- `loaders.sass()`: Return a configured Webpack module loader rule for `sass-loader`.
- `loaders.file()`: Return a configured Webpack module loader rule for `file-loader`.

### `plugins`

`const { plugins } = require( '@humanmade/webpack-helpers' );`

This module provides methods which create new instances of commonly-needed Webpack plugins.

- `plugins.hotModuleReplacement()`: Create and return a new `webpack.HotModuleReplacementPlugin` instance.
- `plugins.manifest()`: : Create and return a new `ManifestPlugin` instance.
- `plugins.miniCssExtract()`: Create and return a new `MiniCssExtractPlugin` instance.
- `plugins.terser()`: Create and return a new `TerserPlugin` instance, preconfigured with defaults based on `create-react-app`.

### `manifest`

`const { manifest } = require( '@humanmade/webpack-helpers' );`

When using the `presets.devConfig()` generator, an `asset-manifest.json` will automatically be generated so long as a `publicPath` URI can be determined. When working with an `asset-manifest.json` file, the `manifest` module provides a `cleanOnExit` method to easily remove manifests once the `webpack-dev-server` shuts down.

```js
const { join } = require( 'path' );
const { manifest } = require( '@humanmade/webpack-helpers' );

manifest.cleanOnExit( [
	join( process.cwd(), 'content/mu-plugins/custom-blocks/build/asset-manifest.json' ),
	join( process.cwd(), 'content/themes/my-theme/build/asset-manifest.json' ),
] );
```
