const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const { HotModuleReplacementPlugin } = require( 'webpack' );
const BellOnBundleErrorPlugin = require( 'bell-on-bundler-error-plugin' );
const CleanPlugin = require( 'clean-webpack-plugin' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const FixStyleOnlyEntriesPlugin = require( 'webpack-fix-style-only-entries' );
const ManifestPlugin = require( 'webpack-manifest-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const OptimizeCssAssetsPlugin = require( 'optimize-css-assets-webpack-plugin' );

const deepMerge = require( './helpers/deep-merge' );

module.exports = {
	/**
	 * Expose plugin constructor functions for use in consuming applications.
	 *
	 * @prop {Object} constructors
	 */
	constructors: {
		BellOnBundleErrorPlugin,
		BundleAnalyzerPlugin,
		CleanPlugin,
		CopyPlugin,
		FixStyleOnlyEntriesPlugin,
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
	 * @returns {(Object|null)} The matched plugin instance object, or null.
	 */
	findExistingInstance: ( plugins, PluginConstructor ) => {
		if ( ! Array.isArray( plugins ) ) {
			return null;
		}
		const match = plugins.find( plugin => plugin instanceof PluginConstructor );
		return match || null;
	},

	/**
	 * Create a new BundleAnalyzerPlugin instance. The analyzer is enabled by default
	 * only if `--analyze` is passed on the command line.
	 *
	 * @param {Object} [options] Optional plugin options object.
	 * @returns {BundleAnalyzerPlugin} A configured BundleAnalyzerPlugin instance.
	 */
	bundleAnalyzer: ( options = {} ) => new BundleAnalyzerPlugin( {
		analyzerMode: process.argv.indexOf( '--analyze' ) >= 0 ? 'static' : 'disabled',
		openAnalyzer: false,
		reportFilename: 'bundle-analyzer-report.html',
		...options,
	} ),

	/**
	 * Create a CleanPlugin instance.
	 *
	 * @param {String[]} paths          Array of (relative) string paths to clean.
	 * @param {Object}   [options]      Optional plugin options object.
	 * @param {String}   [options.root] Absolute path to your webpack root folder;
	 *                                  defaults to process.cwd(). The values in
	 *                                  `paths` are relative to this directory.
	 * @returns {CleanPlugin} A configured CleanPlugin instance.
	 */
	clean: ( paths, options = {} ) => new CleanPlugin( paths, {
		root: process.cwd(),
		...options,
	} ),

	/**
	 * @typedef CopyPattern
	 * @type {Object}
	 * @property {String} from   The absolute directory path from which to copy files.
	 * @property {String} to     The absolute directory path to which to copy files.
	 * @property {RegExp} [test] A Regular Expression to limit the files which get copied.
	 */
	/**
	 * Create a CopyPlugin instance.
	 *
	 * @param {CopyPattern[]} patterns  Array of pattern objects ( `{ from, to[, test] }` ).
	 * @param {Object}        [options] Optional plugin options object.
	 * @returns {CopyPlugin} A configured CopyPlugin instance.
	 */
	copy: ( patterns, options ) => new CopyPlugin( patterns, options ),

	/**
	 * Create a BellOnBundleErrorPlugin instance.
	 *
	 * @returns {BellOnBundleErrorPlugin} A BellOnBundleErrorPlugin instance.
	 */
	errorBell: () => new BellOnBundleErrorPlugin(),

	/**
	 * Create a new FixStyleOnlyEntriesPlugin instance to remove unnecessary JS
	 * files generated for style-only bundle entries.
	 *
	 * @param {Object} [options]         Optional plugin options object.
	 * @param {RegExp} [options.exclude] Regular expression to filter what gets cleaned.
	 * @returns {FixStyleOnlyEntriesPlugin} A configured FixStyleOnlyEntriesPlugin instance.
	 */
	fixStyleOnlyEntries: ( options ) => new FixStyleOnlyEntriesPlugin( options ),

	/**
	 * Create a webpack.HotModuleReplacementPlugin instance.
	 *
	 * @param {Object} [options] Optional plugin options object.
	 * @returns {HotModuleReplacementPlugin} A configured HMR Plugin instance.
	 */
	hotModuleReplacement: ( options = {} ) => new HotModuleReplacementPlugin( options ),

	/**
	 * Create a new ManifestPlugin instance to output an asset-manifest.json
	 * file, which can be consumed by the PHP server to auto-load generated
	 * assets from the development server. A publicPath matching the URL
	 * in the configuration's output.publicPath is required.
	 *
	 * @param {Object} options            Plugin options overrides.
	 * @param {String} options.publicPath The base URI to prepend to build asset URIs.
	 * @returns {ManifestPlugin} A configured ManifestPlugin instance.
	 */
	manifest: ( options = {} ) => new ManifestPlugin( {
		fileName: 'asset-manifest.json',
		writeToFileEmit: true,
		...options,
	} ),

	/**
	 * Create a new MiniCssExtractPlugin instance.
	 *
	 * @param {Object} [options]          Optional plugin configuration options.
	 * @param {Object} [options.filename] The filename to use for the output CSS.
	 * @returns {MiniCssExtractPlugin} A configured MiniCssExtractPlugin instance.
	 */
	miniCssExtract: ( options = {} ) => new MiniCssExtractPlugin( {
		filename: '[name].css',
		...options,
	} ),

	/**
	 * Create a new OptimizeCssAssetsPlugin instance.
	 *
	 * @param {Object} [options] Optional plugin configuration options.
	 * @returns {OptimizeCssAssetsPlugin} A configured OptimizeCssAssetsPlugin instance.
	 */
	optimizeCssAssets: ( options = {} ) => new OptimizeCssAssetsPlugin( options ),

	/**
	 * Create a new TerserPlugin instance, defaulting to a set of options
	 * borrowed from create-react-app's configuration.
	 *
	 * @param {Object} [options]               Plugin configuration option overrides
	 *                                         to merge into the defaults.
	 * @param {Object} [options.terserOptions] Terser compressor options object.
	 * @returns {TerserPlugin} A configured TerserPlugin instance.
	 */
	terser: ( options = {} ) => new TerserPlugin( deepMerge( {
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
		extractComments: false,
	}, options ) ),
};
