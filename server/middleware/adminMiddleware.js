
module.exports = function (req, res, next) {
    
    // Check if user exists (from authMiddleware) and has the correct role
    if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
        // If valid, proceed to the next middleware or controller
        next();
    } else {
        // If not, deny access
        res.status(403).json({ message: 'Access denied. Admin or Teacher role required.' });
    }
};