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
	'a11y',
	'annotations',
	'api-fetch',
	'autop',
	'blob',
	'block-directory',
	'block-editor',
	'block-library',
	'block-serialization-default-parser',
	'blocks',
	'components',
	'compose',
	'core-data',
	'data',
	'data-controls',
	'date',
	'deprecated',
	'dom',
	'dom-ready',
	'edit-post',
	'edit-site',
	'editor',
	'element',
	'escape-html',
	'format-library',
	'hooks',
	'html-entities',
	'i18n',
	'is-shallow-equal',
	'keyboard-shortcuts',
	'keycodes',
	'list-reusable-blocks',
	'media-utils',
	'notices',
	'nux',
	'plugins',
	'primitives',
	'priority-queue',
	'redux-routine',
	'reusable-blocks',
	'rich-text',
	'server-side-render',
	'shortcode',
	'token-list',
	'url',
	'viewport',
	'warning',
	'wordcount',
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
