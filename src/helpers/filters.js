const registry = {};

/**
 * Internal helper to return an ordered array of callbacks for a given priority.
 *
 * @private
 * @param {string} hookName A hook name for which to return filters.
 * @returns {Function[]} Array of filter functions.
 */
const getCallbacks = ( hookName ) => {
	const priorities = Object.values( registry[ hookName ] || {} )
		// eslint-disable-next-line id-length
		.sort( ( a, b ) => ( +a < +b ? -1 : 1 ) );
	return priorities.reduce(
		( callbacks, priority ) => {
			return callbacks.concat( priority || [] );
		},
		[]
	);
};

/**
 * Internal helper to set the registry to a specific state for testing.
 *
 * @private
 * @param {Object} values New registry shape.
 */
const setupRegistry = ( values = {} ) => {
	Object.keys( registry ).forEach( ( existingKey ) => {
		Reflect.deleteProperty( registry, existingKey );
	} );

	Object.keys( values ).forEach( ( newKey ) => {
		registry[ newKey ] = values[ newKey ];
	} );
};

/**
 * Register a filter function for a given filter hook name.
 *
 * @param {string}   hookName   Name of hook to add a filter on.
 * @param {Function} callback   Callback to run on this hook.
 * @param {Number}   [priority] Optional numeric priority, default 10.
 */
const addFilter = ( hookName, callback, priority = 10 ) => {
	if ( ! registry[ hookName ] ) {
		registry[ hookName ] = {};
	}
	if ( ! Array.isArray( registry[ hookName ][ priority ] ) ) {
		registry[ hookName ][ priority ] = [];
	}
	registry[ hookName ][ priority ].push( callback );
};

/**
 * Remove a previously-added filter function for a given hook name.
 *
 * To remove a hook, the callback and priority arguments must match when the hook was added.
 *
 * @param {string}   hookName   Name of hook to add a filter on.
 * @param {Function} callback   Callback to run on this hook.
 * @param {Number}   [priority] Priority from which to remove the hook.
 */
const removeFilter = ( hookName, callback, priority = 10 ) => {
	if ( ! registry[ hookName ] || ! registry[ hookName ][ priority ] ) {
		// Not added, no action needed.
		return;
	}
	registry[ hookName ][ priority ] = registry[ hookName ][ priority ]
		.filter( ( hook ) => hook !== callback );
};

/**
 * Run input arguments through all registered callbacks for a specified filter,
 * allowing each filter to transform the first argument.
 *
 * @param {string} hookName Name of hook to filter on.
 * @param {...any} args     Filter input arguments.
 * @returns {any} Output of filter chain.
 */
const applyFilters = ( hookName, ...args ) => {
	const callbacks = getCallbacks( hookName );

	const [ firstArg, ...otherArgs ] = args;

	return callbacks.reduce(
		( val, callback ) => callback( val, ...otherArgs ),
		firstArg,
	);
};

module.exports = {
	addFilter,
	removeFilter,
	applyFilters,
};

if ( process.env.JEST_WORKER_ID ) {
	// Exposed only for testing purposes.
	module.exports.getCallbacks = getCallbacks;
	module.exports.setupRegistry = setupRegistry;
}
