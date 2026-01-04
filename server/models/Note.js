const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  // --- Existing Fields ---
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploaderName: { type: String },
  
  // --- New Categorization Fields ---
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  subject: { type: String, required: true },
  module: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);