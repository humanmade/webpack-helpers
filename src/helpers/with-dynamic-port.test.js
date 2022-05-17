const withDynamicPort = require( './with-dynamic-port' );

const choosePort = require( './choose-port' );

jest.mock( './choose-port', () => jest.fn() );

describe( 'withDynamicPort', () => {
	let oldArgv;

	beforeEach( () => {
		oldArgv = process.argv;
	} );

	afterEach( () => {
		process.argv = oldArgv;
	} );

	describe( 'when dev server is not in use', () => {
		beforeEach( () => {
			process.argv = [
				'/usr/bin/node',
				'/project/dir/node_modules/.bin/webpack',
			];
		} );

		it( 'passes configuration through unchanged', () => {
			const config = {
				entry: {},
				output: {},
			};
			expect( withDynamicPort( config ) ).toBe( config );
			expect( withDynamicPort( 9090, config ) ).toBe( config );
		} );

		it( 'passes multi-configuration through unchanged', () => {
			const config = [
				{
					entry: {},
					output: {},
				},
				{
					entry: {},
					output: {},
				},
			];
			expect( withDynamicPort( config ) ).toBe( config );
			expect( withDynamicPort( 9091, config ) ).toBe( config );
		} );
	} );

	describe( 'when using webpack-dev-server', () => {
		beforeEach( () => {
			process.argv = [
				'/usr/bin/node',
				'/project/dir/node_modules/.bin/webpack-dev-server',
			];
			choosePort.mockImplementation( ( port ) => Promise.resolve( port ) );
		} );

		afterEach( () => {
			choosePort.mockReset();
		} );

		it( 'uses the provided port, if available', async () => {
			const config = {
				entry: {},
				output: {},
			};
			expect( await withDynamicPort( 8080, config ) ).toEqual( {
				devServer: {
					port: 8080,
				},
				entry: {},
				output: {
					publicPath: 'http://localhost:8080/build/',
				},
			} );
		} );

		it( 'uses a default port if the port argument to be omitted', async () => {
			const config = {
				entry: {},
				output: {},
			};
			expect( await withDynamicPort( config ) ).toEqual( {
				devServer: {
					port: 9090,
				},
				entry: {},
				output: {
					publicPath: 'http://localhost:9090/build/',
				},
			} );
		} );

		it( 'replaces :port the specified port in the publicPath', async () => {
			const config = {
				entry: {},
				output: {
					publicPath: 'http://localhost:port',
				},
			};
			expect( await withDynamicPort( config ) ).toEqual( {
				devServer: {
					port: 9090,
				},
				entry: {},
				output: {
					publicPath: 'http://localhost:9090',
				},
			} );
		} );

		it( 'replaces :{provided port number} with the specified port in the publicPath', async () => {
			const config = {
				entry: {},
				output: {
					publicPath: 'http://localhost:port',
				},
			};
			expect( await withDynamicPort( 8081, config ) ).toEqual( {
				devServer: {
					port: 8081,
				},
				entry: {},
				output: {
					publicPath: 'http://localhost:8081',
				},
			} );
		} );

		it( 'replaces :{provided port number} with an open port in the publicPath', async () => {
			const config = {
				entry: {},
				output: {
					publicPath: 'http://localhost:9090',
				},
			};
			choosePort.mockImplementationOnce( () => Promise.resolve( 8080 ) );
			expect( await withDynamicPort( 9090, config ) ).toEqual( {
				devServer: {
					port: 8080,
				},
				entry: {},
				output: {
					publicPath: 'http://localhost:8080',
				},
			} );
		} );

		it( 'does not overwrite existing config properties', async () => {
			const config = {
				devServer: {
					server: 'https',
				},
				entry: {
					'name': './bundle.js',
				},
				output: {
					filename: '[name].js',
					publicPath: 'https://localhost:9090',
				},
				plugins: [
					'Plugin goes here',
				],
			};
			choosePort.mockImplementationOnce( () => Promise.resolve( 8082 ) );
			expect( await withDynamicPort( 9090, config ) ).toEqual( {
				devServer: {
					server: 'https',
					port: 8082,
				},
				entry: {
					'name': './bundle.js',
				},
				output: {
					filename: '[name].js',
					publicPath: 'https://localhost:8082',
				},
				plugins: [
					'Plugin goes here',
				],
			} );
		} );

		describe( 'multi-configuration webpack file', () => {
			it( 'uses the provided port, if available', async () => {
				const config = [
					{
						entry: {},
						output: {},
					},
					{
						entry: {},
						output: {},
					},
				];
				expect( await withDynamicPort( 8080, config ) ).toEqual( [
					{
						devServer: {
							port: 8080,
						},
						entry: {},
						output: {
							publicPath: 'http://localhost:8080/build/',
						},
					},
					{
						devServer: {
							port: 8080,
						},
						entry: {},
						output: {
							publicPath: 'http://localhost:8080/build/',
						},
					},
				] );
			} );

			it( 'replaces :port or :{provided port number} with the specified port in the publicPath', async () => {
				const config = [
					{
						entry: {},
						output: {
							publicPath: 'http://localhost:port',
						},
					},
					{
						entry: {},
						output: {
							publicPath: 'http://localhost:9090',
						},
					},
				];
				choosePort.mockImplementationOnce( () => Promise.resolve( 8080 ) );
				expect( await withDynamicPort( 9090, config ) ).toEqual( [
					{
						devServer: {
							port: 8080,
						},
						entry: {},
						output: {
							publicPath: 'http://localhost:8080',
						},
					},
					{
						devServer: {
							port: 8080,
						},
						entry: {},
						output: {
							publicPath: 'http://localhost:8080',
						},
					},
				] );
			} );
		} );
	} );
} );
