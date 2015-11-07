var express = require('express');
var app = express();

var pg = require('pg');

pg.connect('postgres://localhost/openteach', function(err, client, done) {
  client.query('CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, username VARCHAR NOT NULL UNIQUE, email VARCHAR NOT NULL UNIQUE, password VARCHAR NOT NULL, firstname VARCHAR NOT NULL, lastname VARCHAR NOT NULL);' +
    'CREATE TABLE IF NOT EXISTS skills(id SERIAL PRIMARY KEY, name VARCHAR NOT NULL UNIQUE);' +
    'CREATE TABLE IF NOT EXISTS userskills(id SERIAL, userid INT NOT NULL, skillid INT NOT NULL);',
  function(err, result) {
    done();
  })
});

app.get('/', function(req, res) {
  res.send('working');
});

app.listen(8000, function() {
  console.log('listening');
});
