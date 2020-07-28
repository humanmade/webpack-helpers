const plugins = require( './plugins' );

describe( 'plugins', () => {
	const pluginNames = Object.keys( plugins ).filter( key => key !== 'constructors' );

	// Run some general assertions for each loader.
	it.each( pluginNames )( '.%s is a function', ( pluginName ) => {
		expect( plugins[ pluginName ] ).toBeDefined();
		expect( plugins[ pluginName ] ).toBeInstanceOf( Function );
	} );

	it.each( pluginNames )( '.%s can be called successfully', ( pluginName ) => {
		expect( () => {
			let options;
			if ( pluginName === 'copy' ) {
				options = {
					patterns: [
						{
							from: 'source',
							to: 'dest',
						},
					],
				};
			}
			plugins[ pluginName ]( options );
		} ).not.toThrow();
	} );
} );
