---
title: Getting Started
parent: Guides
nav_order: 0
---

# Getting Started

## Installation

Install `@humanmade/webpack-helpers` with [npm](http://npmjs.com):

```bash
npm install --save-dev @humanmade/webpack-helpers
```

While this package depends in turn on a number of loaders and plugins, it deliberately does _not_ include `webpack` itself. To install this library along with all its relevant peer dependencies, therefore, you may run the following command:

```bash
npm install --save-dev @humanmade/webpack-helpers webpack webpack-cli webpack-dev-server node-sass
```

## Configuring Webpack

By convention we generally put our Webpack configuration in a `.config/` folder in the project root. If you're working on a specific theme or plugin the project root may be the theme or plugin folder root, but on an Altis or WordPress VIP project the project root is likely to be the `wp-content` root or a folder outside your web root entirely. By putting your Webpack configuration at this higher level, one Webpack build command or dev server instance may be used to bundle the assets for multiple relates themes and plugins.

We'll assume for the remainder of this guide that your project follows a structure like this:

```
├── package.json
├── .config/
│   ├── webpack.config.dev.js
│   └── webpack.config.prod.js
├── mu-plugins/
│   └── myproject-blocks/
├── plugins/
└── themes/
    └── myproject/
```

We'll also assume that the editor blocks `mu-plugin` and the theme are both structured with a `src` directory containing one or more bundle entrypoint files.

By the end of this guide Webpack will take our source JavaScript files from these projects and package them into several production-ready frontend asset bundles. First, though, we need to put a few pieces of configuration in place.

**ESLint**

This project assumes you have [ESLint](https://eslint.org/) installed and configured in your project, but we do not provide or assume any specific configuration or rules. If you aren't using ESLint you may install and configure it with basic syntax and style rules by following the [official getting started guide](https://eslint.org/docs/user-guide/getting-started), or by installing Human Made's [`eslint-config-humanmade`](https://www.npmjs.com/package/eslint-config-humanmade) preset.

**Babel**

Because Babel is more core to your Webpack bundling strategy than ESLint, we do package Babel as a part of this library. To properly configure Webpack, Jest, your editor and other tools which need to know about Babel, however, we must manually create a configuration file in our project root to specify our Babel configuration.

This library provides a preset designed to leverage the WordPress core default babel presets, and to utilize the core WordPress `@wordpress/element` wrapper around React to parse JSX. To install and use this preset, create a file in your project root called `.babelrc.js` with the following content:

```js
// .babelrc.js
module.exports = require( '@humanmade/webpack-helpers/.babelrc.js' );
```

**Webpack**

Finally, let's create our first Webpack configuration file, `.config/webpack.config.prod.js`. We'll start by making a production bundle for our block editor mu-plugin.

```js
/**
 * .config/webpack.config.prod.js :
 * This file defines the production build configuration
 */
const { helpers, externals, presets } = require( '@humanmade/webpack-helpers' );
const { filePath } = helpers;

module.exports = presets.production( {
	externals,
	entry: {
		editor: filePath( 'mu-plugins/myproject-blocks/src/editor.js' ),
	},
	output: {
		path: filePath( 'mu-plugins/myproject-blocks/build' ),
	},
} );
```

By using our `presets.production` factory, we will generate a configuration object set up to use Babel, SCSS,and PostCSS. `entry` and `output` are the only required parameters we must provide; `entry` tells Webpack where to find the bundle entrypoint (`src/editor.js` in the editor blocks plugin will be packaged into a bundle named `editor`), and `output.path` tells Webpack to output the bundled file into the plugin's `build/` directory.

Including the `externals` object in our configuration (using a modern JS shorthand notation, which is equivalent to having said `externals: externals`) allows our block editor plugin scripts to reference WordPress core packages using their full package names, _e.g._ `import { withSelect } from '@wordpress/data';`.

The [`filePath` helper](https://humanmade.github.io/webpack-helpers/modules/helpers) returns an absolute file system path relative to the current working directory, which will be the project root where our `package.json` lives.

**Package Scripts**

Now that we have our first Webpack configuration file, we can begin adding the package scripts we'll use to run the build process. In `package.json`, add or edit the "scripts" object to include a "build" command:

```
	"scripts": {
		"build": "webpack --config=.config/webpack.config.prod.js"
	}
```

We should now be able to run `npm run build` to generate our bundle at `mu-plugins/myproject-blocks/build/editor.js`. If the bundle includes any CSS or SCSS files, another file `editor.css` will be generated as well which contains all referenced styles.

## Multiple Entries

Next, we will expand our production configuration to handle any frontend styles defined by that same editor-blocks plugin.

Within a single Webpack configuration object we may define multiple `entry` bundles which will be generated and output into a single `output.path` directory — `mu-plugins/myproject-blocks/build/`, in our case here.

If our blocks plugin has two files in the `src/` directory, for example, named `editor.js` and `frontend.js`, adding the frontend build to our Webpack configuration is as simple as specifying another object in the `entry` array:

```diff
 	externals,
 	entry: {
 		editor: filePath( 'mu-plugins/myproject-blocks/src/editor.js' ),
+		frontend: filePath( 'mu-plugins/myproject-blocks/src/frontend.js' ),
 	},
 	output: {
 		path: filePath( 'mu-plugins/myproject-blocks/build' ),
```

## Multi-Configuration Builds

Adding entries works well if we want to build an additional bundle into the same output directory. However, our theme can't build its files into our plugin's `build/` directory; that wouldn't make sense. We could use an output path higher up in our file tree and include more information about the destination folder into the bundle name keys, but this is quite clunky and prevents us from taking proper advantage of Webpack filename tokens.

If we need a different output directory path, then, the best way is to create what we call a ["multi-configuration" or "multi-target" Webpack file](https://webpack.js.org/configuration/configuration-types/#exporting-multiple-configurations). This is a Webpack configuration which returns an _array_ of configuration objects, allowing each configuration to have its own output, plugins, loaders, etcetera.

To add our theme configuration, we'll convert the `module.exports` to return an array of configuration objects and use our `presets.production` factory once more to create a new config object for the theme.

```diff
-module.exports = presets.production( {
+module.exports = [
+  presets.production( {
+    name: 'blocks',
     externals,
     entry: {
       editor: filePath( 'mu-plugins/myproject-blocks/src/editor.js' ),
       frontend: filePath( 'mu-plugins/myproject-blocks/src/frontend.js' ),
     },
     output: {
       path: filePath( 'mu-plugins/myproject-blocks/build' ),
     },
+  } ),
+  presets.production( {
+    name: 'theme',
+    entry: {
+      'frontend': filePath( 'themes/myproject/src/frontend.js' ),
+    },
+    output: {
+      path: filePath( 'themes/myproject/build' ),
+    },
+  } ),
-} );
+];
```

Note that we've given each config object a `name` property. If you pass a name to the `--config-name` flag when running the build, webpack will only build that specific configuration; _e.g._ `npm run build -- --config-name=theme` would build only the theme's bundle.

With this new second configuration object in place, when we run `npm run build` we should see three bundles created: our admin-facing editor blocks, frontend-facing editor block styles & functionality, and finally our frontend theme scripts and styles.

## Development Builds & Webpack DevServer


