var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var env = require('node-env-file');

var app = express();  
// call socket.io to the app
app.io = require('socket.io')();

// if in development mode, load .env variables
if (app.get("env") === "development") {
    env(__dirname + '/.env');
}

// TWITTER SETUP //
// You must create an app as a developer here: https://apps.twitter.com/
var Twitter = require('twitter');
 
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// connect to database
app.db = mongoose.connect(process.env.MONGODB_URI);

// view engine setup - this app uses Hogan-Express
// https://github.com/vol4ok/hogan-express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('layout','layout');
app.engine('html', require('hogan-express'));;

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// for this app, we are going to use routes in app.js instead of index.js
// simple home route produces form
app.get('/', function(req, res) {
  res.render('index.html')
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


// start listen with socket.io
app.io.on('connection', function(socket){  
  console.log('a user connected  --> ' + socket.id);

  // add any socket events here
  socket.on('new twitter search', function(searchTerm){
    console.log('new searchTerm: ' + searchTerm);
    // set up a new streaming search
    var stream = client.stream('statuses/filter', {track: searchTerm});
    stream.on('data', function(event) {
      // when there is new data, log it out; the tweet will be in event.text
      console.log('NEW DATA!');
      console.log(event && event.text);

      // now emit the new tweet back to the client via the socket event 'new tweet'
      app.io.emit('new tweet', event.text);  
    });    
  });
});


module.exports = app;
