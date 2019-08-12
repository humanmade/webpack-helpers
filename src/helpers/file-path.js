const process = require( 'process' );
const { join } = require( 'path' );

/**
 * Convert a working directory-relative path to an absolute file system path.
 *
 * @param  {...String} relPaths One or more strings describing a path relative
 *                              to the working directory.
 * @returns {String} An absolute file system path.
 */
module.exports = ( ...relPaths ) => join( process.cwd(), ...relPaths );
