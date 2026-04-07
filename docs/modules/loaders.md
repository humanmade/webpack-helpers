---
title: Loaders Module
parent: Modules
nav_order: 3
---

# Loaders Module

`const { loaders } = require( '@humanmade/webpack-helpers' );`

This module provides functions that generate configurations for commonly-needed Webpack loaders. Use them within the `.module.rules` array, or use `presets.development()`/`presets.production()` to opt-in to some opinionated defaults.

- `loaders.js()`: Return a configured Webpack module rule for `babel-loader`.
- `loaders.ts()`: Return a configured Webpack module rule for `ts-loader`. Only injected by presets if the `typescript` package is installed.
- `loaders.asset()`: Return a Webpack 5 [asset module](https://webpack.js.org/guides/asset-modules/) rule using type `asset`. Files under 10 KB are inlined as data URLs; larger files are emitted as separate resources. Replaces the removed `url-loader`.
- `loaders.assetResource()`: Return a Webpack 5 asset module rule using type `asset/resource`. Always emits the file as a separate resource. Replaces the removed `file-loader`.
- `loaders.assetInline()`: Return a Webpack 5 asset module rule using type `asset/inline`. Always inlines the file as a data URL.
- `loaders.style()`: Return a configured Webpack module rule for `style-loader`.
- `loaders.css()`: Return a configured Webpack module rule for `css-loader`.
- `loaders.postcss()`: Return a configured Webpack module rule for `postcss-loader`.
- `loaders.sass()`: Return a configured Webpack module rule for `sass-loader`.

## Customizing Loaders

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

To alter the configuration for a loader prior to use within a preset, you may mutate the `.defaults` property on the loader method.

```js
const { helpers, loaders, presets } = require( '@humanmade/webpack-helpers' );

// Mutate the loader defaults.
loaders.js.defaults.include = helpers.filePath( 'themes/my-theme/src' );
loaders.css.defaults.options.url = false;

module.exports = presets.development( { /* ... */ } );
```

These loaders are also used by the [presets](https://humanmade.github.io/webpack-helpers/modules/presets.html) methods described above. To adjust the behavior of a loader for a specific configuration generated using a preset, you may pass a second argument to the preset defining a filter function which can modify loader options as they are computed. See ["Customizing Presets"](https://humanmade.github.io/webpack-helpers/modules/presets.html#customizing-presets) for more information.
