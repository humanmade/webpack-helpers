const deepCopy = require( './deep-copy' );

describe( 'helpers/clone-object', () => {
	it( 'is a function', () => {
		expect( deepCopy ).toBeInstanceOf( Function );
	} );

	it( 'does not mutate strings', () => {
		const cms = 'WordPress';
		expect( deepCopy( cms ) ).toBe( 'WordPress' );
	} );

	it( 'does not mutate numbers', () => {
		const project = 2501;
		expect( deepCopy( project ) ).toBe( 2501 );
	} );

	it( 'does not mutate functions', () => {
		const makeWidgets = () => 'widgets';
		const copy = deepCopy( makeWidgets );
		expect( copy ).toBe( makeWidgets );
		expect( copy() ).toBe( 'widgets' );
	} );

	it( 'does not mutate regular expressions', () => {
		const project = /\.(js|css|html)/;
		expect( deepCopy( project ) ).toBe( project );
	} );

	it( 'deeply copies arrays', () => {
		const original = [
			1,
			'2',
			3,
			[ 4 ],
			[
				() => 5,
				[ 6 ],
			],
		];
		const copy = deepCopy( original );
		expect( copy ).toEqual( original );
		expect( copy ).not.toBe( original );
		expect( copy[ 3 ] ).not.toBe( original[ 3 ] );
		expect( copy[ 4 ] ).not.toBe( original[ 4 ] );
		expect( copy[ 4 ][ 0 ] ).toBe( original[ 4 ][ 0 ] );
		expect( copy[ 4 ][ 0 ]() ).toBe( 5 );
		expect( copy[ 4 ][ 1 ] ).not.toBe( original[ 4 ][ 1 ] );
	} );

	it( 'deeply copies the input object', () => {
		const original = {
			str: 'a',
			num: 42,
			bool: true,
			obj: {
				name: 'Devon',
				nested: {
					arr: [ 1, 2, 3 ],
				},
				fn: () => 'result',
			},
		};
		const copy = deepCopy( original );
		expect( copy ).toEqual( original );
		expect( copy ).not.toBe( original );
		expect( copy.obj ).not.toBe( original.obj );
		expect( copy.obj.nested ).not.toBe( original.obj.nested );
		expect( copy.obj.nested.arr ).not.toBe( original.obj.nested.arr );
		expect( copy.obj.fn ).toBe( original.obj.fn );
	} );
} );
