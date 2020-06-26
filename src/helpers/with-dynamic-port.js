/**
 * This module provides a wrapper function into which you can pass a fully-
 * formed webpack dev configuration instance in order to dynamically choose
 * and use an available port on your host system when using webpack-dev-server.
 */
const choosePort = require( './choose-port' );

const DEFAULT_PORT = 9090;

/**
 * Given the publicPath from a Webpack configuration's output settings, replace
 * the ":port" token with a valid port value if such a token is present, or
 * return the publicPath string as is.
 *
 * @param {String} publicPath User-specified public path string.
 * @param {Number} port       An HTTP port value.
 */
const derivePublicPath = ( publicPath, port ) => {
	const portPlaceholder = /:port|:<%= port %>|:%port%/i;
	if ( publicPath && portPlaceholder.test( publicPath ) ) {
		return publicPath.replace( portPlaceholder, `:${ port }` );
	}
	return publicPath;
};

/**
 *
 * @param {Number} [port] (Optional) Port to try first when looking for free port.
 * @param {Object} config Development Webpack configuration object.
 */
const withDynamicPort = ( port, config ) => {
	// Handle signature where config is passed without port.
	if ( ! config && typeof port === 'object' ) {
		return withDynamicPort( DEFAULT_PORT, port );
	}

	// Pass through configuration unchanged if webpack-dev-server is not in play.
	// argv[0] should be node itself; [1] will be the full system path to one of
	// "webpack" or "webpack-dev-server".
	if ( process.argv[ 1 ].indexOf( 'webpack-dev-server' ) === -1 ) {
		return config;
	}

	// Build the regex to replace :port or :XXXX, where XXXX is the provided port
	// number, with the final selected port.
	const portPlaceholder = new RegExp( `:(?:port|${ port })`, 'i' );

	/**
	 * Given the publicPath from a Webpack configuration's output settings, replace
	 * the ":port" token with a valid port value if such a token is present, of
	 * else return the publicPath string as-is.
	 *
	 * @param {String} publicPath User-specified public path string.
	 * @param {Number} port       An HTTP port value.
	 */
	const getPublicPath = ( publicPath, port ) => {
		if ( publicPath && portPlaceholder.test( publicPath ) ) {
			return publicPath.replace( portPlaceholder, `:${ port }` );
		}
	};

	// Return config wrapped in a function that will choose an available port
	// and modify the provided config to operate on that port.
	return choosePort( port || DEFAULT_PORT ).then( port => ( {
		...config,
		devServer: {
			...( config.devServer || {} ),
			port,
		},
		output: {
			...( config.output || {} ),
			publicPath: getPublicPath( config.output.publicPath, port ),
		},
	} ) );
};

module.exports = withDynamicPort;
