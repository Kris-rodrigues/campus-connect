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

    const top3 = results.slice(0, 3);
    const rest = results.slice(3);

    return (
        <>
            <Navbar />
            <div className="leaderboard-container">
                <header className="lb-header">
                    <div>
                        <h1>Rankings</h1>
                        <p className="lb-subtitle">Student Leaderboard</p>
                    </div>
                </header>

                {/* Podium */}
                {!loading && top3.length > 0 && (
                    <div className="podium-section">
                        <div className="podium-wrapper">
                            {/* 2nd Place */}
                            {top3.length > 1 && (
                                <div className="podium-item second">
                                    <div className="podium-avatar">
                                        <span className="avatar-placeholder">
                                            {top3[1].user ? top3[1].user.name.charAt(0).toUpperCase() : '?'}
                                        </span>
                                    </div>
                                    <div className="podium-name">{top3[1].user ? top3[1].user.name : 'Unknown'}</div>
                                    <div className="podium-score">{top3[1].score} pts</div>
                                    <div className="podium-block blue">
                                        <span className="podium-rank">2</span>
                                    </div>
                                </div>
                            )}
                            
                            {/* 1st Place */}
                            <div className="podium-item first">
                                <div className="podium-crown">👑</div>
                                <div className="podium-avatar large">
                                    <span className="avatar-placeholder">
                                        {top3[0].user ? top3[0].user.name.charAt(0).toUpperCase() : '?'}
                                    </span>
                                </div>
                                <div className="podium-name">{top3[0].user ? top3[0].user.name : 'Unknown'}</div>
                                <div className="podium-score">{top3[0].score} pts</div>
                                <div className="podium-block dark">
                                    <span className="podium-rank">1</span>
                                </div>
                            </div>

                            {/* 3rd Place */}
                            {top3.length > 2 && (
                                <div className="podium-item third">
                                    <div className="podium-avatar">
                                        <span className="avatar-placeholder">
                                            {top3[2].user ? top3[2].user.name.charAt(0).toUpperCase() : '?'}
                                        </span>
                                    </div>
                                    <div className="podium-name">{top3[2].user ? top3[2].user.name : 'Unknown'}</div>
                                    <div className="podium-score">{top3[2].score} pts</div>
                                    <div className="podium-block red">
                                        <span className="podium-rank">3</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats (students only) */}
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

                {/* Ranked Table */}
                <div className="leaderboard-list">
                    {loading ? <p className="loading-text">Loading scores...</p> : (
                        <table className="lb-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Student</th>
                                    <th>Topic</th>
                                    <th>Score</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rest.map((res, index) => (
                                    <tr key={res._id}>
                                        <td className="rank-cell">
                                            <span className="rank-num">{String(index + 4).padStart(2, '0')}</span>
                                        </td>
                                        <td className="name-cell">
                                            <div className="name-with-avatar">
                                                <span className="table-avatar">
                                                    {res.user ? res.user.name.charAt(0).toUpperCase() : '?'}
                                                </span>
                                                {res.user ? res.user.name : 'Unknown'}
                                                {res.user && res.user.name === currentUserName && !isStaff && <span className="me-badge">You</span>}
                                            </div>
                                        </td>
                                        <td>{res.topicName}</td>
                                        <td className="score-cell">{res.score}/{res.totalQuestions}</td>
                                        <td className="trend-cell">
                                            <span className={`trend-arrow ${index % 3 === 0 ? 'up' : index % 3 === 1 ? 'flat' : 'down'}`}>
                                                {index % 3 === 0 ? '↗' : index % 3 === 1 ? '→' : '↘'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {results.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'2rem'}}>No quiz results yet.</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>

                {results.length > 6 && (
                    <div className="load-more-container">
                        <button className="load-more-btn">Load More ▾</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default LeaderboardPage;