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

pg.connect('postgres://droidpantelas:openteach@openteach.c16qq5m1cpxq.eu-west-1.rds.amazonaws.com/openteach', function(err, client, done) {
  client.query('CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, username VARCHAR NOT NULL UNIQUE, email VARCHAR NOT NULL UNIQUE, password VARCHAR NOT NULL, firstname VARCHAR NOT NULL, lastname VARCHAR NOT NULL, lat DECIMAL, lng DECIMAL, bio VARCHAR, organization VARCHAR);' +
    'CREATE TABLE IF NOT EXISTS skills(id SERIAL PRIMARY KEY, name VARCHAR NOT NULL UNIQUE);' +
    'CREATE TABLE IF NOT EXISTS userskills(id SERIAL, userid INT NOT NULL, skillid INT NOT NULL);',
  function(err, result) {
    done();
  });

  passport.serializeUser(function(user, cb) {
    cb(null, user.id);
    done();
  });

  passport.deserializeUser(function(id, cb) {
    client.query('SELECT * FROM users WHERE id = $1', [id], function(err, result) {
      cb(err, result.rows[0]);
      done();
    })
  });

  passport.use('login', new LocalStrategy(
    function(username, password, cb) {
      client.query('SELECT * FROM users WHERE password is NOT NULL AND password = crypt($1, password) AND username = $2', [password, username], function(err, result) {
        if(result.rows.length > 0) {
          cb(null, result.rows[0]);
        } else {
          cb(null, false, { message: 'Incorrect username/password.' });
        }

        done();
      });
    }
  ));

  passport.use('register', new LocalStrategy({ passReqToCallback: true },
      function(req, username, password, cb) {
        console.log(req.body.lastname);
        client.query('INSERT INTO users(username, email, password, firstname, lastname, lat, lng) VALUES ($1, $2, crypt($3, gen_salt(\'bf\')), $4, $5, $6::DECIMAL, $7::DECIMAL)', [username, req.body.email, password, req.body.firstname, req.body.lastname, req.body.lat, req.body.lng], function(err, result) {
          if(!err) {
            console.log('success');
            client.query('SELECT * FROM users WHERE username = $1', [username], function(err, result) {
              console.log(result.rows[0]);
              cb(null, result.rows[0]);
            });
          } else {
            console.log(err);
            cb(null, false, { message: 'Error making user.' });
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
    res.render('pages/login')
  });

  app.post('/login', passport.authenticate('login', { successRedirect: '/', failureRedirect: '/login' }));

  app.get('/register', function(req, res) {
    res.render('pages/register')
  });

  app.post('/register', passport.authenticate('register', { successRedirect: '/', failureRedirect: '/register' }));

  app.post('/points', function(req, res) {
    client.query('SELECT * FROM users WHERE lat >= $1::decimal AND lat <= $2::decimal AND lng >= $3::decimal AND lng <= $4::decimal', [req.body.latmin, req.body.latmax, req.body.lngmin, req.body.lngmax], function(err, result) {
      res.json(result.rows);
      done();
    });
  });

  // index page
  app.get('/', function(req, res) {
      res.render('pages/index');
  });

  app.get('/profile/pandelis', function(req, res) {
      res.render('pages/pandelis');
  });

  app.get('/profile/sprusr', function(req, res) {
      res.render('pages/sprusr');
  });
  // about page
  app.get('/about', function(req, res) {
      res.render('pages/about');
  });

  // skills page
  app.get('/skills', isAuthenticated, function(req, res) {
      res.render('pages/skills');
  });
  //var appEnv = cfenv.getAppEnv();
});
  var server_port = process.env.VCAP_APP_PORT || 8000;
  var server_host = process.env.VCAP_APP_HOST || "localhost";

  // start server on the specified port and binding host

  app.listen(server_port, server_host, function() {
  	// print a message when the server starts listening
    //console.log("server starting on " + server_port);
  });
