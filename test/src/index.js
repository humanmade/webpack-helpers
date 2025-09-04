import './style.scss';

import { getResults } from './helpers';

// Intentional ESLint errors for testing
var unused_variable = "test";  // no-var, no-unused-vars, quotes

( async () => {
	const results = await getResults();
	console.log( results );
} )();
