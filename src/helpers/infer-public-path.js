const filePath = require( './file-path' );
const findInObject = require( './find-in-object' );

/**
 * Dictionary of generated publicPath strings by file system path.
 *
 * @type {Object.<string, string>}
 */
const publicPaths = {};

/**
 * Return a consistent publicPath per output directory path.
 *
 * Only used when automatically generating public paths.
 *
 * @param {String} path Output directory path
 * @returns {string} Shared publicPath string.
 */
const getPublicPathForDirectory = ( path ) => {
	return publicPaths[ path ];
};

/**
 * Infer the public path based on the defined output path.
 *
 * @param {webpack.Configuration} config     Webpack configuration object.
 * @param {Number}                port       Port to use for webpack-dev-server.
 * @param {Object}                [defaults] Optional config default values.
 * @returns {String} Public path.
 */
const inferPublicPath = ( config, port, defaults = {} ) => {
	const protocol = ( findInObject( config, 'devServer.https' ) || findInObject( config, 'devServer.server' ) === 'https' ) ? 'https' : 'http';

	const outputPath = findInObject( config, 'output.path' ) || findInObject( defaults, 'output.path' );

	// Get the relative path to output.path, without a preceding
	// slash but including a trailing slash.
	const relPath = outputPath
		.replace( filePath(), '' )
		.replace( /^\/*/, '' )
		.replace( /\/*$/, '/' );

	const publicPath = `${ protocol }://localhost:${ port }/${ relPath }`;

	publicPaths[ outputPath ] = publicPath;
	return publicPath;
};

module.exports = {
	inferPublicPath,
	getPublicPathForDirectory,
};

if ( process.env.JEST_WORKER_ID ) {
	// Exposed only for testing purposes.
	module.exports.resetPublicPathsCache = () => {
		Object.keys( publicPaths ).forEach( ( key ) => {
			Reflect.deleteProperty( publicPaths, key );
		} );
	};
}
