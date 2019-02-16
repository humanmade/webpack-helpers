/**
 * Expose public package API.
 */
module.exports = {
	/* eslint-disable global-require */
	config: require( './src/config' ),
	externals: require( './src/externals' ),
	helpers: {
		choosePort: require( './src/helpers/choose-port' ),
		choosePorts: require( './src/helpers/choose-ports' ),
		cleanOnExit: require( './src/helpers/clean-on-exit' ),
		filePath: require( './src/helpers/file-path' ),
		findInObject: require( './src/helpers/find-in-object' ),
	},
	loaders: require( './src/loaders' ),
	plugins: require( './src/plugins' ),
	presets: require( './src/presets' ),
};
