const externals = require( './externals' );

describe( 'externals', () => {

	it( 'contains entries for all core WordPress JS global members' , () => {
		expect( externals ).toMatchSnapshot();
	} );

} );
