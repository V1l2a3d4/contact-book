process.env.NODE_ENV = ["local", "dev", "prod"].includes(process.env.NODE_ENV)
  ? process.env.NODE_ENV
  : "local";

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const config = require("./config");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const passportLocal = require("passport-local");
const UserModel = require("./api/user/user.model");
const _ = require("lodash");

mongoose.connect(config.mongodb.uri, config.mongodb.options);
mongoose.set("useCreateIndex", true);
mongoose.set("debug", true);

mongoose.connection.on("open", () => {
  console.log("MongoDB connected");
});
mongoose.connection.on("error", err => {
  console.error("Some DB error", err);
  process.exit(0);
});

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    cookie: {
      httpOnly: true
    },
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      stringify: false
    })
  })
);

passport.use(
  new passportLocal.Strategy(UserModel.loginUser.bind(UserModel), {
    usernameField: "email",
    passwordField: "password"
  })
);
passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});
passport.deserializeUser(UserModel.deserializeUser.bind(UserModel));

app.use(passport.initialize());
app.use(passport.session());

const nunjucks = require("nunjucks");
nunjucks.configure(path.join(__dirname, "templates"), {
  express: app,
  watch: true
});

app.get("/", (req, res) => {
  if (_.get(req, "user._id")) {
    res.redirect("/api/user/profile");
  } else {
    res.redirect("/api/auth");
  }
});

app.use("/api", require("./api"));

module.exports = app;
