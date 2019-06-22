---
title: Externals Module
parent: Modules
nav_order: 2
---

# WordPress Webpack Externals

`const { externals } = require( '@humanmade/webpack-helpers' );`

This module provides an `externals` object specifying all commonly-required admin-side WordPress core JavaScript libraries, such as `jquery` and `@wordpress/element`. Include `externals` in your webpack configuration and immediately begin `import`ing these modules from their corresponding browser globals, without any need to bundle them into your own package.

Use these externals in your bundle by adding the `externals` object to your configuration:

```js
module.exports = presets.production( {
	externals,

	// entry, output, etc
} );
```
(Including just `externals,` on its own line is shorthand for `externals: externals,`.)
