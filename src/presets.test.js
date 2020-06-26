const {
	development,
	production,
} = require( './presets' );

jest.mock( 'process', () => ( { cwd: () => 'cwd' } ) );

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
	} );
} );
