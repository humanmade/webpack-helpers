/**
 * This is a modified copy of the WebpackFixStyleOnlyEntriesPlugin from npm,
 * released under the ISC license.
 *
 * The original plugin does not include the option of an exclude list which
 * allows it to catch and block JS from building that it should not block.
 * This modified version allows us to add an exclude Regex string option to
 * prevent the script from breaking functionality.
 *
 * It's also vastly easier to read.
 */

/**
 * Name of the plugin for Webpack.
 *
 * @type {string}
 */
const NAME = 'webpack-fix-style-only-entries';

/**
 * A default set of options that allows the plugin to just work without any config.
 *
 * @type {Object}
 */
const defaultOptions = {
	extensions: [ 'css','scss' ],
	exclude: '',
	silent: false,
};

/**
 * Webpack plugin to handle parsing
 */
class WebpackFixStyleOnlyEntriesPlugin {
	/**
	 * Class constructor.
	 *
	 * @param {Object} options
	 */
	constructor ( options ) {
		this.apply = this.apply.bind( this );

		this.options = {
			...defaultOptions,
			...options,
		};
	}

	/**
	 * Runs our functionality through Webpack.
	 *
	 * @param compiler
	 */
	apply ( compiler ) {
		const extensionsWithDots = this.options.extensions.map( ext => (
			ext[ 0 ] === '.' ? ext : `.${ ext }`
		) );

		compiler.hooks.compilation.tap( NAME, compilation => {
			compilation.hooks.chunkAsset.tap( NAME, ( chunk, file ) => {

				if ( ! chunk.hasEntryModule ) {
					return;
				}

				let resources;
				if ( typeof chunk.entryModule.resource === 'string' ) {
					resources = [ chunk.entryModule.resource ];
				} else if ( chunk.entryModule.dependencies && chunk.entryModule.dependencies.length ) {
					const modulesWithResources = chunk.entryModule.dependencies
						.map( dep => dep.module )
						.filter( module => module && module.resource );

					resources = modulesWithResources.map( module => module.resource );
				}

				if ( ! resources ) {
					return;
				}

				if (
					resources.every( resource => extensionsWithDots.find( ext => resource.endsWith( ext ) ) )
				) {
					if ( file.match( this.options.exclude ) ) {
						return;
					}

					if ( ! file.endsWith( '.js' ) ) {
						return;
					}

					if ( ! this.options.silent ) {
						// eslint-disable-next-line no-console
						console.log( `webpack-fix-style-only-entries: removing js from style only module: ${ file }` );
					}

					chunk.files = chunk.files.filter( chunkFile => chunkFile !== file );

					// eslint-disable-next-line prefer-reflect
					delete compilation.assets[ file ];
				}

			} );
		} );
	}
}

module.exports = WebpackFixStyleOnlyEntriesPlugin;
