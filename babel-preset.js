module.exports = {
	presets: [ '@wordpress/default' ],
	plugins: [
		[ 'transform-react-jsx', {
			pragma: 'wp.element.createElement',
		} ],
	],
};
