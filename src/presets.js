const { devServer, stats } = require( './config' );
const deepMerge = require( './helpers/deep-merge' );
const filePath = require( './helpers/file-path' );
const findInObject = require( './helpers/find-in-object' );
const inferPublicPath = require( './helpers/infer-public-path' );
const isInstalled = require( './helpers/is-installed' );
const loaders = require( './loaders' );
const plugins = require( './plugins' );
const { ManifestPlugin, MiniCssExtractPlugin } = plugins.constructors;

/**
 * Dictionary of shared seed objects by path.
 *
 * @type {Object}
 */
const seeds = {};

/**
 * Return a consistent seed object per output directory path.
 *
 * @param {String} path Output directory path
 * @returns {Object} Shared seed object.
 */
const getSeedByDirectory = ( path ) => {
	if ( ! seeds[ path ] ) {
		seeds[ path ] = {};
	}
	return seeds[ path ];
};

/**
 * Helper to detect whether a given package is installed, and return a spreadable
 * array containing an appropriate loader if so.
 *
 * @example
 *     rules: [
 *         ...ifInstalled( 'eslint', loaders.eslint() ),
 *     ],
 *
 * @param {String} packageName The string name of the dependency for which to test.
 * @param {Object} loader      A configuration object returned from a loader factory.
 *
 * @returns {Array} An array containing one loader, or an empty array.
 */
const ifInstalled = ( packageName, loader ) => {
	if ( ! isInstalled( packageName ) ) {
		return [];
	}
	return [ loader ];
};

/**
 * Given a reference to a (possibly-undefined) filtering method, return a pair
 * of helper functions to filter a loader definition object, or to get a loader
 * definition object by its loaders dictionary key and then filter it.
 *
 * @param {Function} [filterLoaders] An optional filterLoaders function. Defaults
 *                                   to the identity function.
 * @returns {Object} Object with `filterLoaders` and `getFilteredLoader` methods.
 */
const createFilteringHelpers = ( filterLoaders = ( input ) => input ) => ( {
	/**
	 * Given a loader object and its key string, pass that object through the
	 * filterLoaders method (if one was provided) and return the filtered output.
	 *
	 * @param {Object} loader    Webpack loader configuration object.
	 * @param {String} loaderKey String identifying which loader is being filtered.
	 * @returns {Object} Filtered loader object.
	 */
	filterLoaders: ( loader, loaderKey ) => {
		return filterLoaders( loader, loaderKey );
	},

	/**
	 * Helper method to reduce duplication when accessing and invoking loader factories.
	 *
	 * @param {String} loaderKey String key of a loader factory in the loaders object.
	 * @param {Object} [options] Options for this loader (optional).
	 * @returns {Object} Configured and filtered loader definition.
	 */
	getFilteredLoader: ( loaderKey, options ) => {
		return filterLoaders( loaders[ loaderKey ]( options ), loaderKey );
	},
} );

/**
 * Promote a partial Webpack config into a full development-oriented configuration.
 *
 * This function accepts an incomplete Webpack configuration object and deeply
 * merges any specified options into an opinionated set of development-oriented
 * configuration defaults. This default template is incomplete on its own, and
 * requires at minimum the following property to be specified in order to
 * create a complete configuration:
 *
 * - an `.output.publicPath` string (unless a devServer.port is specified,
 *   in which case publicPath defaults to `http://localhost:${ port }`)
 *
 * @param {webpack.Configuration} config                  Configuration options to deeply merge into the defaults.
 * @param {Object}                [options]               Optional options to modify configuration generation.
 * @param {Function}              [options.filterLoaders] An optional filter function that receives each
 *                                                        computed loader definition and the name of that
 *                                                        loader as it is generated, to permit per-config
 *                                                        customization of loader options.
 * @returns {webpack.Configuration} A merged Webpack configuration object.
 */
