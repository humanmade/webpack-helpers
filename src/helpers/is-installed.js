/**
 * Check whether a package may be `require`d without error.
 *
 * @param {String} packageName The package to test.
 * @returns {Boolean} Whether the package is available via `require()`.
 */
module.exports = ( packageName ) => {
	/* eslint-disable global-require */
	try {
		require( packageName );
		return true;
	} catch ( err ) {
		return false;
	}
	/* eslint-enable */
};
