/**
 * Define properties which can be easily composed into a full config object.
 */
module.exports = {
	/**
	 * Define a basic set of devServer options to permit usage with WP.
	 * @type {Object}
	 */
	devServer: {
		allowedHosts: 'all',
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': '*',
			'Access-Control-Allow-Headers': '*',
		},
		// Enable gzip compression of generated files.
		compress: true,
		hot: 'only',
	},

	/**
	 * Define a minimalistic stats object to control build output.
	 * @type {Object}
	 */
	stats: {
		all: false,
		assets: true,
		colors: true,
		errors: true,
		performance: true,
		timings: true,
		warnings: true,
	},
};
