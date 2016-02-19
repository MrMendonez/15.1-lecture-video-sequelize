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
  var email = req.body.email;
  var password = req.body.password;

  User.create(req.body).then(function(result) {
    console.log(user.value);
    req.session.authenticated = user.value;
    res.redirect('/success');
  }).catch(function(err) {
    res.redirect('/?msg=' + err.message)
  });

  // var checkQuery = "SELECT * FROM users WHERE email="+connection.escape(email);
  // var insertQuery = "INSERT INTO users (email, password) VALUES (?, ?)";

  // connection.query(checkQuery, function(err, results) {
  //   if(err) {
  //     throw err;
  //   }

  //   if(results.length > 0) {
  //     res.redirect('/?msg=Already exists');
  //   }
  //   else {
  //     connection.query(insertQuery, [email, password], function(err) {
  //       if(err) {
  //         throw err;
  //       }
  //       req.session.authenticated = true;
  //       res.redirect('/success');
  //     });
  //   }
  // })
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
    console.log(user);
    if(user) {
      req.session.authenticated = true;
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
  if(req.session.authenticated === true) {
    next();
  }
  else {
    res.redirect("/?msg=Must be authed");
  }
  res.send('You got it!');
});

sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log('Listening on %s ', PORT);
  });
});
