const choosePort = require( './choose-port' );

/**
 * Choose multiple free ports.
 *
 * @param {Number[]} ports Array of ports to attempt to bind.
 * @returns {Promise} A promise resolving to an array of available ports.
 */
module.exports = ( ports = [] ) => {
	return Promise.all( ports.map( port => choosePort( port ) ) );
};
