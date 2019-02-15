/**
 * Test whether a given value is an array.
 *
 * @param {*} val A value to test for array-ness.
 * @returns {Boolean} Whether the provided argument is an array.
 */
const isArr = val => Array.isArray( val );

/**
 * Test whether a given value is an object.
 *
 * @param {*} val A value to test for object-ness.
 * @returns {Boolean} Whether the provided argument is an object.
 */
const isObj = val => ( typeof val === 'object' );

/**
 * Given two objects, merge array and object properties, then allow scalar
 * properties from the second object to override those from the first.
 *
 * Note: This implementation is more simplistic than the merge utilities
 * in libraries like lodash, but sufficient to this package's purpose.
 *
 * @param {Object} obj1 An object.
 * @param {Object} obj2 A second object to merge with the first.
 * @returns {Object} A deeply merged object.
 */
const deepMerge = ( obj1 = {}, obj2 = {} ) => {
	return Object.keys( obj2 ).reduce( ( merged, key ) => {
		// If the properties on both objects are arrays, merge the arrays.
		if ( isArr( obj1[ key ] ) && isArr( obj2[ key ] ) ) {
			return {
				...merged,
				[ key ]: [ ...obj1, ...obj2 ],
			};
		}

		// If the properties on both objects are objects, merge recursively.
		if ( isObj( obj1[ key ] ) && isObj( obj2[ key ] ) ) {
			return {
				...merged,
				[ key ]: deepMerge( obj1[ key ], obj2[ key ] ),
			};
		}

		// Default / fall-through behavior: the value from obj2 wins.
		return {
			...merged,
			[ key ]: obj2[ key ],
		};
	}, {
		// Start the reducer with a shallow clone of obj1.
		...obj1,
	} );
};

module.exports = deepMerge;
