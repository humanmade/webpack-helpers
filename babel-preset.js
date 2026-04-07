module.exports = ( api ) => {
	api.cache.forever();

	return {
		presets: [ '@wordpress/babel-preset-default' ],
		plugins: [
			'@babel/plugin-proposal-class-properties',
			[ '@babel/plugin-transform-react-jsx', {
				pragma: 'wp.element.createElement',
			} ],
		],
	};
};
