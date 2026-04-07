/**
 * Expose public package API.
 */
const config = require( './src/config' );
const externals = require( './src/externals' );
const choosePort = require( './src/helpers/choose-port' );
const cleanOnExit = require( './src/helpers/clean-on-exit' );
const filePath = require( './src/helpers/file-path' );
const findInObject = require( './src/helpers/find-in-object' );
const withDynamicPort = require( './src/helpers/with-dynamic-port' );
const loaders = require( './src/loaders' );
const plugins = require( './src/plugins' );
const presets = require( './src/presets' );

module.exports = {
	config,
	externals,
	helpers: {
		choosePort,
		cleanOnExit,
		filePath,
		findInObject,
		withDynamicPort,
	},
	loaders,
	plugins,
	presets,
};
