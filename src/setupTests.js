/**
 * Define custom Jest matchers.
 */

expect.extend( {
	toMatchFilePath: ( received, expected ) => {
		const pass = ( new RegExp( received.replace( /(\\|\/)/g, '(\\\\|/)' ) ) ).test( expected );
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
