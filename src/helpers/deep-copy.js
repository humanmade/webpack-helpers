/**
 * Create a deep copy of an object, so that arrays and objects do not share
 * references between equivalent properties on the two objects. We cannot
 * use JSON.parse(JSON.stringify()) in case the object contains methods.
 *
 * @param {Object} obj An object to clone.
 */
const deepCopy = ( obj ) => {
	// Return non-object values & regexes directly.
	if ( typeof obj !== 'object' || obj instanceof RegExp ) {
		return obj;
	}

	// For arrays, recursively process array member items into a new array.
	if ( Array.isArray( obj ) ) {
		return obj.map( deepCopy );
	}

	// For objects, recursively process object properties.
	return Object.keys( obj ).reduce(
		( newObj, key ) => {
			newObj[ key ] = deepCopy( obj[ key ] );
			return newObj;
		},
		{}
	);
};

module.exports = deepCopy;
