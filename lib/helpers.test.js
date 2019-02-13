const { filePath, withOverrides } = require( './helpers' );

describe( 'helpers', () => {

	describe( 'withOverrides', () => {
		it( 'is a function', () => {
			expect( withOverrides ).toBeInstanceOf( Function );
		} );

		it( 'returns a function', () => {
			expect( withOverrides() ).toBeInstanceOf( Function );
		} );

		it( 'returns a function which returns an object', () => {
			expect( withOverrides()() ).toEqual( {} );
		} );

		it( 'generates an object based on a provided template', () => {
			const template = {
				test: /\.jsx?$/,
				exclude: /node_modules/,
				options: {
					cacheDirectory: true,
				},
			};
			const output = withOverrides( template )();
			expect( output ).toEqual( template );
			expect( output ).not.toBe( template );
		} );
	} );

	describe( 'filePath', () => {
		it( 'properly generates a file system theme file path', () => {
			expect( filePath() ).toBe( process.cwd() );
			expect( filePath( 'themes/theme-name' ) ).toBe( `${ process.cwd() }/themes/theme-name` );
			expect( filePath( 'themes', 'theme-name', 'style.css' ) ).toBe( `${ process.cwd() }/themes/theme-name/style.css` );
		} );
	} );

} );

