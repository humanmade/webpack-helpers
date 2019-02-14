/**
 * Define properties which can be easily composed into a full config object.
 */
module.exports = {
	/**
	 * Define a basic set of devServer options to permit usage with WP.
	 * @prop {Object} devServer
	 */
	devServer: {
		disableHostCheck: true,
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		hotOnly: true,
		watchOptions: {
			aggregateTimeout: 300,
		},
	},

	/**
	 * Define a minimalistic stats object to control build output.
	 * @prop {Object} stats
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
