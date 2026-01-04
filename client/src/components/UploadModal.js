import React, { useState } from 'react';
import axios from 'axios';
import './UploadModal.css';

// --- Data for dropdowns ---
const branches = ['Artificial Intelligence & Machine Learning', 'Computer Science & Engineering', 'Mechanical Engineering', 'Electronics & Communication Engineering', 'Electrical & Electronics Engineering', 'Civil Engineering', 'Computer Science and Business Systems'];
const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
const modules = ['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5'];

const UploadModal = ({ closeModal, onUploadSuccess }) => {
    const [formData, setFormData] = useState({ 
        title: '', 
        subject: '', 
        description: '', 
        branch: '', 
        semester: '', 
        module: '' 
    });
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onFileChange = e => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !formData.branch || !formData.semester || !formData.module) {
            setError('Please fill in all fields and select a file.');
            return;
        }

        const uploadData = new FormData();
        Object.keys(formData).forEach(key => uploadData.append(key, formData[key]));
        uploadData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            setError('');
            setMessage('Uploading...');

            await axios.post('/api/notes/upload', uploadData, { 
                headers: { 
                    'Content-Type': 'multipart/form-data', 
                    'x-auth-token': token 
                } 
            });

            setMessage('Upload successful! 🎉');
            onUploadSuccess();
            
            setTimeout(() => closeModal(), 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed.');
            setMessage('');
        }
    };

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={closeModal}>&times;</button>
                <h2>Share New Material</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" onChange={onChange} required />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Branch</label>
                            <select name="branch" value={formData.branch} onChange={onChange} required>
                                <option value="" disabled>Select Branch</option>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Semester</label>
                            <select name="semester" value={formData.semester} onChange={onChange} required>
                                <option value="" disabled>Select Semester</option>
                                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            {/* THIS IS THE CHANGED PART */}
                            <label>Subject</label>
                            <input type="text" name="subject" value={formData.subject} onChange={onChange} placeholder="e.g., Data Structures" required />
                        </div>
                        <div className="form-group">
                            <label>Module</label>
                            <select name="module" value={formData.module} onChange={onChange} required>
                                <option value="" disabled>Select Module</option>
                                {modules.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea name="description" rows="3" onChange={onChange}></textarea>
                    </div>

                    <div className="form-group">
                        <label>File</label>
                        <input type="file" onChange={onFileChange} required />
                    </div>

                    {message && <p className="status-message success">{message}</p>}
                    {error && <p className="status-message error">{error}</p>}
                    
                    <button type="submit" className="submit-btn">Upload to Hub</button>
                </form>
            </div>
        </div>
    );
};
export default UploadModal;