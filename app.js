var express = require('express');
var app = express();
//var cfenv = require('cfenv');
var pg = require('pg');
pg.connect('postgres://droidpantelas:openteach456gto@openteach.c16qq5m1cpxq.eu-west-1.rds.amazonaws.com/openteach', function(err, client, done) {
  client.query('CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, username VARCHAR NOT NULL UNIQUE, email VARCHAR NOT NULL UNIQUE, password VARCHAR NOT NULL, firstname VARCHAR NOT NULL, lastname VARCHAR NOT NULL);' +
    'CREATE TABLE IF NOT EXISTS skills(id SERIAL PRIMARY KEY, name VARCHAR NOT NULL UNIQUE);' +
    'CREATE TABLE IF NOT EXISTS userskills(id SERIAL, userid INT NOT NULL, skillid INT NOT NULL);',
  function(err, result) {
    done();
  })
});

app.use(express.static(__dirname + '/public'));
///SERVER DISPLAY STUFF
// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
    res.render('pages/index');
});

// about page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

//var appEnv = cfenv.getAppEnv();

var server_port = process.env.VCAP_APP_PORT || 8000;
var server_host = process.env.VCAP_APP_HOST || "localhost";

// start server on the specified port and binding host
app.listen(server_port, server_host, function() {

	// print a message when the server starts listening
  //console.log("server starting on " + server_port);
});
