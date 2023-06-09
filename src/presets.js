const { devServer, stats } = require( './config' );
const deepMerge = require( './helpers/deep-merge' );
const filePath = require( './helpers/file-path' );
const findInObject = require( './helpers/find-in-object' );
const { inferPublicPath, getPublicPathForDirectory } = require( './helpers/infer-public-path' );
const isInstalled = require( './helpers/is-installed' );
const { applyFilters } = require( './helpers/filters' );
const loaders = require( './loaders' );
const plugins = require( './plugins' );
const { ManifestPlugin, MiniCssExtractPlugin } = plugins.constructors;

const isAnalyzeMode = process.argv.includes( '--analyze' );

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
 * array containing an appropriate loader or plugin if so.
 *
 * @example
 *     plugins: [
 *         ...ifInstalled( 'eslint', plugins.eslint() ),
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
 * Remove null entries from Webpack loaders array, in case a user returned null
 * from a filter to opt out of a given loader in the preset.
 *
 * Detects and removes null entries from nested .oneOf or .use arrays.
 *
 * @param {Object[]} moduleRules Array of Webpack loader rules.
 *
 * @returns {Object[]} Filtered array with null items removed.
 */
const removeNullLoaders = ( moduleRules ) => moduleRules
	.map( ( rule ) => {
		if ( rule && Array.isArray( rule.oneOf ) ) {
			const loaders = removeNullLoaders( rule.oneOf );
			if ( ! Array.isArray( loaders ) || ! loaders.length ) {
				return null;
			}
			return {
				...rule,
				oneOf: loaders,
			};
		}
		if ( rule && Array.isArray( rule.use ) ) {
			return {
				...rule,
				use: removeNullLoaders( rule.use ),
			};
		}
		return rule;
	} )
	.filter( Boolean );

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
			filename: '[name].[fullhash].js',
			// Provide chunk filename. Requires content hash for cache busting.
			chunkFilename: '[name].[fullhash].chunk.js',
			// `publicPath` will be inferred as a localhost URL based on output.path
			// when a devServer.port value is available.
		},

		module: {
			strictExportPresence: true,
			rules: removeNullLoaders( [
				// Handle node_modules packages that contain sourcemaps.
				loaders.sourcemap( {}, config ),
				{
					// "oneOf" will traverse all following loaders until one will
					// match the requirements. If no loader matches, it will fall
					// back to the resource loader at the end of the loader list.
					oneOf: [
						// Enable processing TypeScript, if installed.
						...ifInstalled( 'typescript', loaders.ts( {}, config ) ),
						// Process JS with Babel.
						loaders.js( {}, config ),
						// Handle static asset files.
						loaders.asset( {}, config ),
						/**
						 * Filter the full stylesheet loader definition for this preset.
						 *
						 * By default parses styles using Sass and then PostCSS.
						 *
						 * @hook presets/stylesheet-loaders
						 * @param {Object} loader      Stylesheet loader rule.
						 * @param {string} environment "development" or "production".
						 * @param {Object} config      Preset configuration object.
						 */
						applyFilters(
							'presets/stylesheet-loaders',
							{
								test: /\.s?css$/,
								use: [
									loaders.style( {}, config ),
									loaders.css( {
										options: {
											sourceMap: true,
										},
									}, config ),
									loaders.postcss( {
										options: {
											sourceMap: true,
										},
									}, config ),
									loaders.sass( {
										options: {
											sourceMap: true,
										},
									}, config ),
								],
							},
							'development',
							config
						),
						// Resource loader makes sure any non-matching assets still get served.
						// When you `import` an asset, you get its (virtual) filename.
						loaders.resource( {}, config ),
					],
				},
			] ),
		},

		optimization: {
			nodeEnv: 'development'
		},

		devServer,

		stats,

		plugins: [
			// Run all JS files through ESLint, if installed.
			...ifInstalled( 'eslint', plugins.eslint( {
				// But don't let errors block the build.
				failOnError: false,
			} ) ),
		].filter( Boolean ),
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

	const outputPath = ( config.output && config.output.path ) || devDefaults.output.path;
	// If we used a publicPath for this outputPath before, re-use it.
	if ( ! publicPath && outputPath ) {
		publicPath = getPublicPathForDirectory( outputPath );
	}

	// If we had enough config values to guess a publicPath, set that path in
	// the default config so it can be used in generated manifests.
	if ( publicPath ) {
		// If publicPath is a URL, default the devServer host to match.
		if ( typeof publicPath === 'string' && publicPath.includes( 'http' ) ) {
			devDefaults.devServer.host = new URL( publicPath ).hostname;
		}
		devDefaults.output.publicPath = publicPath;
	}

	// Check for an existing ManifestPlugin instance in config.plugins.
	// Inject a ManifestPlugin instance if none is present to ensure generated
	// files can be located by consuming aplications. Any inferred values will
	// still be overridden with their relevant values from `config`, if provided.
	const hasManifestPlugin = plugins.findExistingInstance( config.plugins, ManifestPlugin );
	// Add a manifest if none was present.
	if ( ! hasManifestPlugin ) {
		/* eslint-disable function-paren-newline */
		devDefaults.plugins.push( plugins.manifest(
			/**
			 * Filter the full stylesheet loader definition for this preset.
			 *
			 * By default parses styles using Sass and then PostCSS.
			 *
			 * @hook presets/manifest-options
			 * @param {Object} options     Manifest plugin options object.
			 * @param {string} environment "development" or "production".
			 * @param {Object} config      Preset configuration object.
			 */
			applyFilters(
				'presets/manifest-options',
				{
					fileName: 'development-asset-manifest.json',
					seed: getSeedByDirectory( outputPath ),
				},
				'development',
				config
			)
		) );
		/* eslint-enable */
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
			filename: '[name].[contenthash].js',
			// Provide chunk filename. Requires content hash for cache busting.
			chunkFilename: '[name].[contenthash].chunk.js',
		},

		module: {
			strictExportPresence: true,
			rules: removeNullLoaders( [
				{
					// "oneOf" will traverse all following loaders until one will
					// match the requirements. If no loader matches, it will fall
					// back to the resource loader at the end of the loader list.
					oneOf: [
						// Enable processing TypeScript, if installed.
						...ifInstalled( 'typescript', loaders.ts( {}, config ) ),
						// Process JS with Babel.
						loaders.js( {}, config ),
						// Handle static asset files.
						loaders.asset( {}, config ),
						/**
						 * Filter the full stylesheet loader definition for this preset.
						 *
						 * By default parses styles using Sass and then PostCSS.
						 *
						 * @hook presets/stylesheet-loaders
						 * @param {Object} loader      Stylesheet loader rule.
						 * @param {string} environment "development" or "production".
						 * @param {Object} config      Preset configuration object.
						 */
						applyFilters(
							'presets/stylesheet-loaders',
							{
								test: /\.s?css$/,
								use: [
									// Extract CSS to its own file.
									MiniCssExtractPlugin.loader,
									// Process SASS into CSS.
									loaders.css( cssOptions, config ),
									loaders.postcss( cssOptions, config ),
									loaders.sass( cssOptions, config ),
								],
							},
							'production',
							config
						),
						// Resource loader makes sure any non-matching assets still get served.
						// When you `import` an asset, you get its (virtual) filename.
						loaders.resource( {}, config ),
					],
				},
			] ),
		},

		optimization: {
			minimize: true,
			minimizer: [
				plugins.terser(),
				plugins.cssMinimizer(),
				plugins.imageMinimizer(),
			],
			emitOnErrors: false,
		},

		stats,

		plugins: [
			// Run all JS files through ESLint, if installed.
			...ifInstalled( 'eslint', plugins.eslint() ),
			// Use the simple build report plugin to clean up Webpack's terminal output.
			plugins.simpleBuildReport(),
			// If webpack was invoked with the --analyze flag, include a bundleAnalyzer
			// in production builds. Use the configuration name when present to separate
			// output files for each webpack build in multi-configuration setups.
			isAnalyzeMode ?
				plugins.bundleAnalyzer( {
					reportFilename: config.name ? `${ config.name }-analyzer-report.html` : 'bundle-analyzer-report.html',
					statsFilename: config.name ? `${ config.name }-stats.json` : 'stats.json',
				} ) :
				null,
		].filter( Boolean ),
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
		/* eslint-disable function-paren-newline */
		prodDefaults.plugins.push( plugins.manifest(
			/**
			 * Filter the full stylesheet loader definition for this preset.
			 *
			 * By default parses styles using Sass and then PostCSS.
			 *
			 * @hook presets/manifest-options
			 * @param {Object} options     Manifest plugin options object.
			 * @param {string} environment "development" or "production".
			 * @param {Object} config      Preset configuration object.
			 */
			applyFilters(
				'presets/manifest-options',
				{
					fileName: 'production-asset-manifest.json',
					seed: getSeedByDirectory( outputPath ),
				},
				'production',
				config
			)
		) );
		/* eslint-enable */
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
