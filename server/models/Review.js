const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  note: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    maxLength: 500,
  },
}, { timestamps: true });

// Prevent a user from reviewing the same note multiple times
ReviewSchema.index({ note: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);