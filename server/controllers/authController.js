const User = require('../models/User');
const jwt = require('jsonwebtoken');

// The register function remains unchanged
exports.register = async (req, res) => {
  try {
    const { name, usn, dateOfBirth, branch } = req.body;
    const existingUser = await User.findOne({ usn: usn.toUpperCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this USN already exists.' });
    }
    const newUser = new User({ name, usn, dateOfBirth, branch });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error });
  }
};

// The updated login function with the admin check
exports.login = async (req, res) => {
    try {
        // We now accept 'name' (for teachers) OR 'usn' (for students/admin)
        const { usn, name, dateOfBirth, loginType } = req.body; 
        const inputDob = dateOfBirth;

        // 1. SUPER ADMIN LOGIN (Hardcoded)
        if (loginType !== 'teacher' && usn && usn.toUpperCase() === 'ADMIN' && inputDob === '2005-02-01') {
            const adminPayload = { id: 'admin_user', name: 'Admin', role: 'admin', isSubscribed: true };
            const token = jwt.sign(adminPayload, process.env.JWT_SECRET, { expiresIn: '1d' });
            return res.status(200).json({ token, name: 'Admin', role: 'admin', isSubscribed: true });
        }

        let user;

        // 2. TEACHER LOGIN (Using Name + DOB)
        if (loginType === 'teacher') {
            // Find teacher by Name and Role
            // Note: Names are not unique, ideally use ID/Email, but Name requested.
            // We use findOne, so it picks the first match.
            user = await User.findOne({ name: name, role: 'teacher' });
            
            if (!user) {
                 return res.status(404).json({ message: 'Teacher not found. Check Name.' });
            }
        } 
        // 3. STUDENT LOGIN (Using USN + DOB)
        else {
            user = await User.findOne({ usn: usn.toUpperCase() });
            if (!user) {
                return res.status(404).json({ message: 'USN not found. Please check your credentials.' });
            }
        }

        // Common Date Check
        const dbDate = new Date(user.dateOfBirth);
        const year = dbDate.getUTCFullYear();
        const month = String(dbDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dbDate.getUTCDate()).padStart(2, '0');
        const storedDob = `${year}-${month}-${day}`;
        
        if (storedDob !== inputDob) {
            return res.status(401).json({ message: 'Invalid Date of Birth.' });
        }

        // Generate Token
        const payload = {
            id: user._id,
            usn: user.usn,
            name: user.name,
            role: user.role,
            isSubscribed: user.isSubscribed 
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ token, name: user.name, role: user.role, isSubscribed: user.isSubscribed });

    } catch (error) {
        console.error("SERVER ERROR during login:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};