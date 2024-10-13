const express = require("express");
const router = express.Router();
var bcrypt = require("bcryptjs");
const Donor = require("../models/Donor");
const Admin = require("../models/Admin");
const Location = require("../models/Location");
const History = require("../models/History");

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
  let admin = await Admin.findOne({
    state: req.session.donor.state,
    district: req.session.donor.district,
  });
  if (!admin) admin = { name: "Not avaliable", phone: "Not avaliable" };
  res.render("donor/index", { admin: admin });
});

router.get("/profile", checkDonor, async function (req, res) {
  const donor = await Donor.findById(req.session.donor.id);
  const locations = await Location.find({}, { state: 1, _id: 0, district: 1 });
  res.render("donor/profile", { donor: donor, locations: locations });
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
    const donor = await Donor.findById(req.session.donor.id);
    if (req.body.lastDonation && !donor.lastDonation) {
      update.lastDonation = req.body.lastDonation;
      const timestamp =
        new Date(req.body.lastDonation).getTime() + 90 * 24 * 60 * 60 * 1000;
      const nowstamp = new Date().getTime();
      update.donationStatus = timestamp < nowstamp;
      const history = new History();
      history.state = req.session.donor.state;
      history.district = req.session.donor.district;
      history.donorId = req.session.donor.id;
      history.donationDate = req.body.lastDonation;
      history.remark = "Last donation by donor";
      const historyData = await history.save();
      console.log(historyData);
    }
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

router.post("/changeLocation", checkDonor, async function (req, res) {
  try {
    const data = await Donor.findByIdAndUpdate(req.session.donor.id, {
      state: req.body.state,
      district: req.body.district,
    });
    const donor = await Donor.findById(data.id);
    req.session.donor = {
      id: donor.id,
      name: donor.name,
      email: donor.email,
      state: donor.state,
      district: donor.district,
      isDonorInfoComplete: donor.isDonorInfoComplete,
    };
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

router.get("/history", checkDonor, async function (req, res) {
  const lists = await History.find({ donorId: req.session.donor.id });
  res.render("donor/history", { lists: lists });
});

router.get("/logout", checkDonor, async function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

module.exports = router;
