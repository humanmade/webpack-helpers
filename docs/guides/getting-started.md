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
│   ├── myproject-admin-customizations/
│   └── myproject-blocks/
├── plugins/
└── themes/
    └── myproject/
```
