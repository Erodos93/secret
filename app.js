//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");

const saltRounds = 10;


app.use(express.static("public"));


const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/usersDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const usersSchema = new mongoose.Schema({
  email: String,
  password: String
});


// usersSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ["password"]});

const User = mongoose.model("User", usersSchema);

app.route("/register")
  .get(function(req, res) {
    res.render("register");
  })
  .post(function(req, res) {

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

      const newUser = new User({
        email: req.body.username,
        password: hash
      });
      newUser.save(function(err) {
        if (!err) {
          res.render("secrets");
        } else {
          res.send(err);
        }
      });
    });

  });

app.get("/", function(req, res) {
  res.render("home");
})

app.route("/login")

  .get(function(req, res) {
    res.render("login");
  })

  .post(function(req, res) {
    const username = req.body.username;
    User.findOne({
      email: username
    }, function(err, foundUser) {
      if (!err) {
        if (foundUser) {
          bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
            if (result === true) {
              res.render("secrets");
            }
            // result == true
          });

        }
      }
    })
  });

app.listen(3000, function(req, res) {
  console.log("Server started to port 3000");
})
