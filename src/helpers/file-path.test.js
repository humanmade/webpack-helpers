const filePath = require( './file-path' );

jest.mock( 'process', () => ( { cwd: () => 'cwd' } ) );

expect.extend( {
	toMatchFilePath( received, expected ) {
		const pass = ( new RegExp( received.replace( /(\\|\/)/g, '(\\\\|\/)' ) ) ).test( expected );
		if ( pass ) {
			return {
				message: () => `expected ${ received } not to match file path ${ expected }`,
				pass: true,
			};
		}

		return {
			message: () => `expected ${ received } to match file path ${ expected }`,
			pass: false,
		};
	},
} );

describe( 'helpers/file-path', () => {
	it( 'properly generates a file system theme file path', () => {
		expect( filePath() ).toMatchFilePath( 'cwd' );
		expect( filePath( 'themes/theme-name' ) ).toMatchFilePath( 'cwd/themes/theme-name' );
		expect( filePath( 'themes\\theme-name' ) ).toMatchFilePath( 'cwd/themes/theme-name' );
		expect( filePath( 'themes', 'theme-name', 'style.css' ) ).toMatchFilePath( 'cwd/themes/theme-name/style.css' );
	} );
} );
