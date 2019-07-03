module.exports = ( api ) => {
	api.cache.forever();

	return {
		presets: [ '@wordpress/default' ],
		plugins: [
			[ 'transform-react-jsx', {
				pragma: 'wp.element.createElement',
			} ],
		],
	};
};
