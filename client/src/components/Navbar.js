import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AiAssistantModal from './AiAssistantModal';
import './Navbar.css';

const Navbar = ({ onSearch }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  
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

  const handleSearchChange = (e) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const notifications = [
    { id: 1, title: 'New Course Material', time: '2 hours ago' },
    { id: 2, title: 'Your quiz results are ready', time: '1 day ago' },
    { id: 3, title: 'AI summary completed', time: '3 days ago' },
  ];

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
            <button className="sidebar-ai-btn" onClick={() => setShowAiAssistant(true)}>
              <span className="ai-icon">✦</span>
              AI Study Assistant
            </button>
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
        </div>
        <div className="topbar-right">
          <div className="topbar-search">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
                type="text" 
                placeholder="Search courses, notes..." 
                className="search-input" 
                onChange={handleSearchChange} 
            />
          </div>
          <div style={{ position: 'relative' }}>
              <button 
                className="topbar-icon-btn" 
                title="Notifications" 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setDropdownOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              </button>
              {showNotifications && (
                  <div className="notifications-dropdown">
                      <div className="dropdown-header">
                          <span className="dropdown-name">Notifications</span>
                      </div>
                      <div className="dropdown-divider"></div>
                      <div className="notifications-list">
                          {notifications.map(n => (
                              <div key={n.id} className="notification-item">
                                  <p className="notification-title">{n.title}</p>
                                  <p className="notification-time">{n.time}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
          <div 
            className="topbar-avatar" 
            title={userName}
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setShowNotifications(false);
            }}
          >
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

      {/* AI Study Assistant Modal */}
      {showAiAssistant && (
        <AiAssistantModal closeModal={() => setShowAiAssistant(false)} />
      )}
    </>
  );
};

export default Navbar;