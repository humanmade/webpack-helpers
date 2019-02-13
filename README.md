# Webpack Helpers

A [Human Made](https://humanmade.com) project.

## Background

A WordPress project can encompass a number of individual themes & plugins, and any of these components may contain frontend scripts or styles. This package provides reusable fragments of Webpack configurations and associated helper methods that would otherwise need to be duplicated across many project components.

## What's In The Box

### Loader Helpers

Instead of manually declaring every loader rule in every Webpack configuration, specify only the pieces of configuration which are specific to your project:
```js
// Before
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.js$/,
        include: srcDirPath,
        loader: require.resolve( 'babel-loader' ),
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
        loader: require.resolve( 'url-loader' ),
        options: {
          limit: 10000,
        },
      },
    ],
  },
};
```
```js
// After
const { loaders } = require( '@humanmade/webpack-helpers' );

module.exports = {
  // ...
  module: {
    rules: [
      loaders.js( { include: srcDirPath } ),
      loaders.url(),
    ],
  },
};
```

### Opinionated Base Configurations


