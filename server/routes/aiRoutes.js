const express = require('express');
const { 
    summarizeNote, 
    generateQuiz, 
    chatWithNote,
    getChatHistory,
    generalChat
} = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware');
const router = express.Router();

// General AI Study Assistant (no PDF required)
router.post('/assistant', authMiddleware, generalChat);

// --- NEW ROUTE ---
// GET /api/ai/chat/:noteId - Get chat history for a note
router.get('/chat/:noteId', [authMiddleware, subscriptionMiddleware], getChatHistory); // 2. Add this route

// POST /api/ai/chat/:noteId - Send a new chat message
router.post('/chat/:noteId', [authMiddleware, subscriptionMiddleware], chatWithNote);

// Other AI routes
router.post('/summarize/:noteId', [authMiddleware, subscriptionMiddleware], summarizeNote);
router.post('/quiz/:noteId', [authMiddleware, subscriptionMiddleware], generateQuiz);

module.exports = router;