const development = ( config = {}, options = {} ) => {
	const { filterLoaders, getFilteredLoader } = createFilteringHelpers( options.filterLoaders );

	/**
	 * Default development environment-oriented Webpack options. This object is
	 * defined at the time of function execution so that any changes to the
	 * `.defaults` loaders properties will be reflected in the generated config.
	 *
	 * @type {webpack.Configuration}
	 */
	const devDefaults = {
		mode: 'development',

		devtool: 'cheap-module-source-map',

		context: process.cwd(),

		// Inject a default entry point later on if none was specified.

		output: {
			// Provide a default output path.
			path: filePath( 'build' ),
			// Add /* filename */ comments to generated require()s in the output.
			pathinfo: true,
			// Provide a default output name.
			filename: '[name].js',
			// Provide chunk filename. Requires content hash for cache busting.
			chunkFilename: '[name].[contenthash].chunk.js',
			// `publicPath` will be inferred as a localhost URL based on output.path
			// when a devServer.port value is available.
		},

		module: {
			strictExportPresence: true,
			rules: [
				// Run all JS files through ESLint, if installed.
				...ifInstalled( 'eslint', getFilteredLoader( 'eslint', {
					options: {
						emitWarning: true,
					},
				} ) ),
				{
					// "oneOf" will traverse all following loaders until one will
					// match the requirements. If no loader matches, it will fall
					// back to the "file" loader at the end of the loader list.
					oneOf: [
						// Enable processing TypeScript, if installed.
						...ifInstalled( 'typescript', getFilteredLoader( 'ts' ) ),
						// Process JS with Babel.
						getFilteredLoader( 'js' ),
						// Convert small files to data URIs.
						getFilteredLoader( 'url' ),
						// Parse styles using SASS, then PostCSS.
						filterLoaders( {
							test: /\.s?css$/,
							use: [
								getFilteredLoader( 'style' ),
								getFilteredLoader( 'css', {
									options: {
										sourceMap: true,
									},
								} ),
								getFilteredLoader( 'postcss', {
									options: {
										sourceMap: true,
									},
								} ),
								getFilteredLoader( 'sass', {
									options: {
										sourceMap: true,
									},
								} ),
							],
						}, 'stylesheet' ),
						// "file" loader makes sure any non-matching assets still get served.
						// When you `import` an asset you get its filename.
						getFilteredLoader( 'file' ),
					],
				},
			],
		},

		optimization: {
			nodeEnv: 'development',
		},

		devServer: {
			...devServer,
			stats,
		},

		plugins: [
			plugins.hotModuleReplacement(),
		],
	};

	// If no entry was provided, inject a default entry value.
	if ( ! config.entry ) {
		devDefaults.entry = {
			index: filePath( 'src/index.js' ),
		};
	}

	// Make some general assumptions about the publicPath URI based on the
	// configuration values provided in config.
	const port = findInObject( config, 'devServer.port' );
	let publicPath = findInObject( config, 'output.publicPath' );
	if ( ! publicPath && port ) {
		publicPath = inferPublicPath( config, port, devDefaults );
	}

	// If we had enough value to guess a publicPath, set that path as a default
	// wherever appropriate and inject a ManifestPlugin instance to expose that
	// public path to consuming applications. Any inferred values will still be
	// overridden with their relevant values from `config`, when provided.
	if ( publicPath ) {
		devDefaults.output.publicPath = publicPath;

		// Check for an existing ManifestPlugin instance in config.plugins.
		const hasManifestPlugin = plugins.findExistingInstance( config.plugins, ManifestPlugin );
		// Add a manifest with the inferred publicPath if none was present.
		if ( ! hasManifestPlugin ) {
			const outputPath = ( config.output && config.output.path ) || devDefaults.output.path;
			devDefaults.plugins.push( plugins.manifest( {
				fileName: 'asset-manifest.json',
				seed: getSeedByDirectory( outputPath ),
			} ) );
		}
	}

	return deepMerge( devDefaults, config );
};

/**
 * Promote a partial Webpack config into a full production-oriented configuration.
 *
 * The function accepts an incomplete Webpack configuration object and deeply
 * merges specified options into an opinionated default production configuration
 * template.
 *
 * @param {webpack.Configuration} config                  Configuration options to deeply merge into the defaults.
 * @param {Object}                [options]               Optional options to modify configuration generation.
 * @param {Function}              [options.filterLoaders] An optional filter function that receives each
 *                                                        computed loader definition and the name of that
 *                                                        loader as it is generated, to permit per-config
 *                                                        customization of loader options.
 * @returns {webpack.Configuration} A merged Webpack configuration object.
 */
