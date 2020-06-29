const {
	development,
	production,
} = require( './presets' );

jest.mock( 'process', () => ( { cwd: () => 'cwd' } ) );

/**
 * Find a loader of a given type within a module.rules configuration.
 *
 * @param {Object[]} rules Webpack configuration module.rules array.
 * @returns {Object|null} A matched loader definition, or null.
 */
const getLoaderFromRules = ( rules, loaderType ) => {
	for ( let rule of rules ) {
		if ( rule.loader && rule.loader.indexOf( loaderType ) > -1 ) {
			return rule;
		}
		if ( rule.oneOf ) {
			const nestedMatch = getLoaderFromRules( rule.oneOf, loaderType );
			if ( nestedMatch ) {
				return nestedMatch;
			}
		}
	}
	return null;
};

describe( 'presets', () => {
	describe( 'development()', () => {
		it( 'is a function', () => {
			expect( development ).toBeInstanceOf( Function );
		} );

		it( 'merges provided options with defaults to return a full webpack config object', () => {
			const config = development( {
				entry: 'some-file.js',
				output: {
					path: 'build/',
				},
			} );
			expect( config.entry ).toEqual( 'some-file.js' );
			expect( config.output ).toEqual( {
				pathinfo: true,
				filename: '[name].js',
				chunkFilename: '[name].[contenthash].chunk.js',
				path: 'build/',
			} );
		} );

		it( 'supplies a default entry if none is provided', () => {
			const config = development();
			expect( config.entry ).toHaveProperty( 'index' );
			expect( config.entry.index ).toMatchFilePath( 'cwd/src/index.js' );
		} );

		it( 'uses a provided entry object without alteration', () => {
			const config = development( {
				entry: {
					main: 'some-file.js',
				},
			} );
			expect( config.entry ).toEqual( {
				main: 'some-file.js',
			} );
		} );

		it.todo( 'assumes a default output.publicPath if a port is specified' );
		it.todo( 'accounts for the value of devServer.https when inferring publicPath URI' );
		it.todo( 'injects a ManifestPlugin if publicPath can be inferred and no manifest plugin is already present' );
		it.todo( 'does not inject a ManifestPlugin if publicPath cannot be inferred' );
		it.todo( 'does not inject a ManifestPlugin if a manifest plugin is already present' );

		it( 'permits filtering the computed output of individual loaders', () => {
			const config = development( {
				entry: {
					main: 'some-file.js',
				},
			}, {
				filterLoaders: ( loader, loaderType ) => {
					if ( loaderType === 'file' ) {
						loader.options.publicPath = '../../';
					}
					if ( loaderType === 'url' ) {
						loader.test = /\.(png|jpg|jpeg|gif|svg)$/;
					}
					return loader;
				},
			} );
			const fileLoader = getLoaderFromRules( config.module.rules, 'file-loader' );
			const urlLoader = getLoaderFromRules( config.module.rules, 'url-loader' );
			const jsLoader = getLoaderFromRules( config.module.rules, 'babel-loader' );
			expect( fileLoader ).toEqual( expect.objectContaining( {
				exclude: /\.(js|html|json)$/,
				options: {
					publicPath: '../../',
				},
			} ) );
			expect( urlLoader ).toEqual( expect.objectContaining( {
				test: /\.(png|jpg|jpeg|gif|svg)$/,
				options: {
					limit: 10000,
				},
			} ) );
			expect( jsLoader ).not.toBeNull();
		} );
	} );

	describe( 'production()', () => {
		it( 'is a function', () => {
			expect( production ).toBeInstanceOf( Function );
		} );

		it( 'merges provided options with defaults to return a full webpack config object', () => {
			const config = production( {
				entry: 'some-file.js',
				output: {
					path: 'build/',
				},
			} );
			expect( config.entry ).toEqual( 'some-file.js' );
			expect( config.output ).toEqual( {
				pathinfo: false,
				filename: '[name].js',
				chunkFilename: '[name].[contenthash].chunk.js',
				path: 'build/',
			} );
		} );

		it( 'supplies a default entry if none is provided', () => {
			const config = production();
			expect( config.entry ).toHaveProperty( 'index' );
			expect( config.entry.index ).toMatchFilePath( 'cwd/src/index.js' );
		} );

		it( 'uses a provided entry object without alteration', () => {
			const config = production( {
				entry: {
					main: 'some-file.js',
				},
			} );
			expect( config.entry ).toEqual( {
				main: 'some-file.js',
			} );
		} );

		it.todo( 'injects a MiniCssExtractPlugin if none is present in options' );

		it( 'permits filtering the computed output of individual loaders', () => {
			const config = production( {
				entry: {
					main: 'some-file.js',
				},
			}, {
				filterLoaders: ( loader, loaderType ) => {
					if ( loaderType === 'file' ) {
						loader.options.publicPath = '../../';
					}
					if ( loaderType === 'url' ) {
						loader.test = /\.(png|jpg|jpeg|gif|svg)$/;
					}
					return loader;
				},
			} );
			const fileLoader = getLoaderFromRules( config.module.rules, 'file-loader' );
			const urlLoader = getLoaderFromRules( config.module.rules, 'url-loader' );
			const jsLoader = getLoaderFromRules( config.module.rules, 'babel-loader' );
			expect( fileLoader ).toEqual( expect.objectContaining( {
				exclude: /\.(js|html|json)$/,
				options: {
					publicPath: '../../',
				},
			} ) );
			expect( urlLoader ).toEqual( expect.objectContaining( {
				test: /\.(png|jpg|jpeg|gif|svg)$/,
				options: {
					limit: 10000,
				},
			} ) );
			expect( jsLoader ).not.toBeNull();
		} );
	} );
} );
