const express = require('express');
const { 
    getAllStudents, 
    addStudent, 
    getSubscribedStudents,
    getAllTeachers, // Import
    addTeacher // Import
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

router.get('/', [authMiddleware, adminMiddleware], getAllStudents);
router.get('/subscribed', [authMiddleware, adminMiddleware], getSubscribedStudents);
router.post('/add', [authMiddleware, adminMiddleware], addStudent);

// --- NEW TEACHER ROUTES ---
router.get('/teachers', [authMiddleware, adminMiddleware], getAllTeachers);
router.post('/add-teacher', [authMiddleware, adminMiddleware], addTeacher);

module.exports = router;