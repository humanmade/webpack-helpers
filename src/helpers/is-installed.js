/**
 * Check whether a package may be `require`d without error.
 *
 * @param {String} packageName The package to test.
 * @returns {Boolean} Whether the package is available via `require()`.
 */
module.exports = ( packageName ) => {
	const checkRequire = require;
	try {
		checkRequire( packageName );
		return true;
	} catch ( err ) { // eslint-disable-line no-unused-vars
		return false;
	}
};
