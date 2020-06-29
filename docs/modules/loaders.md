---
title: Loaders Module
parent: Modules
nav_order: 3
---

# Loaders Module

`const { loaders } = require( '@humanmade/webpack-helpers' );`

This module provides functions that generate configurations for commonly-needed Webpack loaders. Use them within the `.module.rules` array, or use `presets.development()`/`presets.production()` to opt-in to some opinionated defaults.

- `loaders.eslint()`: Return a configured Webpack module loader rule for `eslint-loader`.
- `loaders.js()`: Return a configured Webpack module loader rule for `js-loader`.
- `loaders.ts()`: Return a configured Webpack module loader rule for `ts-loader`.
- `loaders.url()`: Return a configured Webpack module loader rule for `url-loader`.
- `loaders.style()`: Return a configured Webpack module loader rule for `style-loader`.
- `loaders.css()`: Return a configured Webpack module loader rule for `css-loader`.
- `loaders.postcss()`: Return a configured Webpack module loader rule for `postcss-loader`.
- `loaders.sass()`: Return a configured Webpack module loader rule for `sass-loader`.
- `loaders.file()`: Return a configured Webpack module loader rule for `file-loader`.

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
