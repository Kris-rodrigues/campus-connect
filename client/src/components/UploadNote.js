import React, { useState } from 'react';
import axios from 'axios';

const UploadNote = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState({ title: '', subject: '', description: '' });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { title, subject, description } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onFileChange = e => setFile(e.target.files[0]);

  const onSubmit = async e => {
    e.preventDefault();
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('title', title);
    uploadData.append('subject', subject);
    uploadData.append('description', description);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/notes/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token,
        },
      });
      setMessage(res.data.message);
      setError('');
      setFormData({ title: '', subject: '', description: '' }); // Reset form
      setFile(null);
      document.getElementById('file-input').value = ''; // Reset file input
      onUploadSuccess(); // Callback to refresh the notes list
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
      setMessage('');
    }
  };

  return (
    <div className="form-container" style={{ marginBottom: '2rem' }}>
      <h2>Upload New Study Material</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" value={title} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Subject</label>
          <input type="text" name="subject" value={subject} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={description} onChange={onChange}></textarea>
        </div>
        <div className="form-group">
          <label>File</label>
          <input type="file" id="file-input" onChange={onFileChange} required />
        </div>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn">UPLOAD</button>
      </form>
    </div>
  );
};

export default UploadNote;