var restify = require('restify'),
    packageJson = require('./package'),
    chalk = require('chalk'),
    serveStatic = require('serve-static-restify'),
    path = require( 'path' );

// creating server with restify
var app = restify.createServer({
    name: packageJson.name,
    version: packageJson.version
});
var port = 9000;


// Parses out the Accept header and if the req is for a non-handled type, this will return an error of 406.
app.use(restify.acceptParser(app.acceptable));

// Parses the HTTP query string and will be available in req.query and params are merged into req.params.
app.use(restify.queryParser());

// sets up all of the default headers for the system
app.use(restify.fullResponse());

// Blocks your chain on reading and parsing the HTTP request body.
app.use(restify.bodyParser());

app.get(/.*/, restify.serveStatic({
    'directory':  __dirname,
    'default': 'index.html'
}));

// Start the app by listening on <port>
app.listen(port, function () {
    console.log('--');
    console.log(chalk.green('Application listening on port number', port));

});

