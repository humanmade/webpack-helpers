/**
 * Expose public package API.
 */
module.exports = {
	/* eslint-disable global-require */
	config: require( './lib/config' ),
	externals: require( './lib/externals' ),
	helpers: require( './lib/helpers' ),
	loaders: require( './lib/loaders' ),
	manifest: require( './lib/manifest' ),
	plugins: require( './lib/plugins' ),
	presets: require( './lib/presets' ),
};
