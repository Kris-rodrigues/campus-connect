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

// Admin/Teacher: Delete a student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await User.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        if (student.role !== 'student') {
            return res.status(400).json({ message: 'Can only delete students.' });
        }
        await User.findByIdAndDelete(id);
        res.json({ message: 'Student deleted successfully.' });
    } catch (error) {
        console.error("Error in deleteStudent:", error);
        res.status(500).json({ message: 'Server error while deleting student.' });
    }
};

// Admin/Teacher: Edit a student
exports.editStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, usn, branch, dateOfBirth } = req.body;
        
        const student = await User.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        if (student.role !== 'student') {
            return res.status(400).json({ message: 'Can only edit students.' });
        }

        // Check if new USN conflicts with another user
        if (usn && usn.toUpperCase() !== student.usn) {
            const existingUser = await User.findOne({ usn: usn.toUpperCase() });
            if (existingUser) {
                return res.status(400).json({ message: 'A student with this USN already exists.' });
            }
        }

        if (name) student.name = name;
        if (usn) student.usn = usn.toUpperCase();
        if (branch) student.branch = branch;
        // Only update DOB if it's provided (Admins can send it, teachers might not)
        if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth;

        await student.save();
        res.json({ message: 'Student updated successfully.', student });
    } catch (error) {
        console.error("Error in editStudent:", error);
        res.status(500).json({ message: 'Server error while editing student.' });
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

// Admin Only: Delete a teacher
exports.deleteTeacher = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete teachers.' });
        }
        const { id } = req.params;
        const teacher = await User.findById(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }
        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'Can only delete teachers.' });
        }
        await User.findByIdAndDelete(id);
        res.json({ message: 'Teacher deleted successfully.' });
    } catch (error) {
        console.error("Error in deleteTeacher:", error);
        res.status(500).json({ message: 'Server error while deleting teacher.' });
    }
};

// Admin Only: Edit a teacher
exports.editTeacher = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can edit teachers.' });
        }
        const { id } = req.params;
        const { name, branch, dateOfBirth } = req.body;
        
        const teacher = await User.findById(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }
        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'Can only edit teachers.' });
        }

        if (name) teacher.name = name;
        if (branch) teacher.branch = branch;
        if (dateOfBirth !== undefined) teacher.dateOfBirth = dateOfBirth;

        await teacher.save();
        res.json({ message: 'Teacher updated successfully.', teacher });
    } catch (error) {
        console.error("Error in editTeacher:", error);
        res.status(500).json({ message: 'Server error while editing teacher.' });
    }
};