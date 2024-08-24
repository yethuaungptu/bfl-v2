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
router.get("/", checkAdmin, function (req, res, next) {
  res.render("admin/index");
});

router.get("/pendingDonor", checkAdmin, async function (req, res, next) {
  const donors = await Donor.find({
    isDonorInfoComplete: false,
    state: req.session.admin.state,
    district: req.session.admin.district,
  });
  res.render("admin/pendingDonor", { donors: donors });
});

router.post("/pendingDonorCheck", checkAdmin, async function (req, res) {
  const donor = await Donor.findOne({ email: req.body.email });
  if (donor != null) res.json({ status: false });
  else res.json({ status: true });
});

router.post("/pendingDonorAdd", checkAdmin, async function (req, res) {
  try {
    const donor = new Donor();
    donor.name = req.body.name;
    donor.email = req.body.email;
    donor.password = req.body.password;
    donor.phone = req.body.phone;
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
  const data = await Donor.findOneAndDelete(req.params.id);
  res.redirect("/admin/pendingDonor");
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
