const {
	getCallbacks,
	setupRegistry,
	addFilter,
	removeFilter,
	applyFilters,
} = require( './filters' );

// Functions to use when testing filtering.
const toKebabCase = ( str ) => str.split( /[_ ]+/g ).join( '-' );
const toLowerCase = ( str ) => str.toLowerCase();
const toUpperCase = ( str ) => str.toUpperCase();
const reverse = ( str ) => str.split( '' ).reverse().join( '' );
const reverseWords = ( str ) => str.split( ' ' ).reverse().join( ' ' );

describe( 'filters', () => {
	describe( '.getCallbacks() [internal]', () => {

		it( 'is a function', () => {
			expect( getCallbacks ).toBeInstanceOf( Function );
		} );

		it( 'returns callbacks for the requested hook', () => {
			setupRegistry( {
				'loaders/js': {
					10: [
						toKebabCase,
						toLowerCase,
					],
				},
				'loaders/css': {
					10: [
						toUpperCase,
					],
				},
			} );
			expect( getCallbacks( 'loaders/js' ) ).toEqual( [
				toKebabCase,
				toLowerCase,
			] );
			expect( getCallbacks( 'loaders/css' ) ).toEqual( [
				toUpperCase,
			] );
		} );

		it( 'returns callbacks in priority order', () => {
			setupRegistry( {
				'loaders/js': {
					10: [ 'a', 'b' ],
					3: [ 'c' ],
					22: [ 'd' ],
					7: [ 'e', 'f' ],
				},
			} );
			const hooks = getCallbacks( 'loaders/js' );
			expect( hooks ).toEqual( [ 'c', 'e', 'f', 'a', 'b', 'd' ] );
		} );

		it( 'returns empty array for uninitialized hook', () => {
			setupRegistry();
			const hooks = getCallbacks( 'unused/hook' );
			expect( hooks ).toEqual( [] );
		} );
	} );

	describe( 'addFilter', () => {
		beforeEach( () => {
			setupRegistry();
		} );

		it( 'adds a callback for the specified filter', () => {
			const hook = () => 'Woo';
			addFilter( 'loaders/js', hook );
			expect( getCallbacks( 'loaders/js' ) ).toEqual( [ hook ] );
		} );

		it( 'adds callbacks with the specified priority', () => {
			const hook = () => 'Woo';
			const hook2 = () => 'Woo-er';
			const hook3 = () => 'Woo-est';
			addFilter( 'loaders/js', hook2, 9 );
			addFilter( 'loaders/js', hook3, 11 );
			addFilter( 'loaders/js', hook );
			expect( getCallbacks( 'loaders/js' ) ).toEqual( [ hook2, hook, hook3 ] );
		} );
	} );

	describe( 'removeFilter', () => {
		beforeEach( () => {
			setupRegistry();
		} );

		it( 'removes a previously-added callback for the specified filter', () => {
			const hook = () => 'Woo';
			addFilter( 'loaders/js', hook );
			removeFilter( 'loaders/js', hook );
			expect( getCallbacks( 'loaders/js' ) ).toEqual( [] );
		} );

		it( 'only removes the requested callback', () => {
			const hook = () => 'Woo';
			const hook2 = () => 'Woo-er';
			addFilter( 'loaders/js', hook );
			addFilter( 'loaders/js', hook2 );
			removeFilter( 'loaders/js', hook );
			expect( getCallbacks( 'loaders/js' ) ).toEqual( [ hook2 ] );
		} );

		it( 'does not remove a callback if the priority does not match', () => {
			const hook = () => 'Woo';
			addFilter( 'loaders/js', hook, 9 );
			removeFilter( 'loaders/js', hook, 10 );
			expect( getCallbacks( 'loaders/js' ) ).toEqual( [ hook ] );
		} );
	} );

	describe( 'applyFilters', () => {
		const input = 'Pasta Carbonara';

		beforeEach( () => {
			setupRegistry();
		} );

		it( 'returns input unchanged if no filters', () => {
			expect( applyFilters( 'do/stuff', input ) ).toBe( 'Pasta Carbonara' );
		} );

		it( 'processes input with the registered filters', () => {
			addFilter( 'words', toKebabCase );
			addFilter( 'words', toUpperCase );
			expect( applyFilters( 'words', input ) ).toBe( 'PASTA-CARBONARA' );
		} );

		it( 'processes input through callbacks in the specified order', () => {
			addFilter( 'words', toLowerCase, 9 );
			addFilter( 'words', toKebabCase, 11 );
			addFilter( 'words', reverseWords, 10 );
			addFilter( 'words', reverse, 10 );
			expect( applyFilters( 'words', input ) ).toBe( 'atsap-aranobrac' );
		} );
	} );
} );
