//jshint esversion:6
const express = require("express");
const app = express();
app.use(express.static("public"));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

const ejs = require("ejs");
app.set("view engine", "ejs");

const mongoose = require("mongoose");
const encrypt=require("mongoose-encryption");
mongoose.connect("mongodb://localhost:27017/usersDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const usersSchema = new mongoose.Schema({
  email: String,
  password: String
});
 const secret="Armagedoniscoming";

 usersSchema.plugin(encrypt,{secret:secret,encryptedFields: ["password"]});

const User = mongoose.model("User", usersSchema);

app.route("/register")
  .get(function(req, res) {
    res.render("register");
  })
  .post(function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const newUser = new User({
      email: username,
      password: password
    });
    newUser.save(function(err) {
      if (!err) {
        res.render("secrets");
      } else {
        res.send(err);
      }
    });
  });

app.get("/", function(req, res) {
  res.render("home");
})

app.route("/login")

  .get(function(req, res) {
    res.render("login");
  })

  .post(function (req,res) {
    const username = req.body.username;
    User.findOne({
      email:username
    }, function(err, foundUser) {
      if (!err) {
        if (foundUser) {
          if (foundUser.email === username) {
            res.render("secrets");
          }
        }
      }
    })
  });

app.listen(3000, function(req, res) {
  console.log("Server started to port 3000");
})
