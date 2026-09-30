const express = require('express');
const { 
    getAllStudents, 
    addStudent, 
    getSubscribedStudents,
    getAllTeachers,
    addTeacher,
    deleteStudent,
    editStudent,
    deleteTeacher,
    editTeacher
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

router.get('/', [authMiddleware, adminMiddleware], getAllStudents);
router.get('/subscribed', [authMiddleware, adminMiddleware], getSubscribedStudents);
router.post('/add', [authMiddleware, adminMiddleware], addStudent);
router.delete('/delete-student/:id', [authMiddleware, adminMiddleware], deleteStudent);
router.put('/edit-student/:id', [authMiddleware, adminMiddleware], editStudent);

// --- NEW TEACHER ROUTES ---
router.get('/teachers', [authMiddleware, adminMiddleware], getAllTeachers);
router.post('/add-teacher', [authMiddleware, adminMiddleware], addTeacher);
router.delete('/delete-teacher/:id', [authMiddleware, adminMiddleware], deleteTeacher);
router.put('/edit-teacher/:id', [authMiddleware, adminMiddleware], editTeacher);

module.exports = router;