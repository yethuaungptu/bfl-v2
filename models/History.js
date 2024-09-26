const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HistorySchema = new Schema({
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  donorId: {
    type: Schema.Types.ObjectId,
    ref: "Donors",
  },
  donationDate: {
    type: Date,
    required: true,
  },
  remark: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Historys", HistorySchema);
