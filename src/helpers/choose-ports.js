// const { choosePort } = require( 'react-dev-utils/WebpackDevServerUtils' );
const chalk = require( 'chalk' );
const inquirer = require( 'inquirer' );
const detect = require( 'detect-port-alt' );
const isRoot = require( 'is-root' );

const getProcessForPort = require( '../vendor/get-process-for-port' );

const DEFAULT_PORT = parseInt( process.env.PORT, 10 ) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * choosePort method adapted from create-react-app's react-dev-utils Webpack
 * utilities package. We forked this module rather than depending directly on
 * the react-dev-utils package to make it not clear the console before prompt.
 *
 * https://github.com/facebook/create-react-app/blob/59bf92e46dca2fd67f51d50cdd0dfcc55e5586cd/packages/react-dev-utils/WebpackDevServerUtils.js
 *
 * @param {String} host        A host string.
 * @param {Number} defaultPort The port to try to open.
 *
 * @returns {Promise} A promise resolving to an available port number.
 */
const choosePort = ( host, defaultPort ) => detect( defaultPort, host ).then(
	port => new Promise( resolve => {
		if ( port === defaultPort ) {
			return resolve( port );
		}
		const message = process.platform !== 'win32' && defaultPort < 1024 && ! isRoot() ?
			'Admin permissions are required to run a server on a port below 1024.' :
			`Something is already running on port ${ defaultPort }.`;
		// clearConsole();
		const existingProcess = getProcessForPort( defaultPort );
		const question = {
			type: 'confirm',
			name: 'shouldChangePort',
			message: `${
				chalk.yellow( `${ message }${
					existingProcess ? ` Probably:\n  ${ existingProcess }` : ''
				}` )
			}\n\nWould you like to run the app on another port instead?`,
			default: true,
		};
		inquirer.prompt( question ).then( answer => {
			if ( answer.shouldChangePort ) {
				resolve( port );
			} else {
				resolve( null );
			}
		} );
	} ),
	err => {
		throw new Error( `${
			chalk.red( `Could not find an open port at ${ chalk.bold( host ) }.` )
		}\nNetwork error message: ${ err.message || err }\n` );
	}
);

/**
 * Given an array of desired ports, find open ports.
 *
 * @param {Number[]} ports
 * @returns {Promise} A Promise resolving to an array of available ports.
 */
const choosePorts = ( ports = [ DEFAULT_PORT ] ) => {
	if ( ! Array.isArray( ports ) ) {
		return choosePorts( [ ports ] );
	}
	// For each item in the provided array of desired ports, detect whether
	// anything is running on that port and prompt to select an open port if
	// the requested port is not available.
	return ports.reduce( async ( chosenPortsPromise, nextDesiredPort ) => {
		const chosenPorts = await chosenPortsPromise;
		const selectedPort = await choosePort( HOST, nextDesiredPort );
		return [ ...chosenPorts, selectedPort ];
	}, Promise.resolve( [] ) );
};

module.exports = choosePorts;
