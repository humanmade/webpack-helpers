const filePath = require( './file-path' );

// Depends on custom matchers defined in __tests__/setup.js.

describe( 'helpers/file-path', () => {
	it( 'properly generates a file system theme file path', () => {
		expect( filePath() ).toMatchFilePath( 'cwd' );
		expect( filePath( 'themes/theme-name' ) ).toMatchFilePath( 'cwd/themes/theme-name' );
		expect( filePath( 'themes\\theme-name' ) ).toMatchFilePath( 'cwd/themes/theme-name' );
		expect( filePath( 'themes', 'theme-name', 'style.css' ) ).toMatchFilePath( 'cwd/themes/theme-name/style.css' );
	} );
} );
