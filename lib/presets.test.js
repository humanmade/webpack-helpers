const {
	devConfig,
} = require( './presets' );

describe( 'presets', () => {
	describe( 'devConfig()', () => {
		it( 'is a function', () => {
			expect( devConfig ).toBeInstanceOf( Function );
		} );

		it( 'merges provided options with defaults to return a full webpack config object', () => {
			const config = devConfig( {
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

		// TODO: Add test cases for all logic branches in devConfig().
		// it( 'assumes a default output.publicPath if a port is specified' );
		// it( 'accounts for the value of devServer.https when inferring publicPath URI' );
		// it( 'injects a ManifestPlugin if publicPath can be inferred and no manifest plugin is already present' );
		// it( 'does not inject a ManifestPlugin if publicPath cannot be inferred' );
		// it( 'does not inject a ManifestPlugin if a manifest plugin is already present' );
	} );
} );
