var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var mongoose = require("mongoose");

var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");
var suAdminRouter = require("./routes/suadmin");
var donorRouter = require("./routes/donor");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://127.0.0.1/bflv2db");
const db = mongoose.connection;
db.on("error", console.error.bind("mongodb connection error at dfldb"));

app.use(
  session({
    secret: "Bl0odF0R1!f3",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/suadmin", suAdminRouter);
app.use("/donor", donorRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
