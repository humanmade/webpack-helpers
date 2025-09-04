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
[ 'js', 'ts', 'style', 'css', 'postcss', 'sass', 'asset', 'assetResource', 'assetInline' ].forEach( loaderKey => {
	loaders[ loaderKey ] = createLoaderFactory( loaderKey );
} );

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

// Asset modules replace url-loader and file-loader in Webpack 5
loaders.asset.defaults = {
	test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
	type: 'asset',
	parser: {
		dataUrlCondition: {
			maxSize: 10000,
		},
	},
};

loaders.assetResource.defaults = {
	test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
	type: 'asset/resource',
};

loaders.assetInline.defaults = {
	test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
	type: 'asset/inline',
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
		sassOptions: {
			outputStyle: 'expanded'
		},
	},
};

module.exports = loaders;
