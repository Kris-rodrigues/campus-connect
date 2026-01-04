const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  console.log('--- 1. authMiddleware: Running... ---');
  const token = req.header('x-auth-token');

  if (!token) {
    console.log('--- 1. authMiddleware: FAILED (No token) ---');
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('--- 1. authMiddleware: SUCCESS ---');
    next(); // Move on to the next middleware
  } catch (err) {
    console.log('--- 1. authMiddleware: FAILED (Token invalid)', err.message);
    res.status(401).json({ message: 'Token is not valid.' });
  }
};