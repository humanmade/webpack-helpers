---
title: Externals Module
parent: Modules
---

# `externals`

`const { externals } = require( '@humanmade/webpack-helpers' );`

This module provides an `externals` object specifying all commonly-required admin-side WordPress core JavaScript libraries, such as `jquery` and `@wordpress/element`. Include `externals` in your webpack configuration and immediately begin `import`ing these modules from their corresponding browser globals, without any need to bundle them into your own package.
