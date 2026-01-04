const QuizResult = require('../models/QuizResult');
const Note = require('../models/Note');

// Save a new quiz result
exports.submitQuizResult = async (req, res) => {
    try {
        const { noteId, score, totalQuestions, topicName } = req.body;
        const percentage = (score / totalQuestions) * 100;
        
        // Determine Badge
        let badge = 'Participation';
        if (percentage >= 90) badge = 'Gold';
        else if (percentage >= 75) badge = 'Silver';
        else if (percentage >= 50) badge = 'Bronze';

        const newResult = new QuizResult({
            user: req.user.id,
            note: noteId,
            topicName,
            score,
            totalQuestions,
            percentage,
            badge
        });

        await newResult.save();
        res.status(201).json({ message: "Result saved!", result: newResult });
    } catch (error) {
        console.error("Error saving quiz:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// Get logged-in student's results
exports.getMyResults = async (req, res) => {
    try {
        const results = await QuizResult.find({ user: req.user.id })
            .sort({ createdAt: -1 }); // Newest first
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

// Admin: Get ALL results (Leaderboard style)
exports.getAllResults = async (req, res) => {
    try {
        const results = await QuizResult.find()
            .populate('user', 'name usn') // Get student details
            .sort({ percentage: -1, createdAt: -1 }); // Highest score first
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

// --- NEW FUNCTION: Reset Leaderboard ---
exports.resetLeaderboard = async (req, res) => {
    try {
        // Deletes ALL documents in the QuizResult collection
        await QuizResult.deleteMany({});
        res.status(200).json({ message: "Leaderboard has been reset successfully." });
    } catch (error) {
        console.error("Error resetting leaderboard:", error);
        res.status(500).json({ message: "Server error while resetting leaderboard." });
    }
};