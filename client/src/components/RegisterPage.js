import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', usn: '', dateOfBirth: '', branch: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', formData);
      setMessage(res.data.message);
      setError('');
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
    } catch (err) {
      setError(err.response?.data?.message || 'Registration Failed');
      setMessage('');
    }
  };

  return (
    <div className="form-container">
      <h2>Create an Account</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="name" onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>USN</label>
          <input type="text" name="usn" onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Date of Birth</label>
          <input type="date" name="dateOfBirth" onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Branch</label>
          <input type="text" name="branch" onChange={onChange} required />
        </div>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn">REGISTER</button>
      </form>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
};

export default RegisterPage;