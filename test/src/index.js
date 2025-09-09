import './style.scss';

import { getResults } from './helpers';

( async () => {
	const results = await getResults();
	console.log( results );
} )();
