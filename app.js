var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var pg = require('pg');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'thegame',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));
///SERVER DISPLAY STUFF
// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

pg.connect('postgres://localhost/openteach', function(err, client, done) {
  client.query('CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, username VARCHAR NOT NULL UNIQUE, email VARCHAR NOT NULL UNIQUE, password VARCHAR NOT NULL, firstname VARCHAR NOT NULL, lastname VARCHAR NOT NULL, lat DECIMAL, lng DECIMAL);' +
    'CREATE TABLE IF NOT EXISTS skills(id SERIAL PRIMARY KEY, name VARCHAR NOT NULL UNIQUE);' +
    'CREATE TABLE IF NOT EXISTS userskills(id SERIAL, userid INT NOT NULL, skillid INT NOT NULL);',
  function(err, result) {
    done();
  });

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    client.query('SELECT * FROM users WHERE id = $1', [id], function(err, result) {
      done(err, result.rows[0]);
    })
  });

  passport.use('login', new LocalStrategy(
    function(username, password, cb) {
      client.query('SELECT * FROM users WHERE password is NOT NULL AND password = crypt($1, password) AND username = $2', [password, username], function(err, result) {
        if(result.rows.length > 0) {
          return cb(null, result.rows[0]);
        } else {
          return cb(null, false, { message: 'Incorrect username/password.' });
        }

        done();
      });
    }
  ));

  var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/login');
  }

  app.get('/login', function(req, res) {
    //
  });

  app.post('/login', passport.authenticate('login', { successRedirect: '/', failureRedirect: '/login', failureFlash: true }));

  app.post('/points', isAuthenticated, function(req, res) {
    client.query('SELECT * FROM users WHERE lat >= $1::decimal AND lat <= $2::decimal AND lng >= $3::decimal AND lng <= $4::decimal', [req.params.latmin, req.params.latmax, req.params.lngmin, req.params.lngmax], function(err, result) {
      res.json(result.rows);
      done();
    });
  });

  // index page
  app.get('/', function(req, res) {
      res.render('pages/index');
  });

  // about page
  app.get('/about', function(req, res) {
      res.render('pages/about');
  });

  app.listen(8000, function() {
    console.log('listening');
  });
});
