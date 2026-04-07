const camelCaseDash = require( './helpers/camel-case-dash' );

/**
 * Define externals to load components through the wp global.
 *
 * Just because a package is listed in this module does not mean it will be
 * available to your script. Some packages will only load with the block
 * editor, while others will need to be manually declared as a dependency
 * when you call `wp_register_script` for your application bundle.
 */
module.exports = [
	// See "dependencies" array from WordPress/gutenberg package.json.
	// Up to date as of WordPress 6.2 https://github.com/WordPress/gutenberg/blob/wp/6.2/package.json
	'a11y',
	'annotations',
	'api-fetch',
	'autop',
	'blob',
	'block-directory',
	'block-editor',
	'block-library',
	'block-serialization-default-parser',
	'block-serialization-spec-parser',
	'blocks',
	'components',
	'compose',
	'core-data',
	'customize-widgets',
	'data',
	'data-controls',
	'date',
	'deprecated',
	'dom',
	'dom-ready',
	'edit-post',
	'edit-site',
	'edit-widgets',
	'editor',
	'element',
	'escape-html',
	'format-library',
	'hooks',
	'html-entities',
	'i18n',
	'icons',
	'interface',
	'is-shallow-equal',
	'keyboard-shortcuts',
	'keycodes',
	'list-reusable-blocks',
	'media-utils',
	'notices',
	'plugins',
	'preferences',
	'preferences-persistence',
	'primitives',
	'priority-queue',
	'private-apis',
	'react-i18n',
	'react-native-aztec',
	'react-native-bridge',
	'react-native-editor',
	'redux-routine',
	'reusable-blocks',
	'rich-text',
	'server-side-render',
	'shortcode',
	'style-engine',
	'token-list',
	'url',
	'viewport',
	'warning',
	'widgets',
	'wordcount',
	// @wordpress/nux is no longer declared as a dependency in Gutenberg, however is left here for compatibility.
	'nux',
].reduce( ( externals, name ) => ( {
	...externals,
	// Convert kebab-case package names as camelCase.
	[ `@wordpress/${ name }` ]: `wp.${ camelCaseDash( name ) }`,
} ), {
	// Provide access to the wp global itself.
	wp: 'wp',
	// Utilize notable WordPress bundled scripts via globals.
	jquery: 'jQuery',
	tinymce: 'tinymce',
	moment: 'moment',
	react: 'React',
	'react-dom': 'ReactDOM',
	backbone: 'Backbone',
	lodash: 'lodash',
} );
