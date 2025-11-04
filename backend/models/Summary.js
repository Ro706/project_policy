const mongoose = require("mongoose");
const { Schema } = mongoose;

const SummarySchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  summaryText: {
    type: String,
    required: true,
  },
  wordLimit: Number,
  language: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Summary", SummarySchema);
