var express = require("express");
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
var router = express.Router();
var Donor = require("../models/Donor");
const History = require("../models/History");
var bcrypt = require("bcryptjs");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bflmyanmar.ptntu@gmail.com", // Your email
    pass: "caze yiqc wpbo fqnm", // Your email password or app-specific password
  },
});

/* GET users listing. */
const checkAdmin = function (req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/alogin");
  }
};
function _calculateAge(birthday) {
  // birthday is a date
  var ageDifMs = Date.now() - birthday.getTime();
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

router.get("/", checkAdmin, async function (req, res, next) {
  const totalDonor = await Donor.aggregate([
    {
      $match: {
        status: true,
        isDonorInfoComplete: true,
        state: req.session.admin.state,
        district: req.session.admin.district,
      },
    },
    { $group: { _id: "$bloodType", count: { $sum: 1 } } },
  ]);
  const totalDonorCount = await Donor.countDocuments({
    status: true,
    isDonorInfoComplete: true,
    state: req.session.admin.state,
    district: req.session.admin.district,
  });
  const activeDonor = await Donor.aggregate([
    {
      $match: {
        status: true,
        isDonorInfoComplete: true,
        donationStatus: true,
        state: req.session.admin.state,
        district: req.session.admin.district,
      },
    },
    { $group: { _id: "$bloodType", count: { $sum: 1 } } },
  ]);
  const activeDonorCount = await Donor.countDocuments({
    status: true,
    isDonorInfoComplete: true,
    donationStatus: true,
    state: req.session.admin.state,
    district: req.session.admin.district,
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
    const mailOptions = {
      from: "bflmyanmar.ptntu@gmail.com",
      to: req.body.email,
      subject: "Vertification Alert Message from BFL myanmar",
      html: "<p>Welcome Donor, you need to insert your information like blood type,last donation and other more.If you not fill your information within 30 days, we will permanently remove your account. </p><br><br><br><p>Best regards,</p><p><b>BFL myanmar team</b></p>",
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.json({ status: false });
        return console.log("Error:", error);
      }
      console.log("Email sent:", info.response);
    });
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
    isDonorInfoComplete: true,
    state: req.session.admin.state,
    district: req.session.admin.district,
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

router.post("/donateToday", checkAdmin, async function (req, res) {
  try {
    const history = new History();
    history.state = req.session.admin.state;
    history.district = req.session.admin.district;
    history.donorId = req.body.id;
    history.donationDate = Date.now();
    history.remark = "Donation add by local admin";
    const data = await Donor.findByIdAndUpdate(req.body.id, {
      lastDonation: Date.now(),
      donationStatus: false,
    });
    const historyData = await history.save();
    res.json({ status: true });
  } catch (error) {
    res.json({ status: false });
  }
});

router.post("/sentDonorAlert", checkAdmin, function (req, res) {
  try {
    res.json({ status: true });
    const mailOptions = {
      from: "bflmyanmar.ptntu@gmail.com",
      to: req.body.email,
      subject: "Alert Message from BFL myanmar",
      html: "<p>Hello Donor, you pass 90days for last blood donation. Now, your donation status is avaliable but your donor status is not avaliable.If you are avalible for blood donation, please turn on status for avaliable. Some life need your blood</p><br><br><br><p>Best regards,</p><p><b>BFL myanmar team</b></p>",
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.json({ status: false });
        return console.log("Error:", error);
      }
      console.log("Email sent:", info.response);
    });
  } catch (error) {
    res.json({ status: false });
  }
});

router.post("/updateDonorPassword", checkAdmin, async function (req, res) {
  try {
    const data = await Donor.findByIdAndUpdate(req.body.id, {
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null),
    });
    res.json({ status: true });
  } catch (e) {
    console.log(e);
    res.json({ status: false });
  }
});

router.get("/availableDonor", checkAdmin, async function (req, res) {
  console.log(req.query);
  let query = {
    userStatus: true,
    donationStatus: true,
    isDonorInfoComplete: true,
    state: req.session.admin.state,
    district: req.session.admin.district,
    status: true,
  };
  if (req.query.bloodType) {
    query.bloodType = req.query.bloodType.replace(" ", "+");
  }
  console.log(query);
  const list = await Donor.find(query);
  const donors = [];
  for (var i = 0; i < list.length; i++) {
    const count = await History.countDocuments({ donorId: list[i]._id });
    donors.push({
      name: list[i].name,
      code: list[i].code,
      age: _calculateAge(new Date(list[i].dob)),
      bloodType: list[i].bloodType,
      donationCount: count,
      phone: list[i].phone,
    });
  }
  res.render("admin/availableDonor", { donors: donors });
});

router.get("/logout", checkAdmin, function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

module.exports = router;
