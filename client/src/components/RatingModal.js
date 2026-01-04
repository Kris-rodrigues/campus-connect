import React, { useState } from 'react';
import axios from 'axios';
import './RatingModal.css'; // We'll create this CSS file
import './AiModal.css'; // Reuse some styles from AiModal

const RatingModal = ({ noteId, closeModal, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setMessage('Please select a star rating.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/notes/${noteId}/rate`, 
                { rating, comment },
                { headers: { 'x-auth-token': token } }
            );
            setMessage('Review submitted successfully!');
            onReviewSubmitted(); // Tell the parent to refresh
            setTimeout(() => closeModal(), 1500);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to submit review.');
        }
    };

    return (
        <div className="ai-modal-overlay" onClick={closeModal}>
            <div className="ai-modal-content" onClick={e => e.stopPropagation()}>
                <button className="ai-close-btn" onClick={closeModal}>&times;</button>
                <h2>Rate this Note</h2>
                <form onSubmit={handleSubmit} className="rating-form">
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={star <= (hoverRating || rating) ? 'star-filled' : 'star-empty'}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <textarea
                        rows="4"
                        placeholder="Add an optional comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <button typeclassName="submit-btn">Submit Review</button>
                    {message && <p className="status-message" style={{ marginTop: '1rem', color: 'white' }}>{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default RatingModal;