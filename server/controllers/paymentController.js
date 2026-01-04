const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// Initialize Razorpay instance
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
    try {
        // Fixed subscription amount (e.g., 10000 paise = ₹100)
        const options = {
            amount: 100 * 100, 
            currency: "INR",
            receipt: `receipt_user_${req.user.id}`, // Unique receipt ID
            notes: {
                userId: req.user.id // Store userId for reference
            }
        };

        const order = await instance.orders.create(options);
        res.status(200).json({ order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: "Failed to create payment order." });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.user.id; // Get user ID from authMiddleware

        // Verify the signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment is authentic and verified
            
            // Update the user in the database
            await User.findByIdAndUpdate(userId, { isSubscribed: true });

            res.status(200).json({ message: "Payment verified successfully. You are now subscribed!" });
        } else {
            res.status(400).json({ message: "Payment verification failed. Signature mismatch." });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Server error during payment verification." });
    }
};