const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'ai'],
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, { timestamps: true });

const ChatHistorySchema = new mongoose.Schema({
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        required: true,
    },
    // Using Mixed to support both Students (ObjectId) and Admin ("admin_user" string)
    user: {
        type: mongoose.Schema.Types.Mixed, 
        required: true,
    },
    messages: [MessageSchema]
}, { timestamps: true });

// Prevent duplicate history entries for the same note+user
ChatHistorySchema.index({ note: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);