var express = require("express");
var router = express.Router();
var Location = require("../models/Location");

/* GET users listing. */
const checkAdmin = function (req, res, next) {
  if (req.session.admin && req.session.admin.role == "suadmin") {
    next();
  } else {
    res.redirect("/alogin");
  }
};
router.get("/", checkAdmin, function (req, res, next) {
  res.render("suadmin/index");
});

router.get("/admin", checkAdmin, function (req, res, next) {
  res.render("suadmin/admin");
});

router.get("/adminAdd", checkAdmin, async function (req, res) {
  const locations = await Location.find(
    { state: "Ayeyarwady" },
    { state: 1, _id: 0, district: 1 }
  );
  console.log(locations);
  res.render("suadmin/adminAdd", { locations: locations });
});

router.get("/adminDetail/:id", checkAdmin, async function (req, res) {
  res.render("suadmin/adminDetail");
});

router.get("/adminUpdate/:id", checkAdmin, async function (req, res) {
  const locations = await Location.find(
    { state: "Ayeyarwady" },
    { state: 1, _id: 0, district: 1 }
  );
  console.log(locations);
  res.render("suadmin/adminUpdate", { locations: locations });
});

router.get("/logout", checkAdmin, function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

module.exports = router;
