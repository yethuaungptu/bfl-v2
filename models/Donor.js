const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const DonorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  bloodType: {
    type: String,
  },
  weight: {
    type: Number,
  },
  gender: {
    type: String,
  },
  lastDonation: {
    type: String,
  },
  userStatus: {
    type: Boolean,
    default: true,
  },
  donationStatus: {
    type: Boolean,
    default: true,
  },
  nrcState: {
    type: String,
  },
  nrcTownship: {
    type: String,
  },
  nrcNumber: {
    type: Number,
  },
  isDonorInfoComplete: {
    type: Boolean,
    default: false,
  },
});

DonorSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8), null);
  next();
});

DonorSchema.statics.compare = function (cleartext, encrypted) {
  return bcrypt.compareSync(cleartext, encrypted);
};

module.exports = mongoose.model("Donors", DonorSchema);
