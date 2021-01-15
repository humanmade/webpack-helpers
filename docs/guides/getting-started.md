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
npm install --save-dev @humanmade/webpack-helpers webpack@4 webpack-cli webpack-dev-server sass
```

Note that we specify Webpack version 4. Support for Webpack 5 is anticipated in the v1.0 release of these helpers, but at present using Webpack 4 provides the most predictable and stable experience across our projects.

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

If [ESLint](https://eslint.org/) is installed, `eslint-loader` will be used to validate that your code compiles and passes required style rules before the bundle is generated. While ESLint will be used if present, these helpers do not assume any specific configuration or rules. If you aren't using ESLint you may install and configure it with basic syntax and style rules by following the [official getting started guide](https://eslint.org/docs/user-guide/getting-started), or by installing Human Made's [`@humanmade/eslint-config`](https://www.npmjs.com/package/@humanmade/eslint-config) preset.

**Babel**

Because [Babel](https://babeljs.io/) (the library we use to enable us to write modern JavaScript and run it in all browsers) is more core to your Webpack bundling strategy than ESLint, we do package Babel as a part of this library. To properly configure Webpack, Jest, your editor and other tools which need to know about Babel, however, we must manually create a configuration file at the root of our project to specify our Babel configuration.

This package provides a default Babel configuration which leverages the WordPress core default babel presets, and uses the core WordPress `@wordpress/element` wrapper around React to parse JSX. To install and use this preset, create a file in your project root called `.babelrc.js` with the following content:

```js
// .babelrc.js
module.exports = require( '@humanmade/webpack-helpers/babel-preset' );
```

If you would rather explicitly declare the entire Babel configuration, the above equates to this:

```js
// .babelrc.js
module.exports = {
	presets: [ '@wordpress/default' ],
	plugins: [
		'@babel/plugin-proposal-class-properties',
		[ 'transform-react-jsx', {
			pragma: 'wp.element.createElement',
		} ],
	],
};
```

**TypeScript**

If [TypeScript](https://www.typescriptlang.org/) is installed, `ts-loader` will be used to automatically compile `.ts` and `.tsx` files. TypeScript itself is not bundled, so you must install the `typescript` package manually to enable TS compilation.

**Starting the Production Build Configuration**

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

By using our `presets.production` factory, we will generate a configuration object set up to use Babel, SCSS, and PostCSS.

`entry` and `output` are the only required parameters: `entry` tells Webpack where to find the bundle entrypoint (`src/editor.js` in the editor blocks plugin will be packaged into a bundle named `editor`), and `output.path` tells Webpack to output the bundled file into the plugin's `build/` directory.

Including the `externals` object in our configuration (using a modern JS shorthand notation, which is equivalent to having said `externals: externals`) allows our block editor plugin scripts to reference WordPress core packages using their full package names without including those existing files in the bundle, _e.g._

```
import { withSelect } from '@wordpress/data';
```

The [`filePath` helper](https://humanmade.github.io/webpack-helpers/modules/helpers) returns an absolute file system path relative to the current working directory, which will be the project root where our `package.json` lives.

**Package Scripts**

Now that we have our first Webpack configuration file, we can begin adding the package scripts we'll use to run the build process. In `package.json`, add or edit the "scripts" object to include a "build" command:

```
	"scripts": {
		"build": "webpack --config=.config/webpack.config.prod.js"
	}
```

**Important:** If you're migrating from an existing configuration with multiple `package.json` files in subdirectories, now is the time to ensure you've moved your dependencies into the root and deleted the `package.json` files in those subdirectories, otherwise they will affect your build.

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

Note that we've given each config object a `name` property. If you pass a name to the `--config-name` flag when running the build, webpack will only build that specific configuration. For example,
```
npm run build -- --config-name=theme
```
would build only the theme's bundle.

We've also chosen here to omit the `externals` definition from our theme's build configuration. If you do wish to make use of WP core packages, you may include `externals` here as well; however, if your theme JS makes use purely of native DOM functionality or bundled npm packages, there is no strict need to specify these externals if they will not be used. That's your choice to make as the author of the bundle.

With this new second configuration object in place, when we run `npm run build` we should see three bundles created: our admin-facing editor blocks, frontend-facing editor block styles & functionality, and finally our frontend theme scripts and styles.

Our production build configuration is complete!

## Development Builds & Webpack DevServer

With our production build sorted, it's time to set our our hot-reloading development server. Improving this part of the process was the major reason we created these Webpack helpers; we hope you'll find them easy to work with!

First, let's create an empty file `.config/webpack.config.dev.js`, and add another line to our `package.json` "scripts" definition:

```diff
 	"scripts": {
+		"start": "webpack-dev-server --config=.config/webpack.config.dev.js",
 		"build": "webpack --config=.config/webpack.config.prod.js"
 	}
