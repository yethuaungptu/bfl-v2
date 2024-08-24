var express = require("express");
var router = express.Router();
var Location = require("../models/Location");
var Admin = require("../models/Admin");
var bcrypt = require("bcryptjs");

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

router.get("/admin", checkAdmin, async function (req, res, next) {
  const admins = await Admin.find({});
  res.render("suadmin/admin", { admins: admins });
});

router.get("/adminAdd", checkAdmin, async function (req, res) {
  const locations = await Location.find(
    { state: "Ayeyarwady" },
    { state: 1, _id: 0, district: 1 }
  );
  console.log(locations);
  res.render("suadmin/adminAdd", { locations: locations });
});

router.post("/checkAdmin", checkAdmin, async function (req, res) {
  const checkEmail = await Admin.findOne({ email: req.body.email });
  const checkAddress = await Admin.findOne({
    state: req.body.state,
    district: req.body.district,
  });
  if (checkEmail == null && checkAddress == null) {
    res.json({ status: true });
  } else if (checkEmail != null) {
    res.json({ status: false, msg: "Email is duplicated" });
  } else if (checkAddress != null) {
    res.json({ status: false, msg: "Address is duplicated" });
  } else {
    res.json({ status: false, msg: "Somethings was wrong" });
  }
});

router.post("/adminAdd", checkAdmin, async function (req, res) {
  try {
    const admin = new Admin();
    admin.name = req.body.name;
    admin.email = req.body.email;
    admin.password = req.body.password;
    admin.phone = req.body.phone;
    admin.state = req.body.state;
    admin.district = req.body.district;
    const data = await admin.save();
    res.json({ status: true });
  } catch (e) {
    res.json({ status: false });
  }
});

router.get("/adminDetail/:id", checkAdmin, async function (req, res) {
  const admin = await Admin.findById(req.params.id);
  res.render("suadmin/adminDetail", { admin: admin });
});

router.get("/adminUpdate/:id", checkAdmin, async function (req, res) {
  const locations = await Location.find(
    { state: "Ayeyarwady" },
    { state: 1, _id: 0, district: 1 }
  );
  const admin = await Admin.findById(req.params.id);
  console.log(locations);
  res.render("suadmin/adminUpdate", { locations: locations, admin: admin });
});

router.post("/checkAdminWithId", checkAdmin, async function (req, res) {
  const checkEmail = await Admin.findOne({
    email: req.body.email,
    _id: { $ne: req.body.id },
  });
  const checkAddress = await Admin.findOne({
    state: req.body.state,
    district: req.body.district,
    _id: { $ne: req.body.id },
  });
  if (checkEmail == null && checkAddress == null) {
    res.json({ status: true });
  } else if (checkEmail != null) {
    res.json({ status: false, msg: "Email is duplicated" });
  } else if (checkAddress != null) {
    res.json({ status: false, msg: "Address is duplicated" });
  } else {
    res.json({ status: false, msg: "Somethings was wrong" });
  }
});

router.post("/adminUpdate", checkAdmin, async function (req, res) {
  try {
    const update = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      state: req.body.state,
      district: req.body.district,
    };
    if (req.body.password)
      update.password = bcrypt.hashSync(
        req.body.password,
        bcrypt.genSaltSync(8),
        null
      );
    const admin = await Admin.findByIdAndUpdate(req.body.id, update);
    res.json({ status: true });
  } catch (e) {
    res.json({ status: false });
  }
});

router.get("/adminDelete/:id", checkAdmin, async function (req, res) {
  const admin = await Admin.findByIdAndDelete(req.params.id);
  res.redirect("/suadmin/admin");
});

router.get("/logout", checkAdmin, function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

module.exports = router;
