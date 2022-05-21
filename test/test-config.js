const { presets, externals, helpers } = require( '../index' );

const { filePath } = helpers;

module.exports = [
	presets.production( {
		name: 'production-test',
		entry: {
			prod: filePath( 'test/src/index.js' ),
			// Expect this not to build.
			'linting-test': filePath( 'test/src/linting-test.js' ),
		},
		output: {
			path: filePath( 'test/build/prod' ),
		}
	} ),
	// This second build targets the same output directory as 'production-test'
	// to demonstrate whether the asset manifest is correctly shared between
	// the two different configs building to the same folder.
	presets.production( {
		name: 'production-test-2',
		externals,
		entry: {
			editor: filePath( 'test/src/index.js' ),
		},
		output: {
			path: filePath( 'test/build/prod' ),
		}
	} ),
	// This third build targets a different output directory than the others
	// to make sure that manifests are not shared _between_ directories.
	presets.production( {
		name: 'production-test-3',
		externals,
		entry: {
			'prod-alternate': filePath( 'test/src/index.js' ),
		},
		output: {
			path: filePath( 'test/build/prod-alternate' ),
		}
	} ),
	// This build uses a development configuration instead of a prod one.
	presets.development( {
		name: 'dev-test',
		entry: {
			prod: filePath( 'test/src/index.js' ),
			// Expect this to warn.
			'linting-test': filePath( 'test/src/linting-test.js' ),
		},
		output: {
			path: filePath( 'test/build/dev' ),
			publicPath: '/',
		},
	} ),
];
