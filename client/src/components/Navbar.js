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

  return (
    <>
      {/* ====== Sidebar ====== */}
      <aside className="bauhaus-sidebar">
        <div className="sidebar-top">
          {/* Brand */}
          <div className="sidebar-brand">
            <div className="brand-icon">⬡</div>
            <div className="brand-text">
              <span className="brand-name">Campus Connect</span>
              <span className="brand-sub">Modern LMS</span>
            </div>
          </div>

          {/* AI Button (for students) */}
          {!isAdminOrTeacher && (
            <NavLink to="/study-materials" className="sidebar-ai-btn">
              <span className="ai-icon">✦</span>
              AI Study Assistant
            </NavLink>
          )}

          {/* Navigation */}
          <nav className="sidebar-nav">
            {isAdminOrTeacher ? (
              <>
                <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Dashboard
                </NavLink>
                <NavLink to="/study-materials" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                  Library
                </NavLink>
                <NavLink to="/leaderboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                  Leaderboard
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Dashboard
                </NavLink>
                <NavLink to="/study-materials" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                  Library
                </NavLink>
                <NavLink to="/leaderboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                  Leaderboard
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-divider"></div>
          <button className="sidebar-link settings-link" onClick={() => {}}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            Settings
          </button>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ====== Top Bar ====== */}
      <header className="bauhaus-topbar">
        <div className="topbar-left">
          <span className="topbar-brand">Campus Connect</span>
          {isAdminOrTeacher && (
            <nav className="topbar-nav">
              <NavLink to="/admin/dashboard" className={({ isActive }) => `topbar-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
              <NavLink to="/study-materials" className={({ isActive }) => `topbar-link ${isActive ? 'active' : ''}`}>Users</NavLink>
              <NavLink to="/leaderboard" className={({ isActive }) => `topbar-link ${isActive ? 'active' : ''}`}>System</NavLink>
            </nav>
          )}
        </div>
        <div className="topbar-right">
          <div className="topbar-search">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search courses, notes..." className="search-input" />
          </div>
          <button className="topbar-icon-btn" title="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </button>
          <div className="topbar-avatar" onClick={() => setDropdownOpen(!dropdownOpen)} title={userName}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {dropdownOpen && (
              <div className="topbar-dropdown">
                <div className="dropdown-header">
                  <span className="dropdown-name">{userName}</span>
                  <span className="dropdown-role">{userRole}</span>
                </div>
                <div className="dropdown-divider"></div>
                <button onClick={() => { setDropdownOpen(false); }}>Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;