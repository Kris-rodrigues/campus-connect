const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// POST /api/payment/create-order
// Creates a new Razorpay order
router.post('/create-order', authMiddleware, createOrder);

// POST /api/payment/verify
// Verifies the payment signature and updates user status
router.post('/verify', authMiddleware, verifyPayment);

module.exports = router;