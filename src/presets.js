const { devServer, stats } = require( './config' );
const deepMerge = require( './helpers/deep-merge' );
const filePath = require( './helpers/file-path' );
const findInObject = require( './helpers/find-in-object' );
const inferPublicPath = require( './helpers/infer-public-path' );
const isInstalled = require( './helpers/is-installed' );
const { applyFilters } = require( './helpers/filters' );
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
 * @param {webpack.Configuration} config Configuration options to deeply merge into the defaults.
 * @returns {webpack.Configuration} A merged Webpack configuration object.
 */
const development = ( config = {} ) => {
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
			filename: '[name].[contenthash:8].js',
			// Provide chunk filename. Requires content hash for cache busting.
			chunkFilename: '[name].[contenthash:8].chunk.js',
			// `publicPath` will be inferred as a localhost URL based on output.path
			// when a devServer.port value is available.
		},

		module: {
			strictExportPresence: true,
			rules: [
				// Handle node_modules packages that contain sourcemaps.
				loaders.sourcemaps(),
				// Run all JS files through ESLint, if installed.
				...ifInstalled( 'eslint', loaders.eslint( {
					options: {
						emitWarning: true,
					},
				} ) ),
				{
					// "oneOf" will traverse all following loaders until one will
					// match the requirements. If no loader matches, it will fall
					// back to the resource loader at the end of the loader list.
					oneOf: [
						// Enable processing TypeScript, if installed.
						...ifInstalled( 'typescript', loaders.ts() ),
						// Process JS with Babel.
						loaders.js(),
						// Handle static asset files.
						loaders.assets(),
						// Parse styles using SASS, then PostCSS.
						// Pass environment name as second parameter to give flexibility when filtering.
						applyFilters(
							'preset/stylesheet-loaders',
							{
								test: /\.s?css$/,
								use: [
									loaders.style(),
									loaders.css( {
										options: {
											sourceMap: true,
										},
									} ),
									loaders.postcss( {
										options: {
											sourceMap: true,
										},
									} ),
									loaders.sass( {
										options: {
											sourceMap: true,
										},
									} ),
								],
							},
							'development'
						),
						// Resource loader makes sure any non-matching assets still get served.
						// When you `import` an asset, you get its (virtual) filename.
						loaders.resource(),
					],
				},
			],
		},

		optimization: {
			nodeEnv: 'development',
		},

		devServer,

		plugins: [],
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
				fileName: 'development-asset-manifest.json',
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
 * @param {webpack.Configuration} config Configuration options to deeply merge into the defaults.
 * @returns {webpack.Configuration} A merged Webpack configuration object.
 */
const production = ( config = {} ) => {
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
			// Webpack 5 defaults "publicPath" to "auto," which we are not set up to handle.
			publicPath: '',
			// Provide a default output path.
			path: filePath( 'build' ),
			pathinfo: false,
			// Provide a default output name.
			filename: '[name].[contenthash:8].js',
			// Provide chunk filename. Requires content hash for cache busting.
			chunkFilename: '[name].[contenthash:8].chunk.js',
		},

		module: {
			strictExportPresence: true,
			rules: [
				// Run all JS files through ESLint, if installed.
				...ifInstalled( 'eslint', loaders.eslint() ),
				{
					// "oneOf" will traverse all following loaders until one will
					// match the requirements. If no loader matches, it will fall
					// back to the resource loader at the end of the loader list.
					oneOf: [
						// Enable processing TypeScript, if installed.
						...ifInstalled( 'typescript', loaders.ts() ),
						// Process JS with Babel.
						loaders.js(),
						// Handle static asset files.
						loaders.assets(),
						// Parse styles using SASS, then PostCSS.
						// Pass environment name as second parameter to give flexibility when filtering.
						applyFilters(
							'preset/stylesheet-loaders',
							{
								test: /\.s?css$/,
								use: [
									// Extract CSS to its own file.
									MiniCssExtractPlugin.loader,
									// Process SASS into CSS.
									loaders.css( cssOptions ),
									loaders.postcss( cssOptions ),
									loaders.sass( cssOptions ),
								],
							},
							'production'
						),
						// Resource loader makes sure any non-matching assets still get served.
						// When you `import` an asset, you get its (virtual) filename.
						loaders.resource(),
					],
				},
			],
		},

		optimization: {
			minimize: true,
			minimizer: [
				plugins.terser(),
				plugins.cssMinimizer(),
			],
			emitOnErrors: false,
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
