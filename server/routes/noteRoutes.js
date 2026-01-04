const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
    getAllNotes, 
    uploadNote, 
    updateNote, 
    deleteNote, 
    getFilteredNotes,
    getSubjectsForSemester,
    viewNoteFile, // Ensure this is imported
    getNoteReviews,
    addOrUpdateReview
} = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// --- STUDENT & ADMIN ROUTES ---
// These routes are accessible to any logged-in user (student or admin)
router.get('/', authMiddleware, getAllNotes);
router.get('/subjects', authMiddleware, getSubjectsForSemester);
router.get('/filter', authMiddleware, getFilteredNotes);
router.get('/view/:noteId', authMiddleware, viewNoteFile); // New view route

// --- REVIEW ROUTES ---
router.get('/:noteId/reviews', authMiddleware, getNoteReviews);
router.post('/:noteId/rate', authMiddleware, addOrUpdateReview);

// --- ADMIN-ONLY ROUTES ---
// These routes require the user to be an admin
router.put('/update/:id', [authMiddleware, adminMiddleware, upload.single('file')], updateNote);
router.post('/upload', [authMiddleware, adminMiddleware, upload.single('file')], uploadNote);
router.put('/update/:id', [authMiddleware, adminMiddleware], updateNote);
router.delete('/delete/:id', [authMiddleware, adminMiddleware], deleteNote);

module.exports = router;