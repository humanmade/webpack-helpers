---
title: Helpers Module
parent: Modules
nav_order: 5
---

# Other Helpers

`const { helpers } = require( '@humanmade/webpack-helpers' )`

The `helpers` module exposes some useful functions to simplify common operations.

## `filePath`

Most Webpack configuration files require absolute paths to project assets in one place or another. To simplify generation of these project paths, a `filePath` helper is provided to convert relative paths into absolute file system paths. All relative paths are interpreted in relation to the `process.cwd()` current working directory (usually the location of your `package.json`).

```js
// webpack.config.prod.js
const { helpers, plugins, presets } = require( '@humanmade/webpack-helpers' );
const { filePath } = helpers;

module.exports = presets.production( {
	name: 'editor-blocks',
	entry: {
		'plugin': filePath( 'mu-plugins/project-editor-blocks/src/blocks.js' ),
	},
	output: {
		path: filePath( 'mu-plugins/project-editor-blocks/build' ),
	},
} );
```

## `cleanOnExit`


When using the `presets.development()` generator, a `development-asset-manifest.json` will automatically be generated so long as a `publicPath` URI can be determined. When working with a `development-asset-manifest.json` file, the `manifest` module provides a `cleanOnExit` method to easily remove manifests once the `webpack-dev-server` shuts down.

```js
const { join } = require( 'path' );
const { helpers } = require( '@humanmade/webpack-helpers' );

helpers.cleanOnExit( [
	join( process.cwd(), 'content/mu-plugins/custom-blocks/build/development-asset-manifest.json' ),
	join( process.cwd(), 'content/themes/my-theme/build/development-asset-manifest.json' ),
] );
```

## `withDynamicPort`

A complex project may require multiple development servers to be run in parallel while developing interrelated theme and plugin functionality. While ports in related projects can be hard-coded to avoid conflicts, the `withDynamicPort` helper can take a webpack configuration and update it to reflect an available port in the event of a port collision.

```js
// webpack.config.dev.js
const { join } = require( 'path' );
const { helpers, presets } = require( '@humanmade/webpack-helpers' );
const { withDynamicPort } = helpers;

// Write your config assuming it will use port 9090, but fall back to an open
// port if 9090 ends up being taken when the server starts.
module.exports = withDynamicPort( 9090, presets.development( {
	name: 'theme',
	entry: {
		bundleName: 'relative/path/to/bundle/entry-point.js',
	},
	output: {
		path: join( process.cwd(), 'path/to/output/folder' ),
		publicPath: 'http://localhost:9090',
	},
} ) );
```

Note that no `devServer` config is needed, and that the `publicPath` is authored assuming the preferred port specified in the `withDynamicPort` function call: these values will be filled in or updated to reflect the final port, once chosen.

### `choosePort`

In addition to `withDynamicPort` the helpers module also exposes a lower-level `choosePort` method adapted from `create-react-app`. This method can be used to manually implement the behavior of `withDynamicPort`:

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
			publicPath: `http://localhost:${ port }`,
		},
	} ),
] );
```

## Filters

Webpack Helpers v1.0 introduced a new system for altering the behavior of bundled loaders, plugins, and presets, also covered under [Customizing Presets](./presets.html#customizing-presets). This system uses a filtering approach similar to [the way PHP filters work within WordPress](https://developer.wordpress.org/reference/functions/add_filter/), with `addFilter` and `removeFilter` helpers you can use to modify various types of internal data at runtime.

```js
// webpack.config.js
const { helpers } = require( '@humanmade/webpack-helpers' );

const { addFilter, removeFilter } = helpers;

// Hook onto a specific filter by name, and provide a callback function to
// alter the value returned from that filter.
addFilter( 'filter/name', function( value ) {
	return 'modified value';
} );

// To filter only some values, you can remove a filter by passing the same
// function reference to removeFilter.
const filterFunction = ( value ) => 'modified value';

addFilter( 'filter/name', filterFunction );

// Do something where the filter gets applied.

removeFilter( 'filter/name', filterFunction );

// Now if you do that same thing, the filter will no longer apply.
```

### Filter List

Each [loader](./loaders.html) exposes at minimum two filters, `loaders/{name}` and `loaders/{name}/defaults`. For example, the defaults for `loaders.ts()` can be filtered using

```js
addFilter( 'loaders/ts/defaults', ( loaderDefaultsObject ) => {
	// return a filtered value
} );
```
or the computed final loader object can be modified after the fact with

```js
addFilter( 'loaders/ts', ( loaderObject ) => {
	// return a filtered value
} );
```

If you return `null` from the `loaders/{name}` filter, it will remove that loader from the preset entirely.

Additional filters provided by Webpack Helpers:

**`presets/stylesheet-loaders`**

Filter the [stylesheet loader chain](https://webpack.js.org/concepts/loaders/#configuration) used in the `presets.production()` and `presets.development()` helpers. Functions added to this filter receive the stylesheet chain as their first argument, and the name of the compilation mode (`production` or `development`) as the second argument.

**`plugins/terser/defaults`**

Filter the [TerserPlugin default options object](https://webpack.js.org/plugins/terser-webpack-plugin/#options) if you wish to alter the minification settings used by the production preset.

**`loaders/postcss/plugins`**

Filter the list of [PostCSS plugins](https://github.com/postcss/postcss/blob/main/docs/plugins.md) used by the `loaders.postcss()` loader.

**`loaders/postcss/preset-env`**

Filter the [`postcss-preset-env` options](https://github.com/csstools/postcss-preset-env#options) used by the `loaders.postcss()` loader.
