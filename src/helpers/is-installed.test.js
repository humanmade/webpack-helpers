const isInstalled = require( './is-installed' );

describe( 'isInstalled', () => {

	it( 'is a function', () => {
		expect( isInstalled ).toBeInstanceOf( Function );
	} );

	it( 'returns true for a package which is installed', () => {
		expect( isInstalled( 'jest' ) ).toBe( true );
	} );

	it( 'returns false if the value is not found', () => {
		expect( isInstalled( 'wpapi' ) ).toBe( false );
	} );
} );
