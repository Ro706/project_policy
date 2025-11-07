const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeedbackSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  experience: {
    type: String,
    required: true
  },
  feedback: {
    type: String,
    required: true
  },
  suggestion: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('feedback', FeedbackSchema);
