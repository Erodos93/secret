//jshint esversion:6
// require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const saltRounds = 10;


const app = express();
app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our litle secret.",
  resave: false,
  saveUninitialized: true,

}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/usersDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);
const usersSchema = new mongoose.Schema({
  email: String,
  password: String
});


usersSchema.plugin(passportLocalMongoose);

// usersSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ["password"]});

const User = new mongoose.model("User", usersSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/logout",function (req,res) {
  req.logout();
  res.redirect('/');
});
app.get("/secret", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
})
app.route("/register")
  .get(function(req, res) {
    res.render("register");
  })
  .post(function(req, res) {
    User.register({
      username: req.body.username,
      active: false
    }, req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req,res,function () {
            res.redirect("/secret");
        });

      }
    })


  });

app.get("/", function(req, res) {
  res.render("home");
})

app.route("/login")

  .get(function(req, res) {
    res.render("login");
  })

  .post(function(req, res) {
    const user=new User({
      username:req.body.username,
      password:req.body.password
    });
req.login(user,function (err) {
  if (err) {
    console.log(err);
    // res.redirect("/login");
  }else {
    passport.authenticate("local")(req,res,function () {
        res.redirect("/secret");
    });

  }
})
  });

app.listen(3000, function(req, res) {
  console.log("Server started to port 3000");
})
