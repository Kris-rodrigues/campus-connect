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
      {/* ====== Left Panel — Yellow Branding ====== */}
      <div className="welcome-section">
        <div className="logo-container">
          <div className="campus-connect-logo">
            <span className="c-letter">⬡</span>
          </div>
          <h1 className="logo-text">Campus Connect</h1>
        </div>

        <div className="welcome-content">
          <h2>Empowering Modern <span style={{color: 'var(--accent-red)'}}>Education</span></h2>
          <p>Join the next generation academic hub. Access AI study assistants, track progress, and connect with peers seamlessly.</p>
          
          <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
            <div className="connect-succeed-box" style={{flex: 1}}>
              <h3>🤖 AI Assistant</h3>
              <p>Personalized study guidance</p>
            </div>
            <div className="connect-succeed-box" style={{flex: 1}}>
              <h3>📊 Leaderboard</h3>
              <p>Track your academic standing</p>
            </div>
          </div>
        </div>

        <div style={{position: 'relative', zIndex: 2, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dark)'}}>
          © 2024 Campus Connect Inc.
        </div>
      </div>

      {/* ====== Right Panel — Login Form ====== */}
      <div className="login-form-section">
        <div className="form-container login-form-card">
          <h2>Welcome Back</h2>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-medium)',
            marginBottom: '2rem',
            borderLeft: '3px solid var(--text-dark)',
            paddingLeft: '0.75rem'
          }}>Please enter your details to sign in.</p>
          
          {/* --- TOGGLE BUTTONS --- */}
          <div style={{
            display: 'flex', 
            gap: '0', 
            marginBottom: '2rem',
            border: '2px solid var(--border-dark)'
          }}>
            <button 
                style={{
                  flex: 1, 
                  padding: '0.75rem 1rem', 
                  border: 'none', 
                  cursor: 'pointer', 
                  backgroundColor: loginType === 'student' ? 'var(--bg-dark)' : 'var(--bg-white)', 
                  color: loginType === 'student' ? 'var(--text-on-dark)' : 'var(--text-dark)', 
                  fontWeight: 700,
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  transition: 'all 150ms ease'
                }}
                onClick={() => setLoginType('student')}
            >Student</button>
            <button 
                style={{
                  flex: 1, 
                  padding: '0.75rem 1rem', 
                  border: 'none',
                  borderLeft: '2px solid var(--border-dark)', 
                  cursor: 'pointer', 
                  backgroundColor: loginType === 'teacher' ? 'var(--bg-dark)' : 'var(--bg-white)', 
                  color: loginType === 'teacher' ? 'var(--text-on-dark)' : 'var(--text-dark)', 
                  fontWeight: 700,
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  transition: 'all 150ms ease'
                }}
                onClick={() => setLoginType('teacher')}
            >Teacher</button>
          </div>

          <form onSubmit={onSubmit}>
            {loginType === 'student' ? (
                <div className="form-group">
                <label htmlFor="usn">USN</label>
                <input 
                    type="text" id="usn" name="usn" placeholder="Enter your USN" 
                    value={formData.usn} onChange={onChange} required 
                />
                </div>
            ) : (
                <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                    type="text" id="name" name="name" placeholder="Enter your full name" 
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
                <button type="submit" className="btn login-btn">LOG IN</button>
            </div>

            <p style={{
              textAlign: 'center', 
              marginTop: '1.5rem', 
              fontSize: '0.9rem', 
              color: 'var(--text-medium)'
            }}>
              Don't have an account? <span style={{fontWeight: 700, color: 'var(--text-dark)', cursor: 'pointer'}}>Sign up</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;