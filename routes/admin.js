var express = require("express");
var bcrypt = require("bcryptjs");
var router = express.Router();
var Donor = require("../models/Donor");

/* GET users listing. */
const checkAdmin = function (req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/alogin");
  }
};
router.get("/", checkAdmin, async function (req, res, next) {
  const totalDonor = await Donor.aggregate([
    { $match: { status: true, isDonorInfoComplete: true } },
    { $group: { _id: "$bloodType", count: { $sum: 1 } } },
  ]);
  const totalDonorCount = await Donor.countDocuments({
    status: true,
    isDonorInfoComplete: true,
  });
  const activeDonor = await Donor.aggregate([
    {
      $match: { status: true, isDonorInfoComplete: true, donationStatus: true },
    },
    { $group: { _id: "$bloodType", count: { $sum: 1 } } },
  ]);
  const activeDonorCount = await Donor.countDocuments({
    status: true,
    isDonorInfoComplete: true,
    donationStatus: true,
  });
  res.render("admin/index", {
    totalDonor: totalDonor,
    totalDonorCount: totalDonorCount,
    activeDonor: activeDonor,
    activeDonorCount: activeDonorCount,
  });
});

router.get("/pendingDonor", checkAdmin, async function (req, res, next) {
  const donors = await Donor.find({
    isDonorInfoComplete: false,
    state: req.session.admin.state,
    district: req.session.admin.district,
    status: true,
  });
  res.render("admin/pendingDonor", { donors: donors });
});

router.post("/pendingDonorCheck", checkAdmin, async function (req, res) {
  const donor = await Donor.findOne({ email: req.body.email, status: true });
  if (donor != null) res.json({ status: false });
  else res.json({ status: true });
});

router.post("/pendingDonorAdd", checkAdmin, async function (req, res) {
  try {
    const donor = new Donor();
    const donorCount = await Donor.countDocuments();
    const codeStr =
      "BFL-" +
      (donorCount < 10
        ? "000"
        : donorCount < 100
        ? "00"
        : donorCount < 1000
        ? "0"
        : "") +
      Number(donorCount + 1);
    donor.name = req.body.name;
    donor.code = codeStr;
    donor.email = req.body.email;
    donor.password = req.body.password;
    donor.phone = req.body.phone;
    donor.age = req.body.age;
    donor.state = req.session.admin.state;
    donor.district = req.session.admin.district;
    const data = await donor.save();
    res.json({ status: true });
  } catch (e) {
    res.json({ status: false });
  }
});

router.post("/pendingDonorUpdate", checkAdmin, async function (req, res) {
  const update = {
    name: req.body.uname,
    phone: req.body.uphone,
  };
  if (req.body.upassword)
    update.password = bcrypt.hashSync(
      req.body.upassword,
      bcrypt.genSaltSync(8),
      null
    );
  const data = await Donor.findByIdAndUpdate(req.body.id, update);
  res.redirect("/admin/pendingDonor");
});

router.get("/pendingDonorDelete/:id", checkAdmin, async function (req, res) {
  const data = await Donor.findByIdAndUpdate(req.params.id, { status: false });
  res.redirect("/admin/pendingDonor");
});

router.get("/donor", checkAdmin, async function (req, res) {
  const donors = await Donor.find({
    donationStatus: true,
    isDonorInfoComplete: true,
    status: true,
  });
  res.render("admin/donor", { donors: donors });
});

router.get("/donordetail/:id", checkAdmin, async function (req, res) {
  const donor = await Donor.findById(req.params.id);
  res.render("admin/donordetail", { donor: donor });
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
