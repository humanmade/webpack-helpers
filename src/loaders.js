/**
 * Export generator functions for common Webpack loader configurations.
 */
const postcssFlexbugsFixes = require( 'postcss-flexbugs-fixes' );
const postcssPresetEnv = require( 'postcss-preset-env' );

const deepMerge = require( './helpers/deep-merge' );
const { applyFilters } = require( './helpers/filters' );

/**
 * Export an object of named methods that generate corresponding loader config
 * objects. To customize the default values of the loader, use addFilter() on
 * either the hook `loader/loadername/defaults` (to adjust the default loader
 * configuration) or `loader/loadername` (to alter the final, computed loader).
 */
const loaders = {};

const createLoaderFactory = loaderKey => {
	return ( options ) => {
		// Generate the requested loader definition. Expose filter seams both
		// to customize the defaults, and to alter the final rendered output.
		return applyFilters(
			`loader/${ loaderKey }`,
			deepMerge(
				applyFilters( `loader/${ loaderKey }/defaults`, loaders[ loaderKey ].defaults ),
				options
			)
		);
	};
};

// Define all supported loader factories within the loaders object.
[ 'assets', 'eslint', 'js', 'ts', 'style', 'css', 'postcss', 'sass', 'sourcemaps', 'resource' ].forEach( loaderKey => {
	loaders[ loaderKey ] = createLoaderFactory( loaderKey );
} );

loaders.assets.defaults = {
	test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
	type: 'asset',
	parser: {
		dataUrlCondition: {
			// Inline if less than 10kb.
			maxSize: 10 * 1024,
		},
	},
};

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
			plugins: applyFilters( 'loader/postcss/plugins', [
				postcssFlexbugsFixes,
				postcssPresetEnv( applyFilters( 'loader/postcss/preset-env', {
					autoprefixer: {
						flexbox: 'no-2009',
					},
					stage: 3,
				} ) ),
			] ),
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

loaders.sourcemaps.defaults = {
	test: /\.(js|mjs|jsx|ts|tsx|css)$/,
	exclude: /@babel(?:\/|\\{1,2})runtime/,
	enforce: 'pre',
	loader: require.resolve( 'source-map-loader' ),
	options: {},
};

loaders.resource.defaults = {
	// Exclude `js` files to keep "css" loader working as it injects
	// its runtime that would otherwise be processed through "file" loader.
	// Also exclude `html` and `json` extensions so they get processed
	// by webpacks internal loaders.
	exclude: [ /^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html?$/, /\.json$/ ],
	type: 'asset/resource',
};

module.exports = loaders;
