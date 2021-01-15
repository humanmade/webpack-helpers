export const wait = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) );

export const getResults = async () => {
	await wait( 500 );
	return 'Results';
};
