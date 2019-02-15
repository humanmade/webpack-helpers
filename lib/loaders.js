/**
 * Export generator functions for common Webpack loader configurations.
 */
const autoprefixer = require( 'autoprefixer' );
const postcssFlexbugsFixes = require( 'postcss-flexbugs-fixes' );

const deepMerge = require( './helpers/deep-merge' );

/**
 * Given an object, return a function to generate new objects based on that
 * template. The factory method accepts an object which will be merged with
 * the template to generate a final output object.
 *
 * @param {Object} options A template object of default values.
 * @returns {Function} A function accepting an object of property overrides
 * and returning a final, merged object.
 */
const withOverrides = options => {
	return ( overrides = {} ) => deepMerge( options, overrides );
};

module.exports = {
	eslint: withOverrides( {
		test: /\.jsx?$/,
		exclude: /(node_modules|bower_components)/,
		enforce: 'pre',
		loader: require.resolve( 'eslint-loader' ),
	} ),

	js: withOverrides( {
		test: /\.jsx?$/,
		exclude: /(node_modules|bower_components)/,
		loader: require.resolve( 'babel-loader' ),
		options: {
			// Cache compilation results in ./node_modules/.cache/babel-loader/
			cacheDirectory: true
		}
	} ),

	url: withOverrides( {
		test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
		loader: require.resolve( 'url-loader' ),
		options: {
			limit: 10000,
		},
	} ),

	style: withOverrides( {
		loader: require.resolve( 'style-loader' ),
	} ),

	css: withOverrides( {
		loader: require.resolve( 'css-loader' ),
		options: {
			importLoaders: 1,
		},
	} ),

	postcss: withOverrides( {
		loader: require.resolve( 'postcss-loader' ),
		options: {
			ident: 'postcss',
			plugins: () => [
				postcssFlexbugsFixes,
				autoprefixer( {
					flexbox: 'no-2009',
				} ),
			],
		},
	} ),

	sass: withOverrides( {
		loader: require.resolve( 'sass-loader' ),
	} ),

	file: withOverrides( {
		// Exclude `js`, `html` and `json`, but match anything else.
		exclude: /\.(js|html|json)$/,
		loader: require.resolve( 'file-loader' ),
	} ),
};
