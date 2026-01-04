const User = require('../models/User');

// This middleware runs AFTER authMiddleware
module.exports = async function (req, res, next) {
    try {
        // Admins always have access
        if (req.user.role === 'admin') {
            return next();
        }

        // For students, check their database record
        // This ensures the check is always up-to-date
        const user = await User.findById(req.user.id);
        if (user && user.isSubscribed) {
            next(); // User is subscribed, allow access
        } else {
            // User is not subscribed
            res.status(402).json({ message: 'Payment required. Please subscribe to use this feature.' });
        }
    } catch (e) {
        res.status(500).json({ message: 'Server error while checking subscription.' });
    }
};