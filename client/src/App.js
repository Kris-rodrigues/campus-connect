import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import StudyMaterialsPage from './components/StudyMaterialsPage';
import AdminDashboard from './components/AdminDashboard';
import LeaderboardPage from './components/LeaderboardPage';
import './App.css'; 

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  // Helper check for admin privileges
  const isAdminOrTeacher = role === 'admin' || role === 'teacher';

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/study-materials" element={token ? <StudyMaterialsPage /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={token ? <LeaderboardPage /> : <Navigate to="/login" />} />
          
          {/* --- UPDATE THIS ROUTE --- */}
          {/* Allow both Admin and Teacher to access the dashboard */}
          <Route 
            path="/admin/dashboard" 
            element={token && isAdminOrTeacher ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
          
          {/* --- UPDATE DEFAULT ROUTE --- */}
          <Route 
            path="/" 
            element={
              <Navigate to={
                token 
                  ? (isAdminOrTeacher ? '/admin/dashboard' : '/study-materials') 
                  : "/login"
              } />
            } 
          />
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;