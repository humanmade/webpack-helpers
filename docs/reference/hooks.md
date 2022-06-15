---
title: Filter Hooks
parent: Reference
nav_order: 1
---

# Filter Hooks

These hooks are provided by Webpack Helpers to customize the behavior of a specific loader or preset within your project.

`{loader name}` in the below filters may be any slug for an available [loader](https://humanmade.github.io/webpack-helpers/modules/loaders.html): `asset`, `css`, `js`, `postcss`, `resource`, `sass`, `sourcemap`, `style`, and `ts`.

Remember to always return a value from a filter callback.

## `loaders/{loader name}`

Filter the full loader configuration object after merging any user-provided options with the (filtered) defaults.

When called in the context of a preset, the callback will receive the preset factory's configuration object as a second argument.

**Arguments:**

 name | type | description
----- | ---- | ------
`loader` | `Object` | Loader configuration object.
`config` | `Object` or `null` | Preset configuration object if a preset is being rendered, else `null`.

Return `null` from the callback to remove this loader from preset-generated configurations.

```js
addFilter( 'loaders/{loader name}', ( loader, config = null ) => {
	// Filter the loader definition globally or based on the specific
	// configuration options provided to a preset factory.
	return loader;
} );
```

## `loaders/{loader name}/defaults`

Adjust the default values used to define a given loader configuration.

When called in the context of a preset, the callback will receive the preset factory's configuration object as a second argument.

**Arguments:**

 name | type | description
----- | ---- | ------
`defaults` | `Object` | Defaults for this specific loader.
`config` | `Object` or `null` | Preset configuration object if a preset is being rendered, else `null`.

```js
addFilter( 'loaders/{loader name}/defaults', ( defaults, config = null ) => {
	// Filter the loader's defaults globally or based on the specific
	// configuration options provided to a preset factory.
	return defaults;
} );
```

## `presets/stylesheet-loaders`

Filter the loaders used to process stylesheet imports when building your project.

The callback will receive the environment type of the preset being rendered as its second argument, and the preset's configuration object argument as a third argument.

**Arguments:**

 name | type | description
----- | ---- | ------
`loader` | `Object` | Combined stylesheet loader rule.
`environment` | `string` | `'development'` or `'production'`.
`config` | `Object` | Preset configuration object.

```js
addFilter( 'presets/stylesheet-loaders', ( loader, environment, config ) => {
	// Filter the configured stylesheet loaders based on environment or the
	// specific configuration options provided to the preset factory.
	return loader;
} );
```

## `loaders/postcss/plugins`

Filter the default list of PostCSS plugins used by the PostCSS loader.

Unlike the hooks above, callbacks added to this filter do not receive the preset configuration object.

**Arguments:**

 name | type | description
----- | ---- | ------
`pluginsArray` | `Array` | Array of [PostCSS plugin](https://github.com/postcss/postcss#plugins) definitions.

```js
addFilter( 'loaders/postcss/plugins', ( pluginsArray ) => {
	// Filter the plugins loaded by PostCSS.
	return pluginsArray;
} );
```

## `loaders/postcss/preset-env`

Filter the [`postcss-preset-env` plugin's](https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env#readme) configuration object.

Unlike the hooks above, callbacks added to this filter do not receive the preset configuration object.

**Arguments:**

 name | type | description
----- | ---- | ------
`pluginOptions` | `Object` | `postcss-preset-env` plugin options object.

```js
addFilter( 'loaders/postcss/preset-env', ( pluginOptions ) => {
	// Filter the PostCSS Preset Env plugin options.
	return pluginOptions;
} );
```
