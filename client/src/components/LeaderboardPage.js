import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState(null);
    
    const token = localStorage.getItem('token');
    const currentUserName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole'); 

    // Helper: Check if user is staff (admin or teacher)
    const isStaff = userRole === 'admin' || userRole === 'teacher';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/quiz/all-results', { headers: { 'x-auth-token': token } });
                setResults(res.data);

                // Calculate User Stats only if NOT staff (i.e., only for students)
                if (!isStaff) {
                    const myResults = res.data.filter(r => r.user && r.user.name === currentUserName);
                    const totalQuizzes = myResults.length;
                    const totalScore = myResults.reduce((acc, curr) => acc + curr.score, 0);
                    
                    let highestBadge = 'None';
                    if (myResults.some(r => r.badge === 'Gold')) highestBadge = 'Gold';
                    else if (myResults.some(r => r.badge === 'Silver')) highestBadge = 'Silver';
                    else if (myResults.some(r => r.badge === 'Bronze')) highestBadge = 'Bronze';
                    
                    setUserStats({ totalQuizzes, totalScore, highestBadge });
                }

            } catch (err) {
                console.error("Error fetching leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, currentUserName, userRole, isStaff]);

    const getRankIcon = (index) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return index + 1;
    };

    return (
        <>
            <Navbar />
            <div className="leaderboard-container">
                <header className="lb-header">
                    <h1>🏆 Hall of Fame</h1>
                    <p>Top performers and quiz champions</p>
                </header>

                {/* Conditional Rendering: Only show stats card for STUDENTS */}
                {!isStaff && userStats && (
                    <div className="user-stats-card">
                        <h3>My Stats ({currentUserName})</h3>
                        <div className="stats-row">
                            <div className="stat-item">
                                <span className="stat-val">{userStats.totalQuizzes}</span>
                                <span className="stat-label">Quizzes Taken</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-val">{userStats.totalScore}</span>
                                <span className="stat-label">Total Points</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-val">{userStats.highestBadge === 'None' ? '—' : 
                                    userStats.highestBadge === 'Gold' ? '🥇' :
                                    userStats.highestBadge === 'Silver' ? '🥈' : '🥉'}
                                </span>
                                <span className="stat-label">Best Badge</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="leaderboard-list">
                    {loading ? <p className="loading-text">Loading scores...</p> : (
                        <table className="lb-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Student</th>
                                    <th>Topic</th>
                                    <th>Score</th>
                                    <th>Badge</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((res, index) => (
                                    <tr key={res._id} className={`rank-${index + 1}`}>
                                        <td className="rank-cell">{getRankIcon(index)}</td>
                                        <td className="name-cell">
                                            {res.user ? res.user.name : 'Unknown'}
                                            {/* Highlight "You" only if it's actually the current user (student) */}
                                            {res.user && res.user.name === currentUserName && !isStaff && <span className="me-badge"> (You)</span>}
                                        </td>
                                        <td>{res.topicName}</td>
                                        <td className="score-cell">{res.score}/{res.totalQuestions}</td>
                                        <td>
                                            <span className={`badge-pill ${res.badge.toLowerCase()}`}>
                                                {res.badge}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {results.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'2rem'}}>No quiz results yet.</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default LeaderboardPage;