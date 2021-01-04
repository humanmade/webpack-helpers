/**
 * Export generator functions for common Webpack loader configurations.
 */
const postcssFlexbugsFixes = require( 'postcss-flexbugs-fixes' );
const postcssPresetEnv = require( 'postcss-preset-env' );

const deepMerge = require( './helpers/deep-merge' );

/**
 * Export an object of named methods that generate corresponding loader config
 * objects. To customize the default values of the loader, mutate the .defaults
 * property exposed on each method (or pass a filterLoaders option to a preset).
 */
const loaders = {};

const createLoaderFactory = loaderKey => {
	const getFilteredLoader = ( options ) => {
		// Handle missing options object.
		if ( typeof options === 'function' ) {
			return getFilteredLoader( {}, options );
		}

		// Generate the requested loader definition.
		return deepMerge( loaders[ loaderKey ].defaults, options );
	};

	return getFilteredLoader;
};

// Define all supported loader factories within the loaders object.
[ 'eslint', 'js', 'ts', 'url', 'style', 'css', 'postcss', 'sass', 'file' ].forEach( loaderKey => {
	loaders[ loaderKey ] = createLoaderFactory( loaderKey );
} );

loaders.eslint.defaults = {
	test: /\.jsx?$/,
	exclude: /(node_modules|bower_components)/,
	enforce: 'pre',
	loader: require.resolve( 'eslint-loader' ),
	options: {},
};

loaders.js.defaults = {
	test: /\.jsx?$/,
	exclude: /(node_modules|bower_components)/,
	loader: require.resolve( 'babel-loader' ),
	options: {
		// Cache compilation results in ./node_modules/.cache/babel-loader/
		cacheDirectory: true
	}
};

loaders.ts.defaults = {
	test: /\.tsx?$/,
	exclude: /(node_modules|bower_components)/,
	loader: require.resolve( 'ts-loader' ),
};

loaders.url.defaults = {
	test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
	loader: require.resolve( 'url-loader' ),
	options: {
		limit: 10000,
	},
};

loaders.style.defaults = {
	loader: require.resolve( 'style-loader' ),
	options: {},
};

loaders.css.defaults = {
	loader: require.resolve( 'css-loader' ),
	options: {
		importLoaders: 1,
	},
};

loaders.postcss.defaults = {
	loader: require.resolve( 'postcss-loader' ),
	options: {
		postcssOptions: {
			ident: 'postcss',
			plugins: [
				postcssFlexbugsFixes,
				postcssPresetEnv( {
					autoprefixer: {
						flexbox: 'no-2009',
					},
					stage: 3,
				} ),
			],
		},
	},
};

loaders.sass.defaults = {
	loader: require.resolve( 'sass-loader' ),
	options: {
		sassOptions: {},
	},
};

loaders.file.defaults = {
	// Exclude `js`, `html` and `json`, but match anything else.
	exclude: /\.(js|html|json)$/,
	loader: require.resolve( 'file-loader' ),
	options: {},
};

module.exports = loaders;
