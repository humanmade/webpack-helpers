const { choosePort } = require( 'react-dev-utils/WebpackDevServerUtils' );

const DEFAULT_PORT = parseInt( process.env.PORT, 10 ) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

module.exports = ( port = DEFAULT_PORT ) => choosePort( HOST, port );
