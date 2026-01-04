const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  note: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  topicName: { type: String, required: true }, // e.g., "Blockchain - Module 1"
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  badge: { type: String, enum: ['Gold', 'Silver', 'Bronze', 'Participation'], default: 'Participation' },
  dateTaken: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('QuizResult', QuizResultSchema);