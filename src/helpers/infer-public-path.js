const filePath = require( './file-path' );
const findInObject = require( './find-in-object' );

/**
 * Infer the public path based on the defined output path.
 *
 * @param {webpack.Configuration} config     Webpack configuration object.
 * @param {Number}                port       Port to use for webpack-dev-server.
 * @param {Object}                [defaults] Optional config default values.
 * @return {String} Public path.
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

	return `${ protocol }://localhost:${ port }/${ relPath }`;
};

module.exports = inferPublicPath;
