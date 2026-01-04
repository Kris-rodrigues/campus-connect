import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole');

  // Helper check
  const isAdminOrTeacher = userRole === 'admin' || userRole === 'teacher';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isSubscribed');
    navigate('/login');
    window.location.reload();
  };

  if (!token) {
    return null;
  }

  const dashboardPath = isAdminOrTeacher ? '/admin/dashboard' : '/study-materials';

  return (
    <nav className="main-navbar">
      <div className="navbar-left">
        <NavLink to={dashboardPath} className="navbar-brand">
          <div className="campus-connect-logo-small">
            <span className="arrow">↑</span><span className="arrow">↑</span><span className="arrow">↑</span><span className="c-letter">C</span>
          </div>
          CampusConnect
        </NavLink>
        
        <div className="navbar-links">
          {isAdminOrTeacher ? (
            // --- ADMIN & TEACHER LINKS ---
            <>
              <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink>
              <NavLink to="/study-materials" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Study Materials</NavLink>
              <NavLink to="/leaderboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Leaderboard</NavLink>
            </>
          ) : (
            // --- STUDENT LINKS ---
            <>
              <NavLink to="/study-materials" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Study Materials</NavLink>
              <NavLink to="/leaderboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Leaderboard</NavLink>
            </>
          )}
        </div>
      </div>

      <div className="navbar-right">
        <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <span className="user-avatar">👤</span>
          <span>{userName} {isAdminOrTeacher ? `(${userRole})` : ''}</span>
          <span className="dropdown-arrow">▼</span>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <a href="#profile">Profile</a>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;