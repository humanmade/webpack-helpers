const { presets, helpers } = require( '../index' );

const { filePath } = helpers;

module.exports = [
	presets.production( {
		name: 'production-test',
		entry: {
			prod: filePath( 'test/src/index.js' ),
		},
		output: {
			path: filePath( 'test/build/prod' ),
		}
	} ),
	presets.development( {
		name: 'dev-test',
		entry: {
			prod: filePath( 'test/src/index.js' ),
		},
		output: {
			path: filePath( 'test/build/dev' ),
			publicPath: '/',
		},
	} ),
];
