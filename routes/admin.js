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
  res.render("admin/index");
});

router.get("/pendingDonor", checkAdmin, function (req, res, next) {
  res.render("admin/pendingDonor");
});

router.get("/donor", checkAdmin, function (req, res) {
  res.render("admin/donor");
});

router.get("/donordetail/:id", checkAdmin, function (req, res) {
  res.render("admin/donordetail");
});

router.get("/changepwd", checkAdmin, function (req, res) {
  res.render("admin/changepwd");
});

router.get("/logout", checkAdmin, function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

module.exports = router;
