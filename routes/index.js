var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.get("/search", function (req, res, next) {
  res.render("search");
});

router.get("/aboutus", function (req, res, next) {
  res.render("aboutus");
});

router.get("/contactus", function (req, res, next) {
  res.render("contactus");
});

module.exports = router;
