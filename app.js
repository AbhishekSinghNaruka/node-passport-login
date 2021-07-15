//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const flash = require('connect-flash');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{
  useNewUrlParser:true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema ({
  email: {
  type: String,
  required: true,
  unique: true
},
  password: String
});

userSchema.plugin(passportLocalMongoose,{usernameField:'email'});

const User = mongoose.model('User',userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/",function(req,res){
  res.render("login");
});

app.get("/login",function(req,res){
  res.render("login");
});

/*app.post("/login",function(req,res){

  const user = new User({
    email: req.body.email,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err)
      console.log("error: "+err);
    else
      {
        passport.authenticate('local',{
          successRedirect: '/secrets',
          failureRedirect: '/login' });
      }
  });
});*/

app.post("/login", passport.authenticate("local",{
    successRedirect: "/secrets",
    failureRedirect: "/login",

}), function(req, res){

});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated())
    res.render("secrets");
  else
    res.redirect("/login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){

  User.register({email: req.body.email}, req.body.password, function(err,user){
    if(err)
    {
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate('local')(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.listen('3000',function(){
  console.log("server is listenning on port 3000");
});
