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

	describe( '.eslint()', () => {
		it( 'tests for .js or .jsx files', () => {
			expect( 'file.js'.match( loaders.eslint().test ) ).not.toBeNull();
			expect( 'file.jsx'.match( loaders.eslint().test ) ).not.toBeNull();
			expect( 'file.scss'.match( loaders.eslint().test ) ).toBeNull();
		} );
	} );

	describe( '.js()', () => {
		it( 'tests for .js or .jsx files', () => {
			expect( 'file.js'.match( loaders.eslint().test ) ).not.toBeNull();
			expect( 'file.jsx'.match( loaders.eslint().test ) ).not.toBeNull();
			expect( 'file.scss'.match( loaders.eslint().test ) ).toBeNull();
		} );
	} );

	describe( '.url()', () => {
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
				expect( acceptedFileType.match( loaders.url().test ) ).not.toBeNull();
			} );
			[
				'file.js',
				'file.css',
				'file.html',
			].forEach( unacceptedFileType => {
				expect( unacceptedFileType.match( loaders.url().test ) ).toBeNull();
			} );
		} );
	} );

} );
