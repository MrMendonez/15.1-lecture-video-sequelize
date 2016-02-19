var express = require('express');
var mysql = require('mysql');
var expressHandlebars = require('express-handlebars');
var bodyParser = require('body-parser');

var connection = mysql.createConnection({
  port: 3306,
  host: 'localhost',
  user: 'root',
  database: 'rcb_authentication_db'
});

var PORT = process.env.NODE_ENV || 3000;

var app = express();

app.engine('handlebars', expressHandlebars({
  defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({
  extended: false
}));

// connection.connect();

app.get('/', function(req, res) {
  res.render('home');
});

app.post('/register', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  var checkQuery = "SELECT * FROM users WHERE email="+connection.escape(email);
  var insertQuery = "INSERT INTO users (email, password) VALUES (?, ?)";

  connection.query(checkQuery, function(err, results) {
    if(err) {
      throw err;
    }

    if(results.length > 0) {
      res.redirect('/?msg=Already exists');
    }
    else {
      connection.query(insertQuery, [email, password], function(err) {
        if(err) {
          throw err;
        }
        res.redirect('/success');
      });
    }
  })
});

app.post('/login', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  var checkQuery = "SELECT * FROM users WHERE email = ? AND password = ?";

  connection.query(checkQuery, [email, password], function(err, results) {
    if(err) {
      throw err;
    }

    if(results.length > 0) {
      res.redirect('/success');
    }
    else {
      res.redirect('/?msg=You failed at life');
    }
  })
}); // end app.post /login

app.get('/success', function(req, res) {
  res.send('You got it!');
});

app.listen(PORT, function() {
  console.log('Listening on %s ', PORT);
});