var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var hbs = require('express-handlebars');
var session = require('express-session');
var expressValidator = require('express-validator')
var passport = require('passport');
var flash = require('connect-flash');

var app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator())
app.use(express.static(path.join(__dirname, 'app')));

// Set up the session middleware
app.use(session({
    secret: 'justasehhjjkyffdcret',
    resave:true,
    saveUninitialized: true
   }));
   
// Set up the passport middleware and the flash
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);

// routes
require('./routes/routes.js')(app, passport);

module.exports = app;
