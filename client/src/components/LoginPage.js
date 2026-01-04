import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [loginType, setLoginType] = useState('student'); // 'student' or 'teacher'
  const [formData, setFormData] = useState({ 
    usn: '', 
    name: '',
    dob: { day: '', month: '', year: '' } 
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onDobChange = e => {
    setFormData({ 
      ...formData, 
      dob: { ...formData.dob, [e.target.name]: e.target.value } 
    });
  };

  const onSubmit = async e => {
    e.preventDefault();
    const { usn, name, dob } = formData;
    
    if (!dob.day || !dob.month || !dob.year) {
      setError('Please select a valid Date of Birth.');
      return;
    }

    const fullDateOfBirth = `${dob.year}-${dob.month}-${dob.day}`;
    
    // Payload depends on login type
    const payload = {
        dateOfBirth: fullDateOfBirth,
        loginType: loginType
    };

    if (loginType === 'student') {
        if(!usn) { setError("USN is required"); return; }
        payload.usn = usn;
    } else {
        if(!name) { setError("Name is required"); return; }
        payload.name = name;
    }

    try {
      const res = await axios.post('/api/auth/login', payload);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.name);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('isSubscribed', res.data.isSubscribed);

      // Teachers get sent to Admin Dashboard
      if (res.data.role === 'admin' || res.data.role === 'teacher') {
        navigate('/admin/dashboard');
      } else {
        navigate('/study-materials');
      }
      window.location.reload();

    } catch (err) {
      setError(err.response?.data?.message || 'Login Failed.');
    }
  };
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: '01', name: 'January' }, { value: '02', name: 'February' },
    { value: '03', name: 'March' }, { value: '04', name: 'April' },
    { value: '05', name: 'May' }, { value: '06', name: 'June' },
    { value: '07', name: 'July' }, { value: '08', name: 'August' },
    { value: '09', name: 'September' }, { value: '10', name: 'October' },
    { value: '11', name: 'November' }, { value: '12', name: 'December' }
  ];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <div className="login-page-layout">
      <div className="welcome-section">
        <div className="logo-container">
          <div className="campus-connect-logo">
            <span className="arrow">↑</span><span className="arrow">↑</span><span className="arrow">↑</span><span className="c-letter">C</span>
          </div>
          <h1 className="logo-text">Campus Connect</h1>
        </div>
        <div className="welcome-content">
          <h2>Welcome to Campus Connect</h2>
          <p>Stay connected with peers, share notes, and access academic resources with ease.</p>
          <div className="connect-succeed-box">
            <h3>Connect. Collaborate. Succeed.</h3>
            <p>Tired of chasing notes? Upload, share, and discover from your friends and classmates — anytime.</p>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <div className="form-container login-form-card">
          <h2 style={{marginBottom:'1rem'}}>Login</h2>
          
          {/* --- TOGGLE BUTTONS --- */}
          <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
            <button 
                style={{flex:1, padding:'10px', borderRadius:'5px', border:'none', cursor:'pointer', backgroundColor: loginType==='student' ? '#00796b' : '#eee', color: loginType==='student' ? 'white':'#333', fontWeight:'bold'}}
                onClick={() => setLoginType('student')}
            >Student</button>
            <button 
                style={{flex:1, padding:'10px', borderRadius:'5px', border:'none', cursor:'pointer', backgroundColor: loginType==='teacher' ? '#00796b' : '#eee', color: loginType==='teacher' ? 'white':'#333', fontWeight:'bold'}}
                onClick={() => setLoginType('teacher')}
            >Teacher</button>
          </div>

          <form onSubmit={onSubmit}>
            {loginType === 'student' ? (
                <div className="form-group">
                <label htmlFor="usn">Username (USN)</label>
                <input 
                    type="text" id="usn" name="usn" placeholder="4SO..." 
                    value={formData.usn} onChange={onChange} required 
                />
                </div>
            ) : (
                <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                    type="text" id="name" name="name" placeholder="Enter Name" 
                    value={formData.name} onChange={onChange} required 
                />
                </div>
            )}
            
            <div className="form-group">
              <label>Date of Birth</label>
              <div className="dob-select-container">
                <select name="day" value={formData.dob.day} onChange={onDobChange} required>
                  <option value="" disabled>Day</option>
                  {days.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
                <select name="month" value={formData.dob.month} onChange={onDobChange} required>
                  <option value="" disabled>Month</option>
                  {months.map(month => <option key={month.value} value={month.value}>{month.name}</option>)}
                </select>
                <select name="year" value={formData.dob.year} onChange={onDobChange} required>
                  <option value="" disabled>Year</option>
                  {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="forgot-password-and-login">
                <a href="#" className="forgot-password-link">Forgot Password?</a>
                <button type="submit" className="btn login-btn">LOGIN</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;