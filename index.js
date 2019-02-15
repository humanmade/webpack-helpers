/**
 * Expose public package API.
 */
module.exports = {
	/* eslint-disable global-require */
	config: require( './src/config' ),
	externals: require( './src/externals' ),
	helpers: {
		choosePort: require( './src/helpers/choose-port' ),
		cleanOnExit: require( './src/helpers/clean-on-exit' ),
		filePath: require( './src/helpers/file-path' ),
		findInObject: require( './src/helpers/find-in-object' ),
	},
	loaders: require( './src/loaders' ),
	manifest: require( './src/manifest' ),
	plugins: require( './src/plugins' ),
	presets: require( './src/presets' ),
};
