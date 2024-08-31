const express = require("express");
const router = express.Router();
var bcrypt = require("bcryptjs");
const Donor = require("../models/Donor");
const Admin = require("../models/Admin");

const Validator = require("myanmar-mobile-validator");
const mmNric = require("mm-nric");

const checkDonor = function (req, res, next) {
  if (req.session.donor) {
    res.locals.donor = req.session.donor;
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", checkDonor, async function (req, res) {
  const admin = await Admin.findOne({
    state: req.session.donor.state,
    district: req.session.donor.district,
  });
  res.render("donor/index", { admin: admin });
});

router.get("/profile", checkDonor, async function (req, res) {
  const donor = await Donor.findById(req.session.donor.id);
  res.render("donor/profile", { donor: donor });
});

router.post("/checkInfo", checkDonor, async function (req, res) {
  const mobileValidate = Validator(req.body.phone);
  console.log(req.body.nrc);
  const nrcValidate = mmNric.validateNricFormat(req.body.nrc);
  if (!mobileValidate) {
    res.json({ status: false, msg: "Mobile validation fail" });
  } else if (!nrcValidate) {
    res.json({ status: false, msg: "NRC validation fail" });
  } else if (Number(req.body.weight) < 100 || Number(req.body.weight) > 350) {
    res.json({
      status: false,
      msg: "Weight must be between 100 and 350 pound",
    });
  } else {
    const donor = await Donor.findOne({
      nrc: req.body.nrc,
      _id: { $ne: req.body.id },
    });
    if (donor != null) res.json({ status: false, msg: "NRC is duplicated" });
    else res.json({ status: true });
  }
});

router.post("/updateInfo", checkDonor, async function (req, res) {
  try {
    const update = {
      name: req.body.name,
      phone: req.body.phone,
      bloodType: req.body.bloodType,
      weight: req.body.weight,
      gender: req.body.gender,
      nrc: req.body.nrc,
      age: req.body.age,
      isDonorInfoComplete: true,
    };
    if (req.body.lastDonation) update.lastDonation = req.body.lastDonation;
    const data = await Donor.findByIdAndUpdate(req.session.donor.id, update);
    res.json({ status: true });
  } catch (e) {
    console.log(e);
    res.json({ status: false });
  }
});

router.post("/updatePass", checkDonor, async function (req, res) {
  try {
    const donor = await Donor.findById(req.body.id);
    const oldpassCheck = Donor.compare(req.body.oldPass, donor.password);
    if (!oldpassCheck) {
      res.json({ status: false, msg: "Old password not match" });
    } else {
      const data = await Donor.findByIdAndUpdate(req.body.id, {
        password: bcrypt.hashSync(
          req.body.newPass,
          bcrypt.genSaltSync(8),
          null
        ),
      });
      res.json({ status: true });
    }
  } catch (e) {
    res.json({ status: false, msg: "Somethings was wrong" });
  }
});

router.post("/changeStatus", checkDonor, async function (req, res) {
  try {
    const data = await Donor.findByIdAndUpdate(req.session.donor.id, {
      userStatus: req.body.status,
    });
    res.json({ status: true });
  } catch (e) {
    res.json({ status: false, msg: "Somethings was wrong!" });
  }
});

router.post("/changeEditMode", checkDonor, async function (req, res) {
  try {
    const data = await Donor.findByIdAndUpdate(req.session.donor.id, {
      isDonorInfoComplete: false,
    });
    res.json({ status: true });
  } catch (e) {
    res.json({ status: false, msg: "Somethings was wrong!" });
  }
});

router.get("/logout", checkDonor, async function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

module.exports = router;
