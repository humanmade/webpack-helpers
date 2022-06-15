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

/**
 * Create a loader factory function for a given loader slug.
 *
 * @private
 * @param {string} loaderKey Loader slug
 * @returns {Function} Factory function to generate and filter a loader with the specified slug.
 */
const createLoaderFactory = loaderKey => {
	return ( options = {}, config = null ) => {
		/**
		 * Generate the requested loader definition.
		 *
		 * Allows customization of the final rendered loader via the loaders/{loaderslug}
		 * filter, which also receives the configuration passed to a preset factory if
		 * the loader is invoked in the context of a preset.
		 *
		 * @hook loaders/{$loader_slug}
		 * @param {Object}      loader   Loader definition object, after merging user-provided values with filtered defaults.
		 * @param {Object|null} [config] Preset configuration object, if loader is called in context of preset.
		 */
		return applyFilters(
			`loaders/${ loaderKey }`,
			deepMerge(
				/**
				 * Filter the loader's default configuration.
				 *
				 * @hook loaders/{$loader_slug}/defaults
				 * @param {Object}      options  Loader default options object.
				 * @param {Object|null} [config] Preset configuration object, if loader is called in context of preset.
				 */
				applyFilters( `loaders/${ loaderKey }/defaults`, loaders[ loaderKey ].defaults, config ),
				options
			),
			config
		);
	};
};

// Define all supported loader factories within the loaders object.
[ 'assets', 'js', 'ts', 'style', 'css', 'postcss', 'sass', 'sourcemaps', 'resource' ].forEach( loaderKey => {
	loaders[ loaderKey ] = createLoaderFactory( loaderKey );
} );

loaders.assets.defaults = {
	test: /\.(png|jpg|jpeg|gif|avif|webp|svg|woff|woff2|eot|ttf)$/,
	type: 'asset',
	parser: {
		dataUrlCondition: {
			// Inline if less than 10kb.
			maxSize: 10 * 1024,
		},
	},
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
			/**
			 * Filter the default PostCSS Plugins array.
			 *
			 * @hook loaders/postcss/plugins
			 * @param {Array} plugins Array of PostCSS plugins.
			 */
			plugins: applyFilters( 'loaders/postcss/plugins', [
				postcssFlexbugsFixes,
				/**
				 * Filter the default PostCSS Preset Env configuration.
				 *
				 * @hook loaders/postcss/preset-env
				 * @param {Object} presetEnvConfig PostCSS Preset Env plugin configuration.
				 */
				postcssPresetEnv( applyFilters( 'loaders/postcss/preset-env', {
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
