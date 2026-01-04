const express = require('express');
const { 
    submitQuizResult, 
    getMyResults, 
    getAllResults, 
    resetLeaderboard // 1. Import new function
} = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

// Student Routes
router.post('/submit', authMiddleware, submitQuizResult);
router.get('/my-results', authMiddleware, getMyResults);
router.get('/all-results', authMiddleware, getAllResults);

// Admin Routes
// 2. Add the reset route (Admin Only)
router.delete('/reset', [authMiddleware, adminMiddleware], resetLeaderboard);

module.exports = router;