const User = require('../models/User');

// Admin: Get all student users
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (error) {
        console.error("Error in getAllStudents:", error);
        res.status(500).json({ message: 'Server error while fetching students.' });
    }
};

// --- NEW FUNCTION ---
// Admin: Get only subscribed students
exports.getSubscribedStudents = async (req, res) => {
    try {
        const students = await User.find({ 
            role: 'student', 
            isSubscribed: true 
        }).select('-password');
        res.json(students);
    } catch (error) {
        console.error("Error in getSubscribedStudents:", error);
        res.status(500).json({ message: 'Server error while fetching subscribed students.' });
    }
};
// --- NEW: Get All Teachers ---
exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' }).select('-password');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching teachers.' });
    }
};

// Admin: Add a new student
exports.addStudent = async (req, res) => {
    try {
        const { name, usn, dateOfBirth, branch } = req.body;
        
        const existingUser = await User.findOne({ usn: usn.toUpperCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'A student with this USN already exists.' });
        }

        const newStudent = new User({ 
            name, 
            usn: usn.toUpperCase(), 
            dateOfBirth, 
            branch, 
            role: 'student'
        });
        
        await newStudent.save();
        
        res.status(201).json({ message: 'Student added successfully!', student: newStudent });

    } catch (error) {
        console.error("Error in addStudent:", error);
        res.status(500).json({ message: 'Server error while adding student.' });
    }
};
exports.addTeacher = async (req, res) => {
    try {
        const { name, dateOfBirth, branch } = req.body;

        // Create new Teacher (No USN required)
        const newTeacher = new User({ 
            name, 
            dateOfBirth, 
            branch, 
            role: 'teacher' // Set role
        });
        
        await newTeacher.save();
        
        res.status(201).json({ message: 'Teacher added successfully!', teacher: newTeacher });

    } catch (error) {
        console.error("Error in addTeacher:", error);
        res.status(500).json({ message: 'Server error while adding teacher.' });
    }
};