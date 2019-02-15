const { devServer, stats } = require( './config' );
const { findInObject, withOverrides } = require( './helpers' );
const loaders = require( './loaders' );
const plugins = require( './plugins' );
const { ManifestPlugin, MiniCssExtractPlugin } = plugins.constructors;

/**
 * Default development environment-oriented Webpack options. This object is
 * incomplete, and requires at minimum several other properties in order to
 * generate a complete & viable Webpack configuration object:
 *
 * - an `.entry` object,
 * - an `.output.path` string,
 * - an `.output.publicPath` string (unless a devServer.port is specified,
 *   in which case publicPath defaults to `http://localhost:${ port }`)
 */
const devDefaults = {
	mode: 'development',

	devtool: 'cheap-module-source-map',

	context: process.cwd(),

	// `path` and `publicPath` should be specified by the consumer.
	output: {
		// Add /* filename */ comments to generated require()s in the output.
		pathinfo: true,
		// Provide a default output name.
		filename: '[name].js',
	},

	module: {
		strictExportPresence: true,
		rules: [
			// Run all JS files through ESLint.
			loaders.eslint(),
			// Process JS with Babel.
			loaders.js(),
			// Convert small files to data URIs.
			loaders.url(),
			// Parse styles using SASS, then PostCSS.
			{
				test: /\.s?css$/,
				use: [
					require.resolve( 'style-loader' ),
					loaders.css( { sourceMap: true } ),
					loaders.postcss( { sourceMap: true } ),
					loaders.sass( { sourceMap: true } ),
				],
			},
			// "file" loader makes sure any non-matching assets still get served.
			// When you `import` an asset you get its filename.
			loaders.file(),
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

/**
 * Create a new development Webpack configuration based on the development
 * configuration template defined above. The devConfig factory function accepts
 * an overrides object which will be deeply merged into the default config.
 *
 * @param {Object} opts Configuration options to deeply merge into the defaults.
 * @returns {Object} A merged Webpack configuration object.
 */
const devConfig = ( opts = {} ) => {
	// Make some general assumptions about the publicPath URI based on the
	// configuration values provided in opts.
	const port = findInObject( opts, 'devServer.port' );
	let publicPath = findInObject( opts, 'output.publicPath' );
	if ( ! publicPath && port ) {
		publicPath = `${
			findInObject( opts, 'devServer.https' ) ? 'https' : 'http'
		}://localhost:${ port }/`;
	}

	// If we had enough value to guess a publicPath, set that path as a default
	// wherever appropriate and inject a ManifestPlugin instance to expose that
	// public path to consuming applications. Any inferred values will still be
	// overridden with their relevant values from `opts`, when provided.
	if ( publicPath ) {
		devDefaults.output.publicPath = publicPath;

		// Check for an existing ManifestPlugin instance in opts.plugins.
		const hasManifestPlugin = plugins.findExistingInstance( opts.plugins, ManifestPlugin );
		// Add a manifest with the inferred publicPath if none was present.
		if ( ! hasManifestPlugin ) {
			devDefaults.push( plugins.manifest( {
				publicPath,
			} ) );
		}
	}

	return withOverrides( devDefaults )( opts );
};

/**
 * Default production-oriented Webpack options. This object is incomplete, and
 * requires at minimum several other properties in order to generate a complete
 * Webpack configuration object:
 *
 * - an `.entry` object,
 * - an `.output.path` string
 */
const prodDefaults = {
	mode: 'production',

	devtool: false,

	context: process.cwd(),

	module: {
		strictExportPresence: true,
		rules: [
			// Run all JS files through ESLint.
			loaders.eslint(),
			// Process JS with Babel.
			loaders.js(),
			// Convert small files to data URIs.
			loaders.url(),
			// Parse styles using SASS, then PostCSS.
			{
				test: /\.s?css$/,
				use: [
					// Extract CSS to its own file.
					MiniCssExtractPlugin.loader,
					// Process SASS into CSS.
					loaders.css(),
					loaders.postcss(),
					loaders.sass(),
				],
			},
			// "file" loader makes sure any non-matching assets still get served.
			// When you `import` an asset you get its filename.
			loaders.file(),
		],
	},

	optimization: {
		minimizer: [
			plugins.terser(),
		],
		nodeEnv: 'production',
		noEmitOnErrors: true,
	},

	stats,

	plugins: [],
};

/**
 * Create a new production Webpack configuration based on the production
 * configuration template defined above. The prodConfig factory function takes
 * an overrides object which will be deeply merged into the default config.
 *
 * @param {Object} opts Configuration options to deeply merge into the defaults.
 * @returns {Object} A merged Webpack configuration object.
 */
const prodConfig = ( opts = {} ) => {
	// Add a MiniCssExtractPlugin instance if none is already present in opts.
	const hasCssPlugin = plugins.findExistingInstance( opts.plugins, MiniCssExtractPlugin );
	if ( ! hasCssPlugin ) {
		prodDefaults.plugins.push( plugins.miniCssExtract() );
	}

	return withOverrides( prodDefaults, opts );
};

// Expose all public-facing methods and objects to module consumers.
module.exports = {
	config: {
		development: devDefaults,
		production: prodDefaults,
	},
	devConfig,
	prodConfig,
};
