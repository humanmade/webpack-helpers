---
title: Migrating from 0.x
parent: Guides
nav_order: 1
---

# Migrating from 0.x to 1.0

Version 1.0 is a major release that migrates the package to Webpack 5, drops several legacy loaders and plugins, and raises the minimum Node.js version. This guide covers every breaking change with before/after examples.

## 1. Upgrade Node.js to 22+

Node.js 22 is now required. Check your current version with `node --version`. If you use nvm:

```bash
nvm install 22
nvm use 22
```

An `.nvmrc` file is included in the project; `nvm use` with no arguments will pick up the correct version automatically.

## 2. Upgrade peer dependencies

Update `webpack`, `webpack-cli`, and `webpack-dev-server` in your project:

```bash
npm install --save-dev webpack@5 webpack-cli@5 webpack-dev-server@5
```

Webpack 5 contains breaking changes of its own. If you maintain any custom webpack configuration beyond what the presets provide, consult the [Webpack 5 migration guide](https://webpack.js.org/migrate/5/) alongside this one.

## 3. Replace `loaders.url()` and `loaders.file()`

`loaders.url()` and `loaders.file()` have been removed. Webpack 5 handles binary assets natively via [asset modules](https://webpack.js.org/guides/asset-modules/), so these third-party loaders are no longer needed.

The presets already use the new loaders by default. If you referenced the old loaders directly in custom configuration, replace them as follows:

**`loaders.url()` → `loaders.asset()`**

`url-loader` inlined small files as data URLs and emitted larger files to disk. `loaders.asset()` provides the same behaviour using Webpack's native asset module:

```js
// Before
module.exports = {
    module: {
        rules: [
            loaders.url( { options: { limit: 10000 } } ),
        ],
    },
};

// After
module.exports = {
    module: {
        rules: [
            loaders.asset(),  // 10 KB threshold by default
        ],
    },
};
```

To adjust the inline size threshold, mutate the defaults or use `filterLoaders`:

```js
// Mutate defaults directly
loaders.asset.defaults.parser.dataUrlCondition.maxSize = 5000;

// Or via filterLoaders in a preset
presets.production( options, {
    filterLoaders: ( loader, loaderType ) => {
        if ( loaderType === 'asset' ) {
            loader.parser.dataUrlCondition.maxSize = 5000;
        }
        return loader;
    },
} );
```

**`loaders.file()` → `loaders.assetResource()`**

`file-loader` always emitted files to disk. `loaders.assetResource()` is the equivalent:

```js
// Before
loaders.file()

// After
loaders.assetResource()
```

**`loaders.assetInline()`** is also available if you want to always inline a file as a data URL, regardless of size.

Note that asset modules do not support `options.publicPath` on the rule itself. Set [`output.publicPath`](https://webpack.js.org/configuration/output/#outputpublicpath) at the top level of your webpack config instead.

## 4. Replace `loaders.eslint()` with `plugins.eslint()`

ESLint linting has moved from a loader rule to a webpack plugin. Remove `loaders.eslint()` from your `module.rules` array and add `plugins.eslint()` to your `plugins` array.

```js
// Before
const { loaders, presets } = require( '@humanmade/webpack-helpers' );

module.exports = {
    module: {
        rules: [
            loaders.eslint(),
            loaders.js(),
            // ...
        ],
    },
};

// After
const { plugins, presets } = require( '@humanmade/webpack-helpers' );

module.exports = presets.production( {
    plugins: [
        plugins.eslint(),
    ],
    // ...
} );
```

ESLint is not added automatically by the presets — you must add `plugins.eslint()` explicitly if you want linting as part of your build.

## 5. Replace `plugins.optimizeCssAssets()` with `plugins.cssMinimizer()`

`plugins.optimizeCssAssets()` has been removed along with the `optimize-css-assets-webpack-plugin` dependency. The replacement is `plugins.cssMinimizer()`, which wraps `css-minimizer-webpack-plugin` and is already included in `presets.production()`.

If you referenced `plugins.optimizeCssAssets()` directly in a custom `optimization.minimizer` array:

```js
// Before
const config = presets.production( { entry, output } );
module.exports = {
    ...config,
    optimization: {
        ...config.optimization,
        minimizer: [
            plugins.terser(),
            plugins.optimizeCssAssets(),
        ],
    },
};

// After
module.exports = {
    ...config,
    optimization: {
        ...config.optimization,
        minimizer: [
            plugins.terser(),
            plugins.cssMinimizer(),
        ],
    },
};
```

If you used `plugins.constructors.OptimizeCssAssetsPlugin` directly, switch to `plugins.constructors.CssMinimizerPlugin`.

## 6. Migrate your ESLint configuration to flat config format

ESLint 9+ requires the new flat configuration format. The legacy `.eslintrc`, `.eslintrc.js`, `.eslintrc.json`, and `.eslintrc.yml` files are not supported.

Create an `eslint.config.js` (or `eslint.config.mjs`) file in your project root. A minimal example:

```js
// eslint.config.js
import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        files: [ '**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx' ],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
        },
        rules: {
            // your project rules
        },
    },
];
```

Refer to the [ESLint flat config migration guide](https://eslint.org/docs/latest/use/configure/migration-guide) for a complete reference, including how to translate common `.eslintrc` options.

## 7. Update custom `optimization` config (if applicable)

Webpack 5 renamed the `noEmitOnErrors` optimization option to `emitOnErrors`, with the boolean sense inverted. If you have a custom `optimization` block:

```js
// Before (Webpack 4)
module.exports = {
    optimization: {
        noEmitOnErrors: true,
    },
};

// After (Webpack 5)
module.exports = {
    optimization: {
        emitOnErrors: false,
    },
};
```

If you use the presets without customising `optimization`, no change is needed.
