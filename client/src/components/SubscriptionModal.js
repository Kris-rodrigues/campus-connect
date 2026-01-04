import React, { useState } from 'react';
import axios from 'axios';
import './AiModal.css'; // Reuse AiModal CSS

const SubscriptionModal = ({ closeModal }) => {
    const [message, setMessage] = useState('');

    const handlePayment = async () => {
        try {
            const token = localStorage.getItem('token');
            // 1. Create an order from the backend
            const { data } = await axios.post('/api/payment/create-order', {}, {
                headers: { 'x-auth-token': token }
            });

            const { order, key_id } = data;

            // 2. Configure Razorpay options
            const options = {
                key: key_id,
                amount: order.amount,
                currency: order.currency,
                name: "CampusConnect Pro",
                description: "Unlock all features",
                order_id: order.id,
                // 3. Define the payment verification callback
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post('/api/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }, { headers: { 'x-auth-token': token } });
                        
                        setMessage(verifyRes.data.message);
                        localStorage.setItem('isSubscribed', 'true'); // Update local status
                        
                        // Close modal and reload page on success
                        setTimeout(() => window.location.reload(), 2000);
                    } catch (err) {
                        setMessage("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: localStorage.getItem('userName') || "Student"
                },
                theme: {
                    color: "#00796b" // Match your theme
                }
            };
            
            // 4. Open the Razorpay checkout
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            setMessage("Failed to create payment order. Please try again.");
        }
    };

    return (
        <div className="ai-modal-overlay" onClick={closeModal}>
            <div className="ai-modal-content" onClick={e => e.stopPropagation()}>
                <button className="ai-close-btn" onClick={closeModal}>&times;</button>
                <h2>Upgrade to Pro</h2>
                <div className="ai-result-box" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--font-med)' }}>Unlock powerful AI features and full PDF access.</p>
                    <ul style={{ textAlign: 'left', margin: '1.5rem 0', lineHeight: '1.8' }}>
                        <li>✅ Full PDF Viewing (Unlimited pages)</li>
                        <li>✅ AI-Powered Summaries</li>
                        <li>✅ AI-Generated Quizzes</li>
                        <li>✅ AI-Generated Q&A</li>
                    </ul>
                    <button className="submit-btn" onClick={handlePayment}>Upgrade Now (₹100)</button>
                    {message && <p className="status-message" style={{ marginTop: '1rem', color: 'white' }}>{message}</p>}
                </div>
            </div>
        </div>
    );
};
export default SubscriptionModal;