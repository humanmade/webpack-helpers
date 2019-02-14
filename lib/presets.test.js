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
		// it( 'creates a ManifestPlugin if output.publicPath is specified' );
		// it( 'assumes a default output.publicPath if a port is specified' );
	} );
} );
