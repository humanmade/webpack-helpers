/**
 * Try to access a nested value within an object, and return null if not found.
 *
 * @param {Object} obj        The object to search for a nested path.
 * @param {String} objectPath dot.separated.nested.object.path string.
 * @returns {*} The value of the specified path, or null.
 */
module.exports = ( obj, objectPath ) => {
       const pathParts = objectPath.split( '.' );
       let currentLevel = obj;
       for ( let prop of pathParts ) {
               currentLevel = currentLevel[ prop ];
               if ( currentLevel === undefined ) {
                       return null;
               }
       }
       return currentLevel;
};
