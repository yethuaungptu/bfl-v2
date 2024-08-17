var express = require("express");
var router = express.Router();

/* GET users listing. */
const checkAdmin = function (req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/alogin");
  }
};
router.get("/", checkAdmin, function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