```

Once we complete our development configuration file, this command will let us run `npm start` to spin up our hot-reloading development server.

**A Note on Asset Manifests**

Your local WordPress environment will usually be running within a container or virtual machine, but Webpack will start the development server on `localhost`. While the development server is running, files aren't written to disk; for performance reasons, they're served entirely from memory. WordPress won't know where to find these dynamically-generated files, so we make use of a special JSON file called an "asset manifest" to tell our PHP code the URLs for the generated bundles.

The `presets.development` generator will set up an asset manifest for you, but you may include your own instance of the manifest plugin if you wish to customize the behavior or formatting of the manifest. These customizations are outside the scope of this Getting Started guide, but you may refer to the [plugins module](https://humanmade.github.io/webpack-helpers/modules/plugins) for a link to the manifest plugin documentation.

A manifest only helps us if WordPress can load and interpret the file, so for the remainder of this guide we will assume you have the **[Asset Loader](https://github.com/humanmade/asset-loader) plugin** loaded and running within your project. The Asset Loader is available on Packagist as [`humanmade/asset-loader`](https://packagist.org/packages/humanmade/asset-loader), and the plugin is designed specifically to provide a complete PHP-side set of utilities to ingest and load the bundles generated using these Webpack helpers.

**Populating the Development Configuration**

The easiest way to begin your development configuration file is to copy the production configuration, and change the generators from `presets.production` to `presets.development`. Out of the box, doing nothing more than this will let you run `webpack --config=.config/webpack.config.dev.js` to build all development bundles in your project to disk in the specified output directories.

In order to use `webpack-dev-server`, though, we need to specify a new value `output.publicPath` so that our manifests can tell WordPress where to find the DevServer's files.

We can hard-code the default public path Webpack uses, but if you ever find you need to run another dev server at once, you will encounter a port conflict. This package provides a `choosePort()` utility to work around this: when the server starts it will occupy the next available public port.

To make use of this utility, we wrap our development config in a `choosePort` promise callback, then specify the `devServer.port` and and `output.publicPath` based on that port in the returned array of configurations. Each configuration's `publicPath` option must be unique, but the URL path does not have to precisely match the hierarchy of the files on disk.

```diff
 const { helpers, externals, presets } = require( '@humanmade/webpack-helpers' );
-const { filePath } = helpers;
+const { choosePort, filePath } = helpers;

-module.exports = [
+module.exports = choosePort( 8080 ).then( port => [
   presets.development( {
     name: 'blocks',
+    devServer: {
+      port,
+    },
     externals,
     entry: {
       editor: filePath( 'mu-plugins/myproject-blocks/src/editor.js' ),
       frontend: filePath( 'mu-plugins/myproject-blocks/src/frontend.js' ),
     },
     output: {
       path: filePath( 'mu-plugins/myproject-blocks/build' ),
+      publicPath: `http://localhost:${ port }/myproject-blocks/`,
     },
   } ),
   presets.development( {
     name: 'theme',
+    devServer: {
+      port,
+    },
     entry: {
       'frontend': filePath( 'themes/myproject/src/frontend.js' ),
     },
     output: {
       path: filePath( 'themes/myproject/build' ),
+      publicPath: `http://localhost:${ port }/myproject-theme/`,
     },
   } ),
-];
+] );
```

While these bundles are served from memory, now that we've specified a `publicPath`, a new file `asset-manifest.json` will be output into each project's `build/` folder. `themes/myproject/build/asset-manifest.json` will look like this:
```json
{
  "frontend.js": "http://localhost:8080/myproject-theme/frontend.js",
  "frontend.js.map": "http://localhost:8080/myproject-theme/frontend.js.map"
}
```
The Asset Loader plugin can now read this file in and instruct WordPress how to load the files from the development server. Configure the asset loader, run `npm start`, and you'll be up and running!

**Cleaning Up Manifests**

The only remaining task is to ensure that we clean up the manifest after the Webpack DevServer shuts down. If we don't, WordPress will continue to try to load the files from localhost indefinitely.

We use the `cleanOnExit` helper to delete these files when the server shuts down:

```diff
 const { helpers, externals, presets } = require( '@humanmade/webpack-helpers' );
-const { choosePort, filePath } = helpers;
+const { choosePort, cleanOnExit, filePath } = helpers;
+
+// Clean up manifests on exit.
+cleanOnExit( [
+	filePath( 'mu-plugins/myproject-blocks/build/asset-manifest.json' ),
+	filePath( 'themes/myproject/build/asset-manifest.json' ),
+] );
```

## Conclusion

Congratulations! You should now have a complete Webpack build, supporting both development and production environments, that's capable of expanding to serve as many themes, plugins, and bundles therein as you project needs. Run `npm start` to kick off the development server, and `npm run build` to generate production-ready assets. Pair this library with the [Asset Loader](https://packagist.org/packages/humanmade/asset-loader) PHP package to load your bundles in your application.

Whether you're using this module or not, if you remember a few basic rules you should be able to debug most issues you may run into using Webpack:

- If bundles share an output folder, use different entries within one configuration. If they should be build to different output folders, use a multi-configuration setup.
- A multi-configuration setup lets each bundle use a different set of loaders, plugins, externals, and other Webpack configuration options, as needed.
- Nothing we do here is magic: every option maps to specific behavior within Webpack. You can log the entire exported Webpack configuration object and look up each property in the [Webpack documentation](https://webpack.js.org/) to understand exactly what is happening under the hood, if you want to.
  - Loaders in particular can feel like magic, but a loader's nothing more than a small module that puts a JavaScript wrapper around a bundled asset. Check out this [tutorial on writing a simple Webpack loader](https://bocoup.com/blog/webpack-a-simple-loader) for more information.
- If nothing is working, delete your entire build directory and try again 😀

Happy bundling!
