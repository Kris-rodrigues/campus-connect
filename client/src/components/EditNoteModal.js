import React, { useState } from 'react';
import axios from 'axios';
import './UploadModal.css'; // Reusing styles

const branches = ['Artificial Intelligence & Machine Learning', 'Computer Science & Engineering', 'Mechanical Engineering', 'Electronics & Communication Engineering', 'Electrical & Electronics Engineering', 'Civil Engineering', 'Computer Science and Business Systems'];
const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
const modules = ['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5'];

const EditNoteModal = ({ note, closeModal, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({ 
        title: note.title, 
        subject: note.subject, 
        description: note.description || '', 
        branch: note.branch, 
        semester: note.semester, 
        module: note.module 
    });
    
    // New state for the optional file update
    const [file, setFile] = useState(null);
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onFileChange = e => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Use FormData to handle potential file upload
        const updateData = new FormData();
        Object.keys(formData).forEach(key => updateData.append(key, formData[key]));
        
        // Only append file if a new one was selected
        if (file) {
            updateData.append('file', file);
        }

        try {
            const token = localStorage.getItem('token');
            setError('');
            setMessage('Saving changes...');

            // Need to set content-type for file upload
            await axios.put(`/api/notes/update/${note._id}`, updateData, { 
                headers: { 
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                } 
            });

            setMessage('Update successful! 🎉');
            onUpdateSuccess();
            setTimeout(() => closeModal(), 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
            setMessage('');
        }
    };

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={closeModal}>&times;</button>
                <h2>Edit Material</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={onChange} required />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Branch</label>
                            <select name="branch" value={formData.branch} onChange={onChange} required>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Semester</label>
                            <select name="semester" value={formData.semester} onChange={onChange} required>
                                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Subject</label>
                            <input type="text" name="subject" value={formData.subject} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label>Module</label>
                            <select name="module" value={formData.module} onChange={onChange} required>
                                {modules.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea name="description" rows="3" value={formData.description} onChange={onChange}></textarea>
                    </div>

                    {/* --- RESTORED FILE INPUT --- */}
                    <div className="form-group">
                        <label>Replace File (Optional)</label>
                        <input type="file" onChange={onFileChange} />
                        <small style={{color:'#aaa', marginTop:'5px', display:'block'}}>
                            Current file: {note.fileName}
                        </small>
                    </div>

                    {message && <p className="status-message success">{message}</p>}
                    {error && <p className="status-message error">{error}</p>}
                    
                    <button type="submit" className="submit-btn">Save Changes</button>
                </form>
            </div>
        </div>
    );
};
export default EditNoteModal;