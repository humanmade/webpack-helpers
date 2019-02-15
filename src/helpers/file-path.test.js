const filePath = require( './file-path' );

describe( 'helpers/file-path', () => {
	it( 'properly generates a file system theme file path', () => {
		expect( filePath() ).toBe( process.cwd() );
		expect( filePath( 'themes/theme-name' ) ).toBe( `${ process.cwd() }/themes/theme-name` );
		expect( filePath( 'themes', 'theme-name', 'style.css' ) ).toBe( `${ process.cwd() }/themes/theme-name/style.css` );
	} );
} );
