const { HotModuleReplacementPlugin } = require( 'webpack' );
const ManifestPlugin = require( 'webpack-manifest-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const TerserPlugin = require( 'terser-webpack-plugin' );

const { deepMerge } = require( './helpers' );
const manifestFileName = require( './manifest' ).fileName;

module.exports = {
	/**
	 * Expose plugin constructor functions for use in consuming applications.
	 *
	 * @prop {Object} constructors
	 */
	constructors: {
		HotModuleReplacementPlugin,
		ManifestPlugin,
		MiniCssExtractPlugin,
		TerserPlugin,
	},

	/**
	 * Check an array to see if it contains an instance of a particular plugin.
	 *
	 * @param {Object[]} plugins           Array of plugin instance objects.
	 * @param {Function} PluginConstructor Constructor function for which to check
	 *                                     for existing plugin instances.
	 * @returns {Object} The matched plugin instance object, or null.
	 */
	findExistingInstance: ( plugins, PluginConstructor ) => {
		const match = plugins.find( plugin => plugin instanceof PluginConstructor );
		return match || null;
	},

	/**
	 * Create a webpack.HotModuleReplacementPlugin plugin instance.
	 *
	 * @param {Object} [opts] Optional plugin options object.
	 * @returns {HotModuleReplacementPlugin}
	 */
	hotModuleReplacement: ( opts = {} ) => new HotModuleReplacementPlugin( opts ),

	/**
	 * Create a new ManifestPlugin instance to output an asset-manifest.json
	 * file, which can be consumed by the PHP server to auto-load generated
	 * assets from the development server. A publicPath matching the URL
	 * in the configuration's output.publicPath is required.
	 *
	 * @param {Object} opts            Plugin options overrides.
	 * @param {String} opts.publicPath The base URI to prepend to build asset URIs.
	 * @returns {ManifestPlugin} A configured ManifestPlugin instance.
	 */
	manifest: ( opts = {} ) => new ManifestPlugin( {
		fileName: manifestFileName,
		writeToFileEmit: true,
		...opts,
	} ),

	/**
	 * Create a new MiniCssExtractPlugin instance.
	 *
	 * @param {Object} [opts]          Optional plugin configuration options.
	 * @param {Object} [opts.filename] The filename to use for the output CSS.
	 *
	 * @returns {MiniCssExtractPlugin} A configured MiniCssExtractPlugin instance.
	 */
	miniCssExtract: ( opts = {} ) => new MiniCssExtractPlugin( {
		filename: '[name].css',
		...opts,
	} ),

	/**
	 * Create a new TerserPlugin instance, defaulting to a set of options
	 * borrowed from create-react-app's configuration.
	 *
	 * @param {Object} [opts]               Plugin configuration option overrides
	 *                                         to merge into the defaults.
	 * @param {Object} [opts.terserOptions] Terser compressor options object.
	 */
	terser: ( opts = {} ) => new TerserPlugin( deepMerge( {
		terserOptions: {
			parse: {
				// we want terser to parse ecma 8 code. However, we don't want it
				// to apply any minfication steps that turns valid ecma 5 code
				// into invalid ecma 5 code. This is why the 'compress' and 'output'
				// sections only apply transformations that are ecma 5 safe
				// https://github.com/facebook/create-react-app/pull/4234
				ecma: 8,
			},
			compress: {
				ecma: 5,
				warnings: false,
				// Disabled because of an issue with Uglify breaking seemingly valid code:
				// https://github.com/facebook/create-react-app/issues/2376
				// Pending further investigation:
				// https://github.com/mishoo/UglifyJS2/issues/2011
				comparisons: false,
				// Disabled because of an issue with Terser breaking valid code:
				// https://github.com/facebook/create-react-app/issues/5250
				// Pending futher investigation:
				// https://github.com/terser-js/terser/issues/120
				inline: 2,
			},
			mangle: {
				safari10: true,
			},
			output: {
				ecma: 5,
				comments: false,
				// Turned on because emoji and regex is not minified properly using default
				// https://github.com/facebook/create-react-app/issues/2488
				ascii_only: true,
			},
		},
		// Use multi-process parallel running to improve the build speed
		// Default number of concurrent runs: os.cpus().length - 1
		parallel: true,
		// Enable file caching
		cache: true,
		// Output sourcemaps.
		sourceMap: true,
	}, opts ) ),
};
