var express = require("express");
var router = express.Router();
const Admin = require("../models/Admin");
const Donor = require("../models/Donor");
const Location = require("../models/Location");
const History = require("../models/History");

/* GET home page. */
router.get("/", async function (req, res, next) {
  const topDonors = await History.aggregate([
    {
      $group: {
        _id: "$donorId",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "donors",
        localField: "_id",
        foreignField: "_id",
        as: "donor",
      },
    },
    { $limit: 10 },
  ]);
  console.log(topDonors);
  res.render("index", { topDonors: topDonors });
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

router.get("/search", async function (req, res, next) {
  const locations = await Location.find({}, { state: 1, _id: 0, district: 1 });
  console.log(locations);
  res.render("search", { locations: locations });
});

router.get("/aboutus", function (req, res, next) {
  res.render("aboutus");
});

router.get("/contactus", async function (req, res, next) {
  const admin = await Admin.aggregate([
    {
      $match: { status: true },
    },
    {
      $group: { _id: "$name", admin: { $push: "$$ROOT" } },
    },
  ]);
  console.log("////", admin);
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

router.post("/donorSearch", async function (req, res) {
  try {
    console.log(req.body);
    const donors = await Donor.find({
      status: true,
      isDonorInfoComplete: true,
      donationStatus: true,
      userStatus: true,
      state: req.body.state,
      district: req.body.district,
      bloodType: req.body.bloodType,
    });
    res.json({ status: true, donors: donors });
  } catch (e) {
    res.josn({ status: false });
  }
});

module.exports = router;
