---
title: Helpers Module
parent: Modules
nav_order: 5
---

# `helpers`

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

## `choosePort`

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

## `cleanOnExit`


When using the `presets.development()` generator, an `asset-manifest.json` will automatically be generated so long as a `publicPath` URI can be determined. When working with an `asset-manifest.json` file, the `manifest` module provides a `cleanOnExit` method to easily remove manifests once the `webpack-dev-server` shuts down.

```js
const { join } = require( 'path' );
const { helpers } = require( '@humanmade/webpack-helpers' );

helpers.cleanOnExit( [
	join( process.cwd(), 'content/mu-plugins/custom-blocks/build/asset-manifest.json' ),
	join( process.cwd(), 'content/themes/my-theme/build/asset-manifest.json' ),
] );
```
