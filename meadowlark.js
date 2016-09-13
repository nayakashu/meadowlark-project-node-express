// Get dependencies
var express = require('express');

// ./ This signals to Node that it should not look for the module in the node_modules directory
var fortune = require('./lib/fortune.js');

// Define express
var app = express();

// Set up handlebars view engine
var handlebars = require('express3-handlebars').create({ 
	defaultLayout: 'main',
	helpers: {
		section: function(name, options) {
			if(!this._sections) {
				this._sections = {};
			}
			
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('view cache', true);

// Set the app port for the server
app.set('port', process.env.PORT || 3000);

// Set up middleware to detect test=1 in querystring to activate mocha tests in the pages
app.use(function (request, response, next) {
	// response.locals object is part of the 'context' that will be passed to all the views
	response.locals.showTests = app.get('env') !== 'production' && request.query.test === '1';
	next();
});

// Set up static middleware to serve client side things like images, CSS, client side JavaScript files
app.use(express.static(__dirname + '/public'));

// function to populate dummy weather data for weather partial
function getWeatherData() {
	return {
		locations: [
			{
				name: 'Portland',
				forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
				weather: 'Overcast',
				temp: '54.1 F (12.3 C)',
			},
			{
				name: 'Bend',
				forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
				weather: 'Partly Cloudy',
				temp: '55.0 F (12.8 C)',
			},
			{
				name: 'Manzanita',
				forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
				weather: 'Light Rain',
				temp: '55.0 F (12.8 C)',
			}
		]
	};
}

// Setup middleware to inject the weather data into the res.locals.partials object
app.use(function (request, response, next) {
	if(!response.locals.partials) {
		response.locals.partials = {};
	}

	response.locals.partials.weather = getWeatherData();
	next();
});

// Routes
// Express defaults to a status code of 200 - if not specified

// Default - home
app.get('/', function (request, response) {
	// render view 'home'
	response.render('home');
});

// About Page
app.get('/about', function (request, response) {
	response.render('about', { 
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
});

// jQuery Test Page - Learning Sections
app.get('/jquery-test', function (request, response) {
	response.render('jquery-test');
});

// Routes for Cross-Page testing - requires zombie - right now not installing in Windows
app.get('/tours/hood-river', function (request, response) {
	response.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function (request, response) {
	response.render('tours/request-group-rate');
});
/////////////////////////////////////////////////////////////////////////////////////////

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