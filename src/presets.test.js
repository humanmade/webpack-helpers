const {
	development,
	production,
} = require( './presets' );
const plugins = require( './plugins' );
const { addFilter, setupRegistry } = require( './helpers/filters' );
const { resetPublicPathsCache } = require( './helpers/infer-public-path' );

jest.mock( 'process', () => ( {
	cwd: () => 'cwd',
	versions: {},
} ) );

/**
 * Helper function to return null, used when testing filters.
 *
 * @returns {null} Null.
 */
const returnNull = () => null;

/**
 * Filter an array of plugins to only contain plugins of the provided type.
 *
 * @param {Function} Constructor Plugin constructor.
 * @returns {Function} Function of type ( plugin ) => boolean.
 */
const filterPlugins = ( Constructor ) => ( plugin ) => plugin instanceof Constructor;

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
		// Permit selection of asset module loaders with no .loader property.
		if ( rule.type && rule.type === loaderType ) {
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
	beforeEach( () => {
		setupRegistry();
		resetPublicPathsCache();
	} );

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
				filename: '[name].[fullhash].js',
				chunkFilename: '[name].[fullhash].chunk.js',
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

		it( 'assumes a default output.publicPath if a port is specified', () => {
			const config = development( {
				devServer: {
					port: 9090,
				},
				entry: 'some-file.js',
			} );
			expect( config.output.publicPath ).toBe( 'http://localhost:9090/build/' );
		} );

		it( 'accounts for the value of devServer.server when inferring publicPath URI', () => {
			const config = development( {
				devServer: {
					server: 'https',
					port: 9090,
				},
				entry: 'some-file.js',
			} );
			expect( config.output.publicPath ).toBe( 'https://localhost:9090/build/' );
		} );

		it( 'accounts for the value of devServer.https (deprecated in favor of .server) when inferring publicPath URI', () => {
			const config = development( {
				devServer: {
					https: true,
					port: 9090,
				},
				entry: 'some-file.js',
			} );
			expect( config.output.publicPath ).toBe( 'https://localhost:9090/build/' );
		} );

		it( 'adapts output.path when inferring publicPath URI', () => {
			const config = development( {
				devServer: {
					port: 9090,
				},
				entry: 'some-file.js',
				output: {
					path: 'some/target',
				},
			} );
			expect( config.output.publicPath ).toBe( 'http://localhost:9090/some/target/' );
		} );

		it( 'does not assume output.publicPath if a port is not specified', () => {
			const config = development( {
				entry: 'some-file.js',
			} );
			expect( config.output.publicPath ).toBeUndefined();
		} );

		it( 'does not overwrite an existing output.publicPath when present', () => {
			const config = development( {
				entry: 'some-file.js',
				output: {
					publicPath: 'https://my-custom-domain.local/',
				},
			} );
			expect( config.output.publicPath ).toBe( 'https://my-custom-domain.local/' );
		} );

		it( 're-uses previously inferred publicPath URIs in subsequent builds to the same directory', () => {
			const config1 = development( {
				devServer: {
					port: 9090,
				},
				output: {
					path: 'some/folder',
				}
			} );
			const config2 = development( {
				output: {
					path: 'some/folder',
				},
			} );
			expect( config1.output.publicPath ).toBe( 'http://localhost:9090/some/folder/' );
			expect( config1.output.publicPath ).toBe( config2.output.publicPath );
		} );

		it( 'injects a ManifestPlugin if no manifest plugin is already present', () => {
			const { ManifestPlugin } = plugins.constructors;
			const config = development( {
				devServer: {
					port: 8080
				},
				entry: {
					main: 'some-file.css',
				},
			} );
			expect( config.plugins ).toEqual( expect.arrayContaining( [
				expect.any( plugins.constructors.ManifestPlugin ),
			] ) );
			const manifestPlugins = config.plugins.filter( filterPlugins( ManifestPlugin ) );
			expect( manifestPlugins.length ).toBe( 1 );
			expect( manifestPlugins[ 0 ].options.fileName ).toEqual( 'development-asset-manifest.json' );
		} );

		it( 'does not override or duplicate existing ManifestPlugin instances', () => {
			const { ManifestPlugin } = plugins.constructors;
			const config = development( {
				entry: {
					main: 'some-file.css',
				},
				devServer: {
					port: 8080
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
			const manifestPlugins = config.plugins.filter( filterPlugins( ManifestPlugin ) );
			expect( manifestPlugins.length ).toBe( 1 );
			expect( manifestPlugins[ 0 ].options.fileName ).toEqual( 'custom-manifest.json' );
		} );

		it( 'uses a consistent seed for manifests generated in the same directory', () => {
			const { ManifestPlugin } = plugins.constructors;
			const [ manifest1 ] = development( {
				entry: { main: 'some-file' },
				output: {
					path: '/some/path',
				},
				devServer: {
					port: 8080,
				},
			} )
				.plugins
				.filter( filterPlugins( ManifestPlugin ) );
			const [ manifest2 ] = development( {
				entry: { main: 'some-file' },
				output: {
					path: '/some/path',
				},
				devServer: {
					port: 8080,
				},
			} )
				.plugins
				.filter( filterPlugins( ManifestPlugin ) );
			const [ manifest3 ] = development( {
				entry: { main: 'some-file' },
				output: {
					path: '/some/DIFFERENT/path',
				},
				devServer: {
					port: 8080,
				},
			} )
				.plugins
				.filter( filterPlugins( ManifestPlugin ) );
			// Ensure the two builds in the same folder use the same seed.
			expect( manifest1.options.seed ).toEqual( {} );
			expect( manifest2.options.seed ).toEqual( {} );
			expect( manifest1 ).not.toBe( manifest2 );
			expect( manifest1.options.seed ).toBe( manifest2.options.seed );
			// Ensure the build to the other output.path uses a different seed.
			expect( manifest3 ).not.toBe( manifest1 );
			expect( manifest3 ).not.toBe( manifest2 );
			expect( manifest3.options.seed ).toEqual( {} );
			expect( manifest3.options.seed ).not.toBe( manifest2.options.seed );
			expect( manifest3.options.seed ).not.toBe( manifest1.options.seed );
		} );

		it( 'permits filtering the computed output of individual loaders', () => {
			addFilter( 'loaders/asset', ( loader ) => {
				loader.test = /\.(png|jpg|jpeg|gif|svg)$/;
				return loader;
			} );
			addFilter( 'loaders/resource', ( loader ) => {
				loader.options = {
					publicPath: '../../',
				};
				return loader;
			} );
			const config = development( {
				entry: {
					main: 'some-file.js',
				},
			} );
			const resourceLoader = getLoaderByName( config.module.rules, 'asset/resource' );
			const assetLoader = getLoaderByName( config.module.rules, 'asset' );
			const jsLoader = getLoaderByName( config.module.rules, 'babel-loader' );
			expect( resourceLoader ).toEqual( expect.objectContaining( {
				exclude: [ /^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html?$/, /\.json$/ ],
				type: 'asset/resource',
				options: {
					publicPath: '../../',
				},
			} ) );
			expect( assetLoader ).toEqual( expect.objectContaining( {
				test: /\.(png|jpg|jpeg|gif|svg)$/,
				type: 'asset',
				parser: {
					dataUrlCondition: {
						maxSize: 10 * 1024,
					},
				},
			} ) );
			expect( jsLoader ).not.toBeNull();
		} );

		it( 'permits filtering the entire stylesheet loader chain', () => {
			addFilter( 'presets/stylesheet-loaders', ( loader ) => {
				loader.test = /\.styl$/;
				return loader;
			} );
			addFilter( 'loaders/sass', () => ( {
				loader: 'stylus',
				mode: 'development',
			} ) );
			const config = development( {
				entry: {
					main: 'some-file.js',
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

		it( 'passes the preset configuration object to the stylesheet chain filter', () => {
			const config = {
				entry: {
					main: 'some-file.js',
				},
			};
			addFilter( 'presets/stylesheet-loaders', ( loader, preset, presetConfig ) => {
				expect( presetConfig ).toBe( config );
				expect( preset ).toBe( 'development' );
				return loader;
			} );
			development( config );
		} );

		it( 'permits skipping a specific stylesheet loader by filtering it to null', () => {
			addFilter( 'loaders/postcss', returnNull );
			addFilter( 'loaders/sass', returnNull );
			const config = development( {
				entry: {
					main: 'some-file.js',
				},
			} );
			const styleChain = getLoaderByTest( config.module.rules, /\.s?css$/ );
			expect( styleChain ).toEqual( {
				test: /\.s?css$/,
				use: [
					{
						loader: require.resolve( 'style-loader' ),
						options: {},
					},
					{
						loader: require.resolve( 'css-loader' ),
						options: {
							importLoaders: 1,
							sourceMap: true,
						},
					},
				],
			} );
		} );

		it( 'does not include null loader entries if a loader was disabled with a filter', () => {
			addFilter( 'presets/stylesheet-loaders', returnNull );
			addFilter( 'loaders/ts', returnNull );
			const config = development( {
				entry: {
					main: 'some-file.js',
				},
			} );
			// Should have stripped out the null entries.
			expect( config.module.rules[ 1 ].oneOf.length ).toBe( 3 );
			expect( config.module.rules[ 1 ].oneOf[ 0 ] )
				.toEqual( expect.objectContaining( { test: /\.jsx?$/ } ) );
			expect( config.module.rules[ 1 ].oneOf[ 1 ] )
				.toEqual( expect.objectContaining( { type: 'asset' } ) );
			expect( config.module.rules[ 1 ].oneOf[ 2 ] )
				.toEqual( expect.objectContaining( { type: 'asset/resource' } ) );
		} );

		it( 'passes the preset config as argument 2 to loader filters', () => {
			addFilter( 'loaders/js', ( options, config ) => {
				expect( config ).not.toBeNull();
				expect( config.name ).toBe( 'dev-build' );
				return options;
			} );
			development( {
				name: 'dev-build',
			} );
		} );

		it( 'permits filtering only a specific invocation of a preset', () => {
			addFilter( 'presets/stylesheet-loaders', returnNull );
			addFilter( 'loaders/ts', returnNull );

			const filterToNullInBuild1 = ( options, config ) => {
				if ( config.name === 'build1' ) {
					return null;
				}
				// Simplified version to make test easier.
				return options.test ?
					{ test: options.test } :
					{ type: options.type };
			};
			addFilter( 'loaders/js', filterToNullInBuild1 );
			addFilter( 'loaders/asset', filterToNullInBuild1 );
			addFilter( 'loaders/resource', filterToNullInBuild1 );
			addFilter( 'loaders/sourcemap', filterToNullInBuild1 );

			const config1 = development( { name: 'build1' } );
			const config2 = development( { name: 'build2' } );

			expect( config1.module.rules ).toEqual( [] );
			expect( config2.module.rules ).toEqual( [
				{ test: /\.(js|mjs|jsx|ts|tsx|css)$/ },
				{
					oneOf: [
						{ test: /\.jsx?$/ },
						{ test: /\.(png|jpg|jpeg|gif|avif|webp|svg|woff|woff2|eot|ttf)$/ },
						{ type: 'asset/resource' },
					],
				},
			] );
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
				filename: '[name].[contenthash].js',
				chunkFilename: '[name].[contenthash].chunk.js',
				path: 'build/',
				publicPath: '',
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
			const cssPlugins = config.plugins.filter( filterPlugins( MiniCssExtractPlugin ) );
			expect( cssPlugins.length ).toBe( 1 );
			expect( cssPlugins[ 0 ].options.filename ).toEqual( '[name].[contenthash].css' );
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
			const cssPlugins = config.plugins.filter( filterPlugins( MiniCssExtractPlugin ) );
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
			const manifestPlugins = config.plugins.filter( filterPlugins( ManifestPlugin ) );
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
			const manifestPlugins = config.plugins.filter( filterPlugins( ManifestPlugin ) );
			expect( manifestPlugins.length ).toBe( 1 );
			expect( manifestPlugins[ 0 ].options.fileName ).toEqual( 'custom-manifest.json' );
		} );

		it( 'uses a consistent seed for manifests generated in the same directory', () => {
			const { ManifestPlugin } = plugins.constructors;
			const [ manifest1 ] = production( {
				entry: { main: 'some-file' },
				output: { path: '/some/path' },
			} )
				.plugins
				.filter( filterPlugins( ManifestPlugin ) );
			const [ manifest2 ] = production( {
				entry: { main: 'some-file' },
				output: { path: '/some/path' },
			} )
				.plugins
				.filter( filterPlugins( ManifestPlugin ) );
			const [ manifest3 ] = production( {
				entry: { main: 'some-file' },
				output: { path: '/some/DIFFERENT/path' },
			} )
				.plugins
				.filter( filterPlugins( ManifestPlugin ) );
			// Ensure the two builds in the same folder use the same seed.
			expect( manifest1.options.seed ).toEqual( {} );
			expect( manifest2.options.seed ).toEqual( {} );
			expect( manifest1 ).not.toBe( manifest2 );
			expect( manifest1.options.seed ).toBe( manifest2.options.seed );
			// Ensure the build to the other output.path uses a different seed.
			expect( manifest3 ).not.toBe( manifest1 );
			expect( manifest3 ).not.toBe( manifest2 );
			expect( manifest3.options.seed ).toEqual( {} );
			expect( manifest3.options.seed ).not.toBe( manifest2.options.seed );
			expect( manifest3.options.seed ).not.toBe( manifest1.options.seed );
		} );

		it( 'permits filtering the computed output of individual loaders', () => {
			addFilter( 'loaders/asset', ( loader ) => {
				loader.test = /\.(png|jpg|jpeg|gif|svg)$/;
				return loader;
			} );
			addFilter( 'loaders/resource', ( loader ) => {
				loader.options = {
					publicPath: '../../',
				};
				return loader;
			} );
			const config = production( {
				entry: {
					main: 'some-file.js',
				},
			} );
			const resourceLoader = getLoaderByName( config.module.rules, 'asset/resource' );
			const assetLoader = getLoaderByName( config.module.rules, 'asset' );
			const jsLoader = getLoaderByName( config.module.rules, 'babel-loader' );
			expect( resourceLoader ).toEqual( expect.objectContaining( {
				exclude: [ /^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html?$/, /\.json$/ ],
				type: 'asset/resource',
				options: {
					publicPath: '../../',
				},
			} ) );
			expect( assetLoader ).toEqual( expect.objectContaining( {
				test: /\.(png|jpg|jpeg|gif|svg)$/,
				type: 'asset',
				parser: {
					dataUrlCondition: {
						maxSize: 10 * 1024,
					},
				},
			} ) );
			expect( jsLoader ).not.toBeNull();
		} );

		it( 'permits filtering the entire stylesheet loader chain', () => {
			addFilter( 'presets/stylesheet-loaders', ( loader ) => {
				loader.test = /\.styl$/;
				return loader;
			} );
			addFilter( 'loaders/sass', () => ( {
				loader: 'stylus',
			} ) );
			const config = production( {
				entry: {
					main: 'some-file.js',
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

		it( 'passes the preset configuration object to the stylesheet chain filter', () => {
			const config = {
				entry: {
					main: 'some-file.js',
				},
			};
			addFilter( 'presets/stylesheet-loaders', ( loader, preset, presetConfig ) => {
				expect( presetConfig ).toBe( config );
				expect( preset ).toBe( 'production' );
				return loader;
			} );
			production( config );
		} );

		it( 'permits skipping a specific stylesheet loader by filtering it to null', () => {
			addFilter( 'loaders/postcss', returnNull );
			addFilter( 'loaders/sass', returnNull );
			const config = production( {
				entry: {
					main: 'some-file.js',
				},
			} );
			const styleChain = getLoaderByTest( config.module.rules, /\.s?css$/ );
			expect( styleChain ).toEqual( {
				test: /\.s?css$/,
				use: [
					plugins.constructors.MiniCssExtractPlugin.loader,
					{
						loader: require.resolve( 'css-loader' ),
						options: {
							importLoaders: 1,
						},
					},
				],
			} );
		} );

		it( 'does not include null loader entries if a loader was disabled with a filter', () => {
			addFilter( 'presets/stylesheet-loaders', returnNull );
			addFilter( 'loaders/ts', returnNull );
			const config = production( {
				entry: {
					main: 'some-file.js',
				},
			} );
			// Should have stripped out the null entries.
			expect( config.module.rules[ 0 ].oneOf.length ).toBe( 3 );
			expect( config.module.rules[ 0 ].oneOf[ 0 ] )
				.toEqual( expect.objectContaining( { test: /\.jsx?$/ } ) );
			expect( config.module.rules[ 0 ].oneOf[ 1 ] )
				.toEqual( expect.objectContaining( { type: 'asset' } ) );
			expect( config.module.rules[ 0 ].oneOf[ 2 ] )
				.toEqual( expect.objectContaining( { type: 'asset/resource' } ) );
		} );
	} );

	it( 'passes the preset config as argument 2 to loader filters', () => {
		addFilter( 'loaders/js', ( options, config ) => {
			expect( config ).not.toBeNull();
			expect( config.name ).toBe( 'dev-build' );
			return options;
		} );
		production( {
			name: 'dev-build',
		} );
	} );

	it( 'permits filtering only a specific invocation of a preset', () => {
		addFilter( 'presets/stylesheet-loaders', returnNull );
		addFilter( 'loaders/ts', returnNull );

		const filterToNullInBuild1 = ( options, config ) => {
			if ( config.name === 'build1' ) {
				return null;
			}
			// Simplified version to make test easier.
			return options.test ?
				{ test: options.test } :
				{ type: options.type };
		};
		addFilter( 'loaders/js', filterToNullInBuild1 );
		addFilter( 'loaders/asset', filterToNullInBuild1 );
		addFilter( 'loaders/resource', filterToNullInBuild1 );

		const config1 = production( { name: 'build1' } );
		const config2 = production( { name: 'build2' } );

		expect( config1.module.rules ).toEqual( [] );
		expect( config2.module.rules ).toEqual( [
			{
				oneOf: [
					{ test: /\.jsx?$/ },
					{ test: /\.(png|jpg|jpeg|gif|avif|webp|svg|woff|woff2|eot|ttf)$/ },
					{ type: 'asset/resource' },
				],
			},
		] );
	} );
} );
