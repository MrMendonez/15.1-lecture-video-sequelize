var express = require('express');
var mysql = require('mysql');
var expressHandlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var Sequelize = require('sequelize');

var sequelize = new Sequelize('rcb_authentication_db', 'root');

var User = sequelize.define('User', {
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  password: Sequelize.STRING,
  firstname: Sequelize.STRING,
  lastname: Sequelize.STRING
});

var Person = sequelize.define('User', {
  firstname: Sequelize.STRING,
  lastname: Sequelize.STRING
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

app.get('/', function(req, res) {
  res.render('home', {
    msg: req.query.msg
  });
});

app.post('/register', function(req, res) {
  User.create(req.body).then(function(result) {
    req.session.authenticated = user;
    res.redirect('/success');
  }).catch(function(err) {
    res.redirect('/?msg=' + err.message)
  });
});

app.post('/login', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  User.findOne({
    where: {
      email: email,
      password: password
    }
  }).then(function(user) {
    if(user) {
      req.session.authenticated = user;
      res.redirect('/success');
    }
    else {
      res.redirect('/?msg=You failed at life');
    }
  }).catch(function(err) {
    throw err
  });
}); // end app.post /login

app.get('/success', function(req, res, next) {
  if(req.session.authenticated) {
    next();
  }
  else {
    res.redirect("/?msg=Must be authed");
  }
  res.send('Welcome ' + req.session.authenticated.firstname + ' ' + req.session.authenticated.lastname);
});

app.get('/persons', function(req, res) {
  Person.findAll().then(function(people) {
    res.render('person', {
      people: people
    })
  })
});

app.post('/persons', function(req, res) {
  Person.create(req.body).then(function() {
    res.redirect('/persons');
  });
});

sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log('Listening on %s ', PORT);
  });
});
