var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('working');
});

app.listen(8000, function() {
  console.log('listening');
});
