export const wait = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) );

export const getResults = async () => {
	await wait( 500 );
	return 'Results';
};

export const lintingErrorsInProdButWarnsInDev = () => {
	console.log( 'Very contrived example to hopefuly make test-build output clearer' );
};
