const { unlinkSync } = require( 'fs' );
const onExit = require( 'signal-exit' );

/**
 * Register an onExit handler to remove one or more files when the server exits.
 *
 * @param {String|String[]} paths An array of string paths.
 */
const cleanOnExit = ( paths = [] ) => {
	if ( ! Array.isArray( paths ) ) {
		cleanOnExit( [
			paths,
		] );
		return;
	}

	onExit( () => {
		paths.forEach( path => {
			try {
				unlinkSync( path );
			} catch ( err ) {
				// Silently ignore unlinking errors: so long as the file is gone, that is ok.
			}
		} );
	} );
};

module.exports = {
	cleanOnExit,
	fileName: 'asset-manifest.json',
};
