const { devServer, stats } = require( './config' );
const { findInObject, withOverrides } = require( './helpers' );
const loaders = require( './loaders' );
const plugins = require( './plugins' );
const { ManifestPlugin } = plugins.constructors;

/**
 * Default development environment-oriented Webpack options. This object is
 * incomplete, and requires at minimum several other properties in order to
 * generate a complete & viable Webpack configuration object:
 *
 * - an `.entries` object,
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

	// Check for an existing ManifestPlugin instance in opts.plugins.
	const optsHasManifestPlugin = Array.isArray( opts.plugins ) ?
		plugins.findExistingInstance( opts.plugins, ManifestPlugin ) :
		false;

	let defaults = devDefaults;
	// If we had enough value to guess a publicPath, set that path as a default
	// wherever appropriate and inject a ManifestPlugin instance to expose that
	// public path to consuming applications. Any inferred values will still be
	// overridden with their relevant values from `opts`, when provided.
	if ( publicPath ) {
		defaults = {
			...devDefaults,

			output: {
				...devDefaults.output,
				publicPath,
			},

			// If no manifest plugin is present in opts, inject a new instance.
			plugins: optsHasManifestPlugin ?
				devDefaults.plugins :
				devDefaults.plugins.concat( plugins.manifest( {
					publicPath,
				} ) ),
		};
	}

	return withOverrides( defaults )( opts );
};

// Expose all public-facing methods and objects to module consumers.
module.exports = {
	config: {
		development: devDefaults,
	},
	devConfig,
};
