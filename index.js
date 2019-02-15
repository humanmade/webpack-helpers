/**
 * Expose public package API.
 */
module.exports = {
	/* eslint-disable global-require */
	config: require( './lib/config' ),
	externals: require( './lib/externals' ),
	helpers: {
		choosePort: require( './lib/helpers/choose-port' ),
		cleanOnExit: require( './lib/helpers/clean-on-exit' ),
		filePath: require( './lib/helpers/file-path' ),
		findInObject: require( './lib/helpers/find-in-object' ),
	},
	loaders: require( './lib/loaders' ),
	manifest: require( './lib/manifest' ),
	plugins: require( './lib/plugins' ),
	presets: require( './lib/presets' ),
};
