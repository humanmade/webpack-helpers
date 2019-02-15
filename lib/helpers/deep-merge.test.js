const deepMerge = require( './deep-merge' );

describe( 'helpers/deep-merge', () => {
	it( 'is a function', () => {
		expect( deepMerge ).toBeInstanceOf( Function );
	} );

	it( 'returns an object', () => {
		expect( deepMerge() ).toEqual( {} );
	} );

	it( 'deeply merges objects', () => {
		const obj1 = {
			test: '.jsx?$',
			exclude: 'node_modules',
			options: {
				someFlag: true,
				otherFlag: 'value',
			},
		};
		const obj2 = {
			test: '.scss$',
			options: {
				otherFlag: false,
				thirdFlag: 3,
			},
		};
		expect( deepMerge( obj1, obj2 ) ).toEqual( {
			test: '.scss$',
			exclude: 'node_modules',
			options: {
				someFlag: true,
				otherFlag: false,
				thirdFlag: 3,
			},
		} );
	} );
} );
