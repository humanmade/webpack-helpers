/**
 * Export generator functions for common Webpack loader configurations.
 */
const autoprefixer = require( 'autoprefixer' );
const postcssFlexbugsFixes = require( 'postcss-flexbugs-fixes' );

const { withOverrides } = require( './helpers' );

module.exports = {
	eslint: withOverrides( {
		test: /\.jsx?$/,
		enforce: 'pre',
		loader: require.resolve( 'eslint-loader' ),
	} ),

	js: withOverrides( {
		test: /\.jsx?$/,
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
