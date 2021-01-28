import { getResults } from './helpers';

import './style.scss';

( async () => {
	const results = await getResults();
	console.log( results );
} )();
