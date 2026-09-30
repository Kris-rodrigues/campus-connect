import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import NoteCard from './NoteCard';
import ViewPdfModal from './ViewPdfModal';
import UploadModal from './UploadModal';
import AiModal from './AiModal';
import SubscriptionModal from './SubscriptionModal';
import TestModal from './TestModal';
import './Dashboard.css';

const Dashboard = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [fileToView, setFileToView] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiMode, setAiMode] = useState('');
    const [aiContent, setAiContent] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [noteIdForAI, setNoteIdForAI] = useState(null);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    
    // Test Modal State
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [quizTopicName, setQuizTopicName] = useState('');

    // User info
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName') || 'Student';
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin' || userRole === 'teacher';
    const isSubscribed = localStorage.getItem('isSubscribed') === 'true';

    const [stats, setStats] = useState({ avgScore: 0, quizzesTaken: 0, streak: 0 });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Load mock stats from localStorage or initialize them
        const storedStats = localStorage.getItem('userStats');
        if (storedStats) {
            setStats(JSON.parse(storedStats));
        } else {
            const initialStats = { avgScore: 85, quizzesTaken: 12, streak: 5 };
            localStorage.setItem('userStats', JSON.stringify(initialStats));
            setStats(initialStats);
        }
    }, []);

    const fetchNotes = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await axios.get('/api/notes', { headers: { 'x-auth-token': token } });
            setNotes(res.data);
        } catch (err) { setError('Failed to fetch notes.'); }
        finally { setLoading(false); }
    }, [token]);

    useEffect(() => { fetchNotes(); }, [fetchNotes]);

    const handleUploadSuccess = () => fetchNotes();

     // --- AI Feature Handlers ---
    const handleAiFeature = async (noteId, mode) => {
        setNoteIdForAI(noteId);
        setAiMode(mode);
        setAiLoading(true);
        setAiContent('');
        setIsAiModalOpen(true); 

        const note = notes.find(n => n._id === noteId);
        const topic = note ? `${note.subject} - ${note.title}` : 'General Quiz';
        setQuizTopicName(topic);

        let url = '';
        if (mode === 'summary') url = `/api/ai/summarize/${noteId}`;
        else if (mode === 'quiz') url = `/api/ai/quiz/${noteId}`;
        else { setIsAiModalOpen(false); return; }

        try {
            const res = await axios.post(url, {}, { headers: { 'x-auth-token': token } });
            
            if (mode === 'quiz') {
                setQuizData(res.data.quiz);
                setIsAiModalOpen(false); 
                setIsTestModalOpen(true);
            } else {
                if (mode === 'summary') setAiContent(res.data.summary);
            }
        } catch (err) {
             console.error(`Error during AI ${mode} feature:`, err);
             setAiContent(err.response?.data?.message || `Could not generate ${mode}.`);
        }
        finally { setAiLoading(false); }
    };

    const handleSummarize = (noteId) => handleAiFeature(noteId, 'summary');
    const handleQuiz = (noteId) => handleAiFeature(noteId, 'quiz');
    const handleChat = null; // Chat is handled inside ViewPdfModal

    const handlePaywall = () => setIsPaywallOpen(true);
    const handleViewFile = (noteId) => setFileToView(noteId);

    const recentNotes = notes.slice(0, 2);
    const recommendedNote = notes.length > 2 ? notes[2] : notes[0];

    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
             <Navbar onSearch={setSearchQuery} />
             {/* Modals */}
             {fileToView && <ViewPdfModal noteId={fileToView} closeModal={() => setFileToView(null)} />}
             {isAdmin && isUploadModalOpen && <UploadModal closeModal={() => setIsUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} />}
             {isAiModalOpen && <AiModal mode={aiMode} content={aiContent} isLoading={aiLoading} closeModal={() => setIsAiModalOpen(false)} />}
             {isTestModalOpen && quizData && 
                <TestModal 
                    quizData={quizData} 
                    noteId={noteIdForAI}
                    topicName={quizTopicName}
                    closeModal={() => setIsTestModalOpen(false)} 
                />
             }
             {isPaywallOpen && <SubscriptionModal closeModal={() => setIsPaywallOpen(false)} />}

             <div className="dashboard-container">
                 {/* Welcome Banner */}
                 <div className="dashboard-welcome">
                    <div className="welcome-text">
                        <h1>Welcome back, {userName}</h1>
                        <p>You have {notes.length} study materials available. Keep up the good work!</p>
                    </div>
                    {isAdmin && (
                        <button className="resume-study-btn" onClick={() => setIsUploadModalOpen(true)}>
                            Upload Material
                        </button>
                    )}
                 </div>

                 <div className="dashboard-grid">
                    {/* Main Content */}
                    <div className="dashboard-main">
                        {/* Recent Activity */}
                        <section className="dashboard-section">
                            <h2 className="section-title">Recent Activity</h2>
                            <div className="activity-cards">
                                {loading ? (
                                    <div className="status-card"><p>Loading notes...</p></div>
                                ) : error ? (
                                    <div className="status-card error"><p>{error}</p></div>
                                ) : recentNotes.length === 0 ? (
                                    <div className="status-card"><p>No recent activity yet.</p></div>
                                ) : (
                                    recentNotes.map(note => (
                                        <div key={note._id} className="activity-card" onClick={() => handleViewFile(note._id)}>
                                            <div className="activity-icon">📄</div>
                                            <div className="activity-info">
                                                <h4>{note.title}</h4>
                                                <p>{note.subject}</p>
                                            </div>
                                            <div className="activity-dashed"></div>
                                            <span className="activity-time">Recent</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Recommended */}
                        {recommendedNote && (
                            <section className="dashboard-section">
                                <h2 className="section-title">Recommended for You <span className="ai-sparkle">✦</span></h2>
                                <div className="recommended-card">
                                    <div className="recommended-content">
                                        <h3>{recommendedNote.title}</h3>
                                        <p>{recommendedNote.description || `Based on your recent activity, we suggest reviewing ${recommendedNote.subject}.`}</p>
                                        <button className="ai-tutor-btn" onClick={() => handleViewFile(recommendedNote._id)}>
                                            ⬡ Start AI Tutor Session
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* All Notes Grid */}
                        {!loading && notes.length > 0 && (
                            <section className="dashboard-section">
                                <h2 className="section-title">All Materials</h2>
                                <div className="notes-grid">
                                    {!isAdmin && !isSubscribed && (
                                        <div className="upgrade-card">
                                            <h3>🚀 Unlock All Features</h3>
                                            <p>Get full PDF access and AI-powered study tools by upgrading to Pro.</p>
                                            <button className="upgrade-btn" onClick={handlePaywall}>Upgrade Now</button>
                                        </div>
                                    )}
                                    {filteredNotes.map(note => (
                                        <NoteCard
                                            key={note._id}
                                            note={note}
                                            onViewFile={handleViewFile}
                                            isAdmin={isAdmin}
                                            onSummarize={handleSummarize}
                                            onQuiz={handleQuiz}
                                            onChat={handleChat}
                                            onPaywall={handlePaywall}
                                            onEdit={() => {}}
                                            onDelete={() => {}}
                                        />
                                    ))}
                                    {filteredNotes.length === 0 && (
                                        <div className="status-card"><p>No materials found matching your search.</p></div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Performance Sidebar */}
                    <aside className="dashboard-aside">
                        <div className="perf-card">
                            <h3 className="perf-title">Performance</h3>
                            <div className="perf-score">
                                <span className="perf-label">Average Quiz Score</span>
                                <span className="perf-value">{stats.avgScore}%</span>
                            </div>
                            <div className="perf-bar">
                                <div className="perf-bar-fill" style={{width: `${stats.avgScore}%`}}></div>
                            </div>
                        </div>
                        <div className="stat-mini-card blue">
                            <div className="stat-mini-icon">📋</div>
                            <div>
                                <span className="stat-mini-label">Quizzes Taken</span>
                                <span className="stat-mini-value">{stats.quizzesTaken}</span>
                            </div>
                        </div>
                        <div className="stat-mini-card red">
                            <div className="stat-mini-icon">🔥</div>
                            <div>
                                <span className="stat-mini-label">Current Streak</span>
                                <span className="stat-mini-value">{stats.streak} Days</span>
                            </div>
                        </div>
                    </aside>
                 </div>

                 {/* Footer */}
                 <footer className="dashboard-footer">
                    <span>© 2024 Campus Connect. Empowering Education.</span>
                    <div className="footer-links">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="#access">Accessibility</a>
                        <a href="#support">Contact Support</a>
                    </div>
                 </footer>
             </div>
        </>
    );
};
export default Dashboard;