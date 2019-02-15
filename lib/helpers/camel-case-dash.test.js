const camelCaseDash = require( './camel-case-dash' );

describe( 'helpers/camel-case-dash', () => {
	it( 'is a function', () => {
		expect( camelCaseDash ).toBeInstanceOf( Function );
	} );

	it( 'transforms kebab-case strings to camel-case', () => {
		expect( camelCaseDash( 'kebab-case' ) ).toBe( 'kebabCase' );
		expect( camelCaseDash( 'dash-delimited-string' ) ).toBe( 'dashDelimitedString' );
	} );

	it( 'does not modify non-dash-delimited strings', () => {
		expect( camelCaseDash( 'word' ) ).toBe( 'word' );
		expect( camelCaseDash( 'camelCase' ) ).toBe( 'camelCase' );
		expect( camelCaseDash( 'UpperCamelCase' ) ).toBe( 'UpperCamelCase' );
	} );
} );
