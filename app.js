var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var mongoose = require("mongoose");
const schedule = require("node-schedule");
const nodemailer = require("nodemailer");

var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");
var suAdminRouter = require("./routes/suadmin");
var donorRouter = require("./routes/donor");

const Donor = require("./models/Donor");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bflmyanmar.ptntu@gmail.com", // Your email
    pass: "caze yiqc wpbo fqnm", // Your email password or app-specific password
  },
});

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// mongoose.connect("mongodb://127.0.0.1/bflv2db");
mongoose.connect(
  "mongodb+srv://bflmyanmar:bfl2024@bfl-v2.le4zw.mongodb.net/?retryWrites=true&w=majority&appName=bfl-v2"
);
const db = mongoose.connection;
db.on("error", console.error.bind("mongodb connection error at dfldb"));

app.use(
  session({
    secret: "Bl0odF0R1!f3",
    resave: false,
    saveUninitialized: true,
  })
);
function sendMailFun(mail) {
  try {
    const mailOptions = {
      from: "bflmyanmar.ptntu@gmail.com",
      to: mail,
      subject: "Alert Message from BFL myanmar",
      html: "<p>Hello Donor, you pass 90days for last blood donation. Now, your donation status is avaliable but your donor status is not avaliable.If you are avalible for blood donation, please turn on status for avaliable. Some life need your blood</p><br><br><br><p>Best regards,</p><p><b>BFL myanmar team</b></p>",
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("Error:", error);
      }
      console.log("Email sent:", info.response);
    });
  } catch (error) {
    console.log(error);
  }
}
async function checkingStatus() {
  var d = new Date();
  d.setDate(d.getDate() - 90);
  const mailList = await Donor.find({
    donationStatus: false,
    userStatus: false,
    lastDonation: { $lte: d },
  });

  for (var i = 0; i < mailList.length; i++) {
    sendMailFun(mailList[i].email);
  }
  const donors = await Donor.updateMany(
    {
      donationStatus: false,
      lastDonation: { $lte: d },
    },
    { donationStatus: true }
  );
}

async function checkPendingDonor() {
  var d = new Date();
  d.setDate(d.getDate() - 30);
  const donors = await Donor.deleteMany({
    isDonorInfoComplete: false,
    created: { $lte: d },
  });
  console.log(donors);
}

schedule.scheduleJob("0 0 * * *", function () {
  console.log("Task is running every day at 0:00 AM");
  // Your task logic here
  checkingStatus();
  checkPendingDonor();
});

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/suadmin", suAdminRouter);
app.use("/donor", donorRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
