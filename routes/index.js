var express = require("express");
var router = express.Router();
const Admin = require("../models/Admin");
const Donor = require("../models/Donor");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post("/login", async function (req, res) {
  const donor = await Donor.findOne({ email: req.body.email });
  if (donor != null && Donor.compare(req.body.password, donor.password)) {
    req.session.donor = {
      id: donor.id,
      name: donor.name,
      email: donor.email,
      state: donor.state,
      district: donor.district,
      isDonorInfoComplete: donor.isDonorInfoComplete,
    };
    res.redirect("/donor");
  } else {
    res.redirect("/login");
  }
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

router.get("/alogin", function (req, res, next) {
  res.render("alogin");
});

router.post("/alogin", async function (req, res) {
  if (
    req.body.email == "bfl2024@gmail.com" &&
    req.body.password == "bfl12345"
  ) {
    req.session.admin = {
      name: "Super Admin",
      email: "bfl2024@gmail.com",
      role: "suadmin",
    };
    res.redirect("/suadmin");
  } else {
    const admin = await Admin.findOne({ email: req.body.email });
    if (admin != null && Admin.compare(req.body.password, admin.password)) {
      req.session.admin = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        state: admin.state,
        district: admin.district,
      };
      res.redirect("/admin");
    } else {
      res.redirect("/alogin");
    }
  }
});

module.exports = router;
