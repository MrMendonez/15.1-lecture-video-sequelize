var express = require('express');
var mysql = require('mysql');
var expressHandlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');

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

app.use(session({
  secret: "elm i 4389rfhifhads",
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 14 // 1000ms (or 1 sec) * 60 sec * 60 min * 24 hrs * 14 days = 2 weeks in milliseconds 
  },
  saveUnitialized: true,
  resave: false
}));

connection.connect();

app.get('/', function(req, res) {
  res.render('home', {
    msg: req.query.msg
  });
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
        req.session.authenticated = true;
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
      req.session.authenticated = true;
      res.redirect('/success');
    }
    else {
      res.redirect('/?msg=You failed at life');
    }
  })
}); // end app.post /login

app.get('/success', function(req, res, next) {
  if(req.session.authenticated === true) {
    next();
  }
  else {
    res.redirect("/?msg=Must be authed");
  }
  res.send('You got it!');
});

app.listen(PORT, function() {
  console.log('Listening on %s ', PORT);
});