const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // USN is sparse because Admins/Teachers might not have one (Teachers use Name)
  usn: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
  dateOfBirth: { type: Date },
  branch: { type: String },
  
  role: {
    type: String,
    enum: ['student', 'admin', 'teacher'], // Added 'teacher'
    default: 'student',
  },

  isSubscribed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);