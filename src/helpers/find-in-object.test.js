const findInObject = require( './find-in-object' );

describe( 'findInObject', () => {
	let obj;

	beforeEach( () => {
		obj = {
			some: {
				nested: {
					value: 42,
				},
			},
		};
	} );

	it( 'is a function', () => {
		expect( findInObject ).toBeInstanceOf( Function );
	} );

	it( 'returns a nested path within an object', () => {
		expect( findInObject( obj, 'some.nested.value' ) ).toBe( 42 );
		expect( findInObject( obj, 'some.nested' ) ).toEqual( {
			value: 42,
		} );
	} );

	it( 'returns null if the value is not found', () => {
		expect( findInObject( obj, 'some.other.value' ) ).toBeNull();
	} );

	it( 'returns null if input is not an object', () => {
		expect( findInObject( null, 'some.value' ) ).toBeNull();
		expect( findInObject( false, 'some.value' ) ).toBeNull();
		expect( findInObject( 42, 'some.value' ) ).toBeNull();
	} );
} );
