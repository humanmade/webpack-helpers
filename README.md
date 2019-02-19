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
	presets.development( {
		name: 'theme',
		entry: {
			theme: 'content/themes/best-theme-ever/src/theme.js',
		},
		output: {
			path: 'content/themes/best-theme-ever/build',
		},
	} ),
	presets.development( {
		name: 'custom-editor-blocks',
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

This module provides functions that generate full Webpack configuration objects based on some opinionated default configuration values. The examples below should provide directional guidance, and are not intended to provide a comprehensive overview of [all Webpack configuration options](https://webpack.js.org/configuration/).

#### `presets.development()`

Generate a development-oriented Webpack configuration intended for use with `webpack-dev-server`. Any options specified on the argument passed to `development()` will be deeply merged into the default configuration options object. The only required properties are the `.entry` and the `.output.path`, though a `.name` can also be useful when working with an array of configuration objects.

A `ManifestPlugin` instance will be automatically injected into the configuration unless one is provided in the `.plugins` array on the configuration object.

```js
// webpack.config.dev.js
const { join } = require( 'path' );
const { presets } = require( '@humanmade/webpack-helpers' );

module.exports = presets.development( {
	name: 'bundle-name',
	devServer: {
		// Start the dev server on this port.
		port,
	},
	entry: {
		bundleName: 'relative/path/to/bundle/entry-point.js',
	},
	output: {
		path: join( process.cwd(), 'path/to/output/folder' ),
	},
} );
```

#### `presets.production()`

Generate a production-oriented Webpack configuration for generating minified asset bundle(s). Any options specified on the argument passed to `development()` will be deeply merged into the default configuration options object. The only required properties are the `.entry` and the `.output.path`, though a `.name` can also be useful when working with an array of configuration objects.

```js
// webpack.config.prod.js
const { join } = require( 'path' );
const { presets } = require( '@humanmade/webpack-helpers' );
const ImageminPlugin = require( 'imagemin-webpack-plugin' ).default;

module.exports = presets.production( {
	name: 'bundle-name',
	entry: {
		bundleName: 'relative/path/to/bundle/entry-point.js',
	},
	output: {
		path: join( process.cwd(), 'path/to/output/folder' ),
	},
	plugins: [
		// Add an ImageminPlugin instance to the generated config.
		new ImageminPlugin(
			{ test: /\.(jpe?g|png|gif|svg)$/i }
		),
	],
} );
```

#### Customizing Presets

To alter configuration options like `.devtool` or `.output.filename`, simply specify the value as if you were writing a normal Webpack configuration object. Any array properties, such as `.plugins`, will be merged with the array values in the template; object properties like `.devServer` will also be deeply merged with the template's values. If you wish to entirely _overwrite_ an array or object property, you may generate a configuration using the preset function and extend or mutate that configuration to set the desired values.

Customize a generated production configuration by object extension:

```js
// webpack.config.prod.js
const { plugins, presets } = require( '@humanmade/webpack-helpers' );

const config = presets.production( {
	entry: { /* ... */ },
	output: { /* ... */ },
} );

// Generate a final configuration object, overriding the property
// we want to change.
module.exports = {
	...config,
	optimization: {
		...config.optimization,
		minimizer: plugins.terser( { /* configuration... */ } ),
	},
};
```

[Read up on the `...` "spread operator"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#Spread_in_object_literals) if this syntax is unfamiliar to you; it's quite useful!


Customize a generated production configuration by object mutation:

```js
// webpack.config.prod.js
const { plugins, presets } = require( '@humanmade/webpack-helpers' );

module.exports = presets.production( {
	entry: { /* ... */ },
	output: { /* ... */ },
} );

// Overwrite the specific property we want to change.
module.exports.optimization.minimizer = [
	plugins.terser( { /* configuration... */ } ),
];
```

Note that array values are _merged_, not overwritten. This allows you to easily add plugins, but it can make it hard to _remove_ values from array properties like the module loader rules. To change loader configuration options without completely removing a loader, we recommend the approach described below in "Customizing Loaders". However, if you do need to completely change or remove the loaders from a default, you may overwrite the `.module.rules` array using one of the above methods.

### `loaders`

`const { loaders } = require( '@humanmade/webpack-helpers' );`

This module provides functions that generate configurations for commonly-needed Webpack loaders. Use them within the `.module.rules` array, or use `presets.development()`/`presets.production()` to opt-in to some opinionated defaults.

- `loaders.eslint()`: Return a configured Webpack module loader rule for `eslint-loader`.
- `loaders.js()`: Return a configured Webpack module loader rule for `js-loader`.
- `loaders.url()`: Return a configured Webpack module loader rule for `url-loader`.
- `loaders.style()`: Return a configured Webpack module loader rule for `style-loader`.
- `loaders.css()`: Return a configured Webpack module loader rule for `css-loader`.
- `loaders.postcss()`: Return a configured Webpack module loader rule for `postcss-loader`.
- `loaders.sass()`: Return a configured Webpack module loader rule for `sass-loader`.
- `loaders.file()`: Return a configured Webpack module loader rule for `file-loader`.

#### Customizing Loaders

Any properties passed into the loader method will be merged into the resulting configuration object.

```js
const { helpers, loaders } = require( '@humanmade/webpack-helpers' );
module.exports = {
	// ...
	module: {
		rules: [
			loaders.js( {
				include: helpers.filePath( 'themes/my-theme/src' ),
				options: {
					// Specify custom babel-loader options
				},
			} );
		],
	},
};
```

These loaders are also used by the presets methods described above. To alter the configuration for a loader prior to use within a preset, you may mutate the `.defaults` property on the loader method.

```js
const { helpers, loaders, presets } = require( '@humanmade/webpack-helpers' );

// Mutate the loader defaults.
loaders.js.defaults.include = helpers.filePath( 'themes/my-theme/src' );
loaders.css.defaults.options.url = false;

module.exports = presets.development( { /* ... */ } );
```

### `plugins`

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

### `externals`

`const { externals } = require( '@humanmade/webpack-helpers' );`

This module provides an `externals` object specifying all commonly-required admin-side WordPress core JavaScript libraries, such as `jquery` and `@wordpress/element`. Include `externals` in your webpack configuration and immediately begin `import`ing these modules from their corresponding browser globals, without any need to bundle them into your own package.

### `helpers`

`const { helpers } = require( '@humanmade/webpack-helpers' )`

The `helpers` module exposes some useful functions to simplify common operations.

#### `filePath`

Most Webpack configuration files require absolute paths to project assets in one place or another. To simplify generation of these project paths, a `filePath` helper is provided to convert relative paths into absolute file system paths. All relative paths are interpreted in relation to the `process.cwd()` current working directory (usually the location of your `package.json`).

```js
// webpack.config.prod.js
const { helpers, plugins, presets } = require( '@humanmade/webpack-helpers' );
const { filePath } = helpers;

module.exports = [
	presets.production( {
		name: 'editor-blocks',
		entry: {
			'plugin': filePath( 'mu-plugins/project-editor-blocks/src/blocks.js' ),
		},
		output: {
			path: filePath( 'mu-plugins/project-editor-blocks/build' ),
		},
	} ),
	presets.production( {
		name: 'theme',
		entry: {
			'plugin': filePath( 'themes/project-theme/src/theme.js' ),
		},
		output: {
			path: filePath( 'themes/project-theme/build' ),
		},
	} ),
];
```

#### `choosePort`

A complex project may require multiple development servers to be run in parallel while developing interrelated theme and plugin functionality. While ports in related projects can be hard-coded to avoid conflicts, this package also exposes a `choosePort` helper adapted from `create-react-app` which will automatically detect port conflicts and propose an available port if there is an unforseen port collision.

```js
// webpack.config.dev.js
const { join } = require( 'path' );
const { helpers, presets } = require( '@humanmade/webpack-helpers' );

// Try to bind to port 9090, but choose an open port if 9090 is taken.
module.exports = helpers.choosePort( 9090 ).then( port => [
	presets.development( {
		name: 'theme',
		devServer: {
			// Start the dev server on the selected port.
			port,
		},
		entry: {
			bundleName: 'relative/path/to/bundle/entry-point.js',
		},
		output: {
			path: join( process.cwd(), 'path/to/output/folder' ),
		},
	} ),
] );
```

#### `cleanOnExit`


When using the `presets.development()` generator, an `asset-manifest.json` will automatically be generated so long as a `publicPath` URI can be determined. When working with an `asset-manifest.json` file, the `manifest` module provides a `cleanOnExit` method to easily remove manifests once the `webpack-dev-server` shuts down.

```js
const { join } = require( 'path' );
const { manifest } = require( '@humanmade/webpack-helpers' );

manifest.cleanOnExit( [
	join( process.cwd(), 'content/mu-plugins/custom-blocks/build/asset-manifest.json' ),
	join( process.cwd(), 'content/themes/my-theme/build/asset-manifest.json' ),
] );
```
