/**
 * Given a kebab-case string, returns a new camelCase string.
 *
 * @param {string} string Input kebab-case string.
 * @return {string} Camel-cased string.
 */
module.exports = string => string.replace(
	/-([a-z])/g,
	( match, letter ) => letter.toUpperCase()
);
