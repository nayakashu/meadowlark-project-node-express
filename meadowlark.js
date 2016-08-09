// Get dependencies
var express = require('express');

// ./ This signals to Node that it should not look for the module in the node_modules directory
var fortune = require('./lib/fortune.js');

// Define express
var app = express();

// Set up handlebars view engine
var handlebars = require('express3-handlebars').create({ defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Set the app port for the server
app.set('port', process.env.PORT || 3000);

// Set up static middleware to serve client side things like images, CSS, client side JavaScript files
app.use(express.static(__dirname + '/public'));

// Routes
// Express defaults to a status code of 200 - if not specified
app.get('/', function (request, response) {
	// render view 'home'
	response.render('home');
});

app.get('/about', function (request, response) {
	response.render('about', { fortune: fortune.getFortune() });
});

// Express can distinguish between the 404 and 500 handlers by the 
// number of arguments their callback functions take.

// 404 catch-all handler (middleware)
app.use(function (request, response) {
	response.status(404);
	response.render('404');
});

// 500 error handler (middleware)
app.use(function (error, request, response, next) {
	console.error(error.stack);
	response.status(500);
	response.render('500');
});

app.listen(app.get('port'), function () {
	console.log( 'Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.' );
});