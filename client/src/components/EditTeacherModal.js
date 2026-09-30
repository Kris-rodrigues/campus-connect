import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UploadModal.css'; 

const EditTeacherModal = ({ teacher, closeModal, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        branch: '',
        dateOfBirth: ''
    });
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (teacher) {
            setFormData({
                name: teacher.name || '',
                branch: teacher.branch || '',
                dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.substring(0, 10) : ''
            });
        }
    }, [teacher]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        const token = localStorage.getItem('token');
        try {
            await axios.put(`/api/users/edit-teacher/${teacher._id}`, formData, {
                headers: { 'x-auth-token': token }
            });
            onUpdateSuccess();
            closeModal();
        } catch (error) {
            console.error("Error updating teacher:", error);
            setMessage(error.response?.data?.message || 'Error updating teacher.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={closeModal}>&times;</button>
                <h2>Edit Teacher</h2>
                
                <form className="upload-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Branch</label>
                        <input type="text" name="branch" value={formData.branch} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                    </div>

                    {message && <p className="status-message error">{message}</p>}
                    
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Teacher'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditTeacherModal;
