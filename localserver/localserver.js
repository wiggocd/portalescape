// Import modules
var nodeStatic 	= require( 'node-static' );		// Used for serving static files
var http		= require( 'http' );			// Default node http server
var port		= 8080;							// NOTE: this is the same port as specified in launch.json

// Create file server config
var file = new nodeStatic.Server( './game/', {	// Anything in this folder is served
	cache:0,									// No cache (only for testing)
	gzip:true									// Gzip assets
});

// Create server
http.createServer( function( request, response ) {
	request.addListener( 'end', function() {
		file.serve( request, response ); 		// Serve all files on server, all files accessible by URL
	}).resume();
}).listen( port );