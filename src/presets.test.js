const {
	development,
	production,
} = require( './presets' );

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
				path: 'build/',
			} );
		} );

		// TODO: Add test cases for all logic branches in development().
		// it( 'assumes a default output.publicPath if a port is specified' );
		// it( 'accounts for the value of devServer.https when inferring publicPath URI' );
		// it( 'injects a ManifestPlugin if publicPath can be inferred and no manifest plugin is already present' );
		// it( 'does not inject a ManifestPlugin if publicPath cannot be inferred' );
		// it( 'does not inject a ManifestPlugin if a manifest plugin is already present' );
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
				path: 'build/',
			} );
		} );

		// TODO: Add test cases for all logic branches in production().
		// it( 'injects a MiniCssExtractPlugin if none is present in opts' );
	} );
} );
