---
title: Upgrading to v1
parent: Guides
nav_order: 1
---

# Upgrading to v1

## Installation

Install `@humanmade/webpack-helpers@latest` with [npm](http://npmjs.com), along with more updated versions of `webpack` and its attendant dependencies:

```bash
npm install --save-dev @humanmade/webpack-helpers@latest webpack@5 webpack-cli@4 webpack-dev-server@4
```

## Breaking Changes

### Handling multi-config arrays in DevServer

In a large project you may have a Webpack configuration that [exports multiple separate Webpack configuration objects](https://webpack.js.org/configuration/configuration-types/#exporting-multiple-configurations) in an array. The `presets.development()` helper adds a `devServer` property to each generated configuration, and with Webpack 4 and the pre-1.0 version of this helper library this was not a problem: if each entry in an exported array of configurations had its own `devServer` property, DevServer used the configuration in the first item in the exported array and ignored the rest.

In Webpack 5 and the latest DevServer, however, it is an error to define `devServer` properties on any configuration but the first item in the exported array. This means that you may need to map over the exported configurations and unset the `devServer` property on subsequent configurations.

```js
const configs = [
	presets.development( { /* ... */ } ),
	presets.development( { /* ... */ } ),
	presets.development( { /* ... */ } ),
];
module.exports = configs.map( ( config, index ) => {
	if ( index > 0 ) {
		Reflect.deleteProperty( config, 'devServer' );
	}
	return config;
} );
```

### Goodbye `filterLoaders`, welcome `addFilter`

Previously, a second argument could be passed to a preset to define a function used to filter loaders used while generating that preset configuration. In v1.0, a [hooks system](https://humanmade.github.io/webpack-helpers/reference/hooks.html) has been introduced which provides an `addFilter` method. `addFilter` can be used to register a callback function that may adjust the value of a loader globally, or make changes specific to a given preset call, in a manner similar to the WordPress PHP hooks system. Read the [hooks reference](https://humanmade.github.io/webpack-helpers/reference/hooks.html), [loaders](https://humanmade.github.io/webpack-helpers/modules/loaders.html), and [preset](https://humanmade.github.io/webpack-helpers/modules/presets.html) documentation pages for more information.

### ESLint v6 and earlier not supported

The ESLint integration for Webpack 5 requires ESLint v7 or later. If your project uses ESLint 6 or before, you will need to upgrade ESLint before using Webpack Helpers 1.0.

```bash
npm install --save-dev eslint@7
```

On most projects ESLint should continue to work after upgrade with no further adjustments.

### Importing named properties from JSON

Due to ongoing changes to how JSON files are handled by Webpack, this code

```js
import { name } from './block.json';
```

may now trigger the error

```
Should not import the named export 'name' (imported as 'name') from default-exporting module (only default export is available soon)
```
This error means that your code above needs to be changed to this:
```js
import blockData from './block.json';
const { name } = blockData;
```
