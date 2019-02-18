/**
 * This module is adapted from create-react-app's `react-dev-utils` Webpack
 * utilities package. We forked this module rather than depending directly on
 * the react-dev-utils package so that it would not clear the console before
 * prompting the user for input.
 *
 * https://github.com/facebook/create-react-app/blob/59bf92e46dca2fd67f51d50cdd0dfcc55e5586cd/packages/react-dev-utils/WebpackDevServerUtils.js
 *
 */
const chalk = require( 'chalk' );
const inquirer = require( 'inquirer' );
const detect = require( 'detect-port-alt' );
const isRoot = require( 'is-root' );

const getProcessForPort = require( '../vendor/get-process-for-port' );

const DEFAULT_PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * choosePort method adapted from create-react-app's `react-dev-utils`.
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
 * Check if the preferred port is available, and ask the developer if an alternative
 * port should be used in the event that desired port is occupied.
 *
 * @param {Number} port The port number to check for availability.
 * @returns {Promise} A promise resolving to an available port, or rejecting null.
 */
module.exports = ( port = DEFAULT_PORT ) => choosePort( HOST, parseInt( port, 10 ) )
	.then( port => {
		if ( port !== null ) {
			return port;
		}
		// If the user declined to run on another port, we assume we cannot proceed.
		chalk.red( 'Terminating process.' );
	} );
