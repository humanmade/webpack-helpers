const {
	development,
	production,
} = require( './presets' );
const plugins = require( './plugins' );

jest.mock( 'process', () => ( { cwd: () => 'cwd' } ) );

/**
 * Find a loader of a given type within a module.rules configuration.
 *
 * @param {Object[]} rules      Webpack configuration module.rules array.
 * @param {String}   loaderType Package name of the loader to search for.
 * @returns {Object|null} A matched loader definition, or null.
 */
const getLoaderByName = ( rules, loaderType ) => {
	for ( let rule of rules ) {
		if ( rule.loader && rule.loader.indexOf( loaderType ) > -1 ) {
			return rule;
		}
		if ( rule.oneOf ) {
			const nestedMatch = getLoaderByName( rule.oneOf, loaderType );
			if ( nestedMatch ) {
				return nestedMatch;
			}
		}
	}
	return null;
};

/**
 * Find a loader matching a given regular expression within a module.rules configuration.
 *
 * @param {Object[]}      rules      Webpack configuration module.rules array.
 * @param {String|RegExp} loaderTest Test property of the loader to search for.
 * @returns {Object|null} A matched loader definition, or null.
 */
const getLoaderByTest = ( rules, loaderTest ) => {
	for ( let rule of rules ) {
		// console.log( rule.test );
		// /re/ === /re/ is false; /re/.toString() === /re/.toString() is true.
		if ( rule.test && rule.test.toString() === loaderTest.toString() ) {
			return rule;
		}
		if ( rule.oneOf ) {
			const nestedMatch = getLoaderByTest( rule.oneOf, loaderTest );
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
			const fileLoader = getLoaderByName( config.module.rules, 'file-loader' );
			const urlLoader = getLoaderByName( config.module.rules, 'url-loader' );
			const jsLoader = getLoaderByName( config.module.rules, 'babel-loader' );
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

		it( 'permits filtering the entire stylesheet loader chain', () => {
			const config = development( {
				entry: {
					main: 'some-file.js',
				},
			}, {
				filterLoaders: ( loader, loaderType ) => {
					if ( loaderType === 'stylesheet' ) {
						loader.test = /\.styl$/;
					}
					if ( loaderType === 'sass' ) {
						return {
							loader: 'stylus',
							mode: 'development',
						};
					}
					return loader;
				},
			} );
			const styleChain = getLoaderByTest( config.module.rules, /\.styl$/ );
			expect( styleChain ).toEqual( {
				test: /\.styl$/,
				use: expect.arrayContaining( [
					{
						loader: 'stylus',
						mode: 'development',
					},
				] ),
			} );
			const sassLoader = getLoaderByTest( config.module.rules, /\.s?css$/ );
			expect( sassLoader ).toBeNull();
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

		it( 'injects a MiniCssExtractPlugin if none is present in options', () => {
			const { MiniCssExtractPlugin } = plugins.constructors;
			const config = production( {
				entry: {
					main: 'some-file.css',
				},
			} );
			expect( config.plugins ).toEqual( expect.arrayContaining( [
				expect.any( plugins.constructors.MiniCssExtractPlugin ),
			] ) );
			const cssPlugins = config.plugins.filter( ( plugin ) => plugin instanceof MiniCssExtractPlugin );
			expect( cssPlugins.length ).toBe( 1 );
			expect( cssPlugins[ 0 ].options.filename ).toEqual( '[name].css' );
		} );

		it( 'does not override or duplicate existing MiniCssExtractPlugin instances', () => {
			const { MiniCssExtractPlugin } = plugins.constructors;
			const config = production( {
				entry: {
					main: 'some-file.css',
				},
				plugins: [
					plugins.miniCssExtract( {
						filename: 'custom-filename.css',
					} ),
				],
			} );
			expect( config.plugins ).toEqual( expect.arrayContaining( [
				expect.any( MiniCssExtractPlugin ),
			] ) );
			const cssPlugins = config.plugins.filter( ( plugin ) => plugin instanceof MiniCssExtractPlugin );
			expect( cssPlugins.length ).toBe( 1 );
			expect( cssPlugins[ 0 ].options.filename ).toEqual( 'custom-filename.css' );
		} );

		it( 'injects a production ManifestPlugin if none is present in options', () => {
			const { ManifestPlugin } = plugins.constructors;
			const config = production( {
				entry: {
					main: 'some-file.css',
				},
			} );
			expect( config.plugins ).toEqual( expect.arrayContaining( [
				expect.any( plugins.constructors.ManifestPlugin ),
			] ) );
			const manifestPlugins = config.plugins.filter( ( plugin ) => plugin instanceof ManifestPlugin );
			expect( manifestPlugins.length ).toBe( 1 );
			expect( manifestPlugins[ 0 ].options.fileName ).toEqual( 'production-asset-manifest.json' );
		} );

		it( 'does not override or duplicate existing ManifestPlugin instances', () => {
			const { ManifestPlugin } = plugins.constructors;
			const config = production( {
				entry: {
					main: 'some-file.css',
				},
				plugins: [
					plugins.manifest( {
						fileName: 'custom-manifest.json',
					} ),
				],
			} );
			expect( config.plugins ).toEqual( expect.arrayContaining( [
				expect.any( plugins.constructors.ManifestPlugin ),
			] ) );
			const manifestPlugins = config.plugins.filter( ( plugin ) => plugin instanceof ManifestPlugin );
			expect( manifestPlugins.length ).toBe( 1 );
			expect( manifestPlugins[ 0 ].options.fileName ).toEqual( 'custom-manifest.json' );
		} );

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
			const fileLoader = getLoaderByName( config.module.rules, 'file-loader' );
			const urlLoader = getLoaderByName( config.module.rules, 'url-loader' );
			const jsLoader = getLoaderByName( config.module.rules, 'babel-loader' );
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

		it( 'permits filtering the entire stylesheet loader chain', () => {
			const config = production( {
				entry: {
					main: 'some-file.js',
				},
			}, {
				filterLoaders: ( loader, loaderType ) => {
					if ( loaderType === 'stylesheet' ) {
						loader.test = /\.styl$/;
					}
					if ( loaderType === 'sass' ) {
						return {
							loader: 'stylus',
						};
					}
					return loader;
				},
			} );
			const styleChain = getLoaderByTest( config.module.rules, /\.styl$/ );
			expect( styleChain ).toEqual( {
				test: /\.styl$/,
				use: expect.arrayContaining( [
					{
						loader: 'stylus',
					},
				] ),
			} );
			const sassLoader = getLoaderByTest( config.module.rules, /\.s?css$/ );
			expect( sassLoader ).toBeNull();
		} );
	} );
} );
