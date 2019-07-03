module.exports = ( api ) => {
	api.cache( true );

	return {
		presets: [ '@wordpress/default' ],
		plugins: [
			[ 'transform-react-jsx', {
				pragma: 'wp.element.createElement',
			} ],
		],
	};
};
