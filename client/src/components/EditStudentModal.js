import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UploadModal.css'; // Reusing modal styles

const EditStudentModal = ({ student, closeModal, onUpdateSuccess, isAdmin }) => {
    const [formData, setFormData] = useState({
        name: '',
        usn: '',
        branch: '',
        dateOfBirth: ''
    });
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || '',
                usn: student.usn || '',
                branch: student.branch || '',
                dateOfBirth: student.dateOfBirth ? student.dateOfBirth.substring(0, 10) : ''
            });
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        const token = localStorage.getItem('token');
        try {
            const dataToSubmit = { ...formData };
            if (!isAdmin) {
                delete dataToSubmit.dateOfBirth;
            }
            await axios.put(`/api/users/edit-student/${student._id}`, dataToSubmit, {
                headers: { 'x-auth-token': token }
            });
            onUpdateSuccess();
            closeModal();
        } catch (error) {
            console.error("Error updating student:", error);
            setMessage(error.response?.data?.message || 'Error updating student.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={closeModal}>&times;</button>
                <h2>Edit Student</h2>
                
                <form className="upload-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>USN</label>
                        <input type="text" name="usn" value={formData.usn} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Branch</label>
                        <input type="text" name="branch" value={formData.branch} onChange={handleChange} required />
                    </div>

                    {isAdmin && (
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                        </div>
                    )}

                    {message && <p className="status-message error">{message}</p>}
                    
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Student'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditStudentModal;
