---
title: Presets Module
parent: Modules
nav_order: 1
---

# Presets Module

`const { presets } = require( '@humanmade/webpack-helpers' );`

This module provides functions that generate full Webpack configuration objects based on some opinionated default configuration values. The examples below should provide directional guidance, and are not intended to provide a comprehensive overview of [all Webpack configuration options](https://webpack.js.org/configuration/).

## `presets.development()`

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
		port: 9090,
	},
	entry: {
		bundleName: 'relative/path/to/bundle/entry-point.js',
	},
	output: {
		path: join( process.cwd(), 'path/to/output/folder' ),
	},
} );
```

## `presets.production()`

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

## Customizing Presets

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
