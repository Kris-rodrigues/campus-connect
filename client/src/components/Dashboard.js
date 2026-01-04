import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import NoteCard from './NoteCard';
import ViewPdfModal from './ViewPdfModal';
import UploadModal from './UploadModal';
import AiModal from './AiModal';
import SubscriptionModal from './SubscriptionModal';
import TestModal from './TestModal'; // 1. Ensure TestModal is imported
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
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin' || userRole === 'teacher';
    const isSubscribed = localStorage.getItem('isSubscribed') === 'true';

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
        setNoteIdForAI(noteId); // 1. Set the Note ID here
        setAiMode(mode);
        setAiLoading(true);
        setAiContent('');
        setIsAiModalOpen(true); 

        // Find the note to get the subject/title for the quiz topic
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

    const UpgradeCard = () => (
        <div className="upgrade-card">
            <h3>🚀 Unlock All Features</h3>
            <p>Get full PDF access and AI-powered study tools by upgrading to Pro.</p>
            <button className="upgrade-btn" onClick={handlePaywall}>
                Upgrade Now
            </button>
        </div>
    );

    return (
        <>
             <Navbar />
             {/* Modals */}
             {fileToView && <ViewPdfModal noteId={fileToView} closeModal={() => setFileToView(null)} />}
             {isAdmin && isUploadModalOpen && <UploadModal closeModal={() => setIsUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} />}
             
             {/* AI Modal (Summary/Loading) */}
             {isAiModalOpen && <AiModal mode={aiMode} content={aiContent} isLoading={aiLoading} closeModal={() => setIsAiModalOpen(false)} />}
             
             {/* Test Modal (Quiz) - FIXED: Passing noteId and topicName */}
             {isTestModalOpen && quizData && 
                <TestModal 
                    quizData={quizData} 
                    noteId={noteIdForAI}  // <--- This was likely missing
                    topicName={quizTopicName} // <--- This was likely missing
                    closeModal={() => setIsTestModalOpen(false)} 
                />
             }
             
             {isPaywallOpen && <SubscriptionModal closeModal={() => setIsPaywallOpen(false)} />}

             <div className="dashboard-container">
                 <header className="dashboard-header">
                    <h1>Study Materials</h1>
                    {isAdmin && ( <button className="share-btn" onClick={() => setIsUploadModalOpen(true)}>Share Material</button> )}
                 </header>

                <main className="notes-grid">
                    {loading ? <p className="status-message">Loading notes...</p> : error ? <p className="status-message error">{error}</p> : notes.length === 0 ? <p className="status-message">No notes shared yet.</p> : (
                        <>
                            {!isAdmin && !isSubscribed && <UpgradeCard />}
                            {notes.map(note => (
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
                            ))
                            }
                        </>
                    )}
                </main>
            </div>
        </>
    );
};
export default Dashboard;