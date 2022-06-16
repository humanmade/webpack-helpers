const { addFilter, setupRegistry } = require( './helpers/filters' );
const loaders = require( './loaders' );

describe( 'loaders', () => {
	const loaderNames = Object.keys( loaders );

	// Run some general assertions for each loader.
	it.each( loaderNames )( '.%s is a function', ( loaderName ) => {
		expect( loaders[ loaderName ] ).toBeDefined();
		expect( loaders[ loaderName ] ).toBeInstanceOf( Function );
	} );

	it.each( loaderNames )( '.%s() returns an object', ( loaderName ) => {
		expect( typeof loaders[ loaderName ]() ).toBe( 'object' );
	} );

	it.each( loaderNames )( '.%s() accepts overrides', ( loaderName ) => {
		const result = loaders[ loaderName ]( {
			overrides: 'present',
			value: 42,
		} );
		expect( result.overrides ).toBe( 'present' );
		expect( result.value ).toBe( 42 );
	} );

	describe( '.js()', () => {
		it( 'tests for .js or .jsx files', () => {
			expect( 'file.js'.match( loaders.js().test ) ).not.toBeNull();
			expect( 'file.jsx'.match( loaders.js().test ) ).not.toBeNull();
			expect( 'file.scss'.match( loaders.js().test ) ).toBeNull();
		} );
	} );

	describe( '.asset()', () => {
		it( 'tests for static assets', () => {
			[
				'file.png',
				'file.jpg',
				'file.jpeg',
				'file.gif',
				'file.svg',
				'file.woff',
				'file.woff2',
				'file.eot',
				'file.ttf',
			].forEach( acceptedFileType => {
				expect( acceptedFileType.match( loaders.asset().test ) ).not.toBeNull();
			} );
			[
				'file.js',
				'file.css',
				'file.html',
			].forEach( unacceptedFileType => {
				expect( unacceptedFileType.match( loaders.asset().test ) ).toBeNull();
			} );
		} );
	} );

	describe( 'filtering', () => {
		beforeEach( () => {
			setupRegistry();
		} );

		it( 'does not mutate defaults', () => {
			addFilter( 'loaders/js/defaults', ( defaults ) => {
				defaults.test = /\.js$/;
				return defaults;
			} );

			const loader = loaders.js();

			expect( loader.test ).toEqual( /\.js$/ );
			expect( loaders.js.defaults.test ).toEqual( /\.jsx?$/ );
		} );
	} );

} );