const production = ( config = {}, options = {} ) => {
	const { filterLoaders, getFilteredLoader } = createFilteringHelpers( options.filterLoaders );

	// Determine whether source maps have been requested, and prepare an options
	// object to be passed to all CSS loaders to honor that request.
	const cssOptions = config.devtool ?
		{
			options: {
				sourceMap: true,
			},
		} :
		undefined;

	/**
	 * Default development environment-oriented Webpack options. This object is
	 * defined at the time of function execution so that any changes to the
	 * `.defaults` loaders properties will be reflected in the generated config.
	 *
	 * @type {webpack.Configuration}
	 */
	const prodDefaults = {
		mode: 'production',

		devtool: false,

		context: process.cwd(),

		// Inject a default entry point later on if none was specified.

		output: {
			// Provide a default output path.
			path: filePath( 'build' ),
			pathinfo: false,
			// Provide a default output name.
			filename: '[name].js',
			// Provide chunk filename. Requires content hash for cache busting.
			chunkFilename: '[name].[contenthash].chunk.js',
		},

		module: {
			strictExportPresence: true,
			rules: [
				// Run all JS files through ESLint, if installed.
				...ifInstalled( 'eslint', getFilteredLoader( 'eslint' ) ),
				{
					// "oneOf" will traverse all following loaders until one will
					// match the requirements. If no loader matches, it will fall
					// back to the "file" loader at the end of the loader list.
					oneOf: [
						// Enable processing TypeScript, if installed.
						...ifInstalled( 'typescript', getFilteredLoader( 'ts' ) ),
						// Process JS with Babel.
						getFilteredLoader( 'js' ),
						// Convert small files to data URIs.
						getFilteredLoader( 'url' ),
						// Parse styles using SASS, then PostCSS.
						filterLoaders( {
							test: /\.s?css$/,
							use: [
								// Extract CSS to its own file.
								MiniCssExtractPlugin.loader,
								// Process SASS into CSS.
								getFilteredLoader( 'css', cssOptions ),
								getFilteredLoader( 'postcss', cssOptions ),
								getFilteredLoader( 'sass', cssOptions ),
							],
						}, 'stylesheet' ),
						// "file" loader makes sure any non-matching assets still get served.
						// When you `import` an asset you get its filename.
						getFilteredLoader( 'file' ),
					],
				},
			],
		},

		optimization: {
			minimizer: [
				plugins.terser(),
				plugins.optimizeCssAssets( (
					// Set option to output source maps if devtool is set.
					config.devtool && ! ( /inline-/ ).test( config.devtool ) ?
						{
							cssProcessorOptions: {
								map: {
									inline: false,
								},
							},
						} :
						undefined
				) ),
			],
			nodeEnv: 'production',
			noEmitOnErrors: true,
		},

		stats,

		plugins: [],
	};

	// If no entry was provided, inject a default entry value.
	if ( ! config.entry ) {
		prodDefaults.entry = {
			index: filePath( 'src/index.js' ),
		};
	}

	// Add a MiniCssExtractPlugin instance if none is already present in config.
	const hasCssPlugin = plugins.findExistingInstance( config.plugins, MiniCssExtractPlugin );
	if ( ! hasCssPlugin ) {
		prodDefaults.plugins.push( plugins.miniCssExtract() );
	}

	// Add a manifest plugin to generate a production asset manifest if none is already present.
	const hasManifestPlugin = plugins.findExistingInstance( config.plugins, ManifestPlugin );
	// Add a manifest with the inferred publicPath if none was present.
	if ( ! hasManifestPlugin ) {
		const outputPath = ( config.output && config.output.path ) || prodDefaults.output.path;
		prodDefaults.plugins.push( plugins.manifest( {
			fileName: 'production-asset-manifest.json',
			seed: getSeedByDirectory( outputPath ),
		} ) );
	}

	return deepMerge( prodDefaults, config );
};

/**
 * Expose all public-facing methods and objects to module consumers.
 *
 * `devConfig()` and `prodConfig()` will generate configuration objects based on
 * opinionated defaults. These default configurations are exposed in `.config`.
 */
module.exports = {
	development,
	production,
};
