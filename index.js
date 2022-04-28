/**
 * Expose public package API.
 */
module.exports = {
	/* eslint-disable global-require */
	config: require( './src/config' ),
	externals: require( './src/externals' ),
	helpers: {
		addFilter: require( './src/helpers/filters' ).addFilter,
		choosePort: require( './src/helpers/choose-port' ),
		cleanOnExit: require( './src/helpers/clean-on-exit' ),
		filePath: require( './src/helpers/file-path' ),
		findInObject: require( './src/helpers/find-in-object' ),
		withDynamicPort: require( './src/helpers/with-dynamic-port' ),
	},
	loaders: require( './src/loaders' ),
	plugins: require( './src/plugins' ),
	presets: require( './src/presets' ),
};
