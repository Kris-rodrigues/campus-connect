import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ViewPdfModal.css';
import RatingModal from './RatingModal';
import TestModal from './TestModal'; // Import TestModal

const ViewPdfModal = ({ noteId, closeModal }) => {
    // ... (all state variables remain the same) ...
    const [pdfSrc, setPdfSrc] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(true);
    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
    const [isChatVisible, setIsChatVisible] = useState(false);
    
    // New states for MCQ Quiz
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const isSubscribed = localStorage.getItem('isSubscribed') === 'true';
    
    // Helper to check if user is staff (admin or teacher)
    const isStaff = userRole === 'admin' || userRole === 'teacher';
    
    // Chat logic (Premium or Staff only)
    const canChat = isStaff || isSubscribed;

    const pdfSrcRef = useRef(null);

    useEffect(() => {
        const fetchPdf = async () => {
            try {
                const response = await axios.get(`/api/notes/view/${noteId}`, {
                    headers: { 'x-auth-token': token },
                    responseType: 'blob' 
                });
                const file = new Blob([response.data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                pdfSrcRef.current = fileURL;
                setPdfSrc(fileURL);
            } catch (error) { console.error("Error fetching PDF:", error); }
            finally { setLoadingPdf(false); }
        };

        const fetchChatHistory = async () => {
            if (canChat) {
                try {
                    const res = await axios.get(`/api/ai/chat/${noteId}`, {
                        headers: { 'x-auth-token': token }
                    });
                    setMessages(res.data);
                } catch (err) {
                    setMessages([{ sender: 'ai', text: 'Hello! Ask me any question about this document.' }]);
                }
            }
        };

        if (noteId) {
            fetchPdf();
            fetchChatHistory();
        }
        return () => { if (pdfSrcRef.current) URL.revokeObjectURL(pdfSrcRef.current); };
    }, [noteId, token, canChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isChatVisible]);

    const sendMessage = async (text) => { /* ... (unchanged) ... */ 
        if (!text.trim()) return;
        setMessages(prev => [...prev, { sender: 'user', text: text }]);
        setIsLoadingAnswer(true);
        try {
            const res = await axios.post(`/api/ai/chat/${noteId}`, 
                { question: text }, 
                { headers: { 'x-auth-token': token } }
            );
            setMessages(prev => [...prev, { sender: 'ai', text: res.data.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, { sender: 'ai', text: 'Error: Could not get response.' }]);
        } finally { setIsLoadingAnswer(false); }
    };

    const handleSend = (e) => { e.preventDefault(); sendMessage(input); setInput(''); };

    const handleQuickAction = async (action) => {
        if (action === 'quiz') {
            setIsGeneratingQuiz(true);
            setMessages(prev => [...prev, { sender: 'ai', text: 'Generating a multiple-choice quiz from this document...' }]);
            try {
                const res = await axios.post(`/api/ai/quiz/${noteId}`, {}, {
                    headers: { 'x-auth-token': token }
                });
                setQuizData(res.data.quiz);
                setIsTestModalOpen(true);
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Error generating quiz.';
                setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
            } finally {
                setIsGeneratingQuiz(false);
            }
            return; // Don't send a chat message for quiz
        }
        
        let prompt = "";
        if (action === 'summary') prompt = "Can you summarize this document for me?";
        if (action === 'concepts') prompt = "What are the key concepts in this document?";
        
        if (prompt) {
            sendMessage(prompt);
        }
    };

    return (
        <>
            <div className="pdf-modal-overlay" onClick={closeModal}>
                <div className={`pdf-modal-content ${canChat && isChatVisible ? 'split-view' : 'full-view'}`} onClick={e => e.stopPropagation()}>
                    
                    {/* Toolbar row: Rate button + spacer + Chat toggle + Close */}
                    <div className="pdf-toolbar">
                        {!isStaff && (
                            <button className="pdf-rate-btn" onClick={() => setIsRatingOpen(true)}>⭐ Rate Note</button>
                        )}
                        <div className="pdf-toolbar-spacer"></div>
                        {/* Chat toggle button is always shown */}
                        {!isChatVisible && (
                            <button className="floating-chat-btn" onClick={() => setIsChatVisible(true)} title="Open AI Tutor">
                                💬 AI Tutor ✦
                            </button>
                        )}
                        <button className="pdf-close-btn" onClick={closeModal}>&times;</button>
                    </div>
                    
                    <div className="pdf-view-container">
                        {loadingPdf ? (
                            <p style={{color: 'white', textAlign: 'center', paddingTop: '20%'}}>Loading PDF...</p>
                        ) : pdfSrc ? (
                            <iframe src={`${pdfSrc}#toolbar=0&navpanes=0`} title="PDF Viewer" width="100%" height="100%" />
                        ) : (
                            <p style={{color: 'white', textAlign: 'center', paddingTop: '20%'}}>Failed to load PDF.</p>
                        )}
                    </div>

                    {/* Chat Sidebar Always renders if toggled, but content depends on subscription */}
                    {isChatVisible && (
                        <div className={`chat-container ${!canChat ? 'locked' : ''}`}>
                            <div className="chat-header">
                                <h3>AI Tutor ✦</h3>
                                <button className="chat-minimize-btn" onClick={() => setIsChatVisible(false)} title="Minimize Chat">➖</button>
                            </div>
                            
                            {!canChat && (
                                <div className="chat-paywall-overlay">
                                    <div className="chat-paywall-content">
                                        <span className="lock-icon">🔒</span>
                                        <h4>Premium Feature</h4>
                                        <p>Unlock the AI Tutor to chat with this document, generate summaries, and take smart quizzes.</p>
                                        <button className="upgrade-tutor-btn" onClick={() => {/* Handle open subscription modal */}}>
                                            Upgrade to Pro
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className={`chat-message-area ${!canChat ? 'blurred' : ''}`}>
                                {messages.map((msg, index) => (
                                    <div key={index} className={`chat-message ${msg.sender} markdown-body`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.sender === 'ai' ? (msg.text || '').replace(/\$\$(.*?)\$\$/g, '$1').replace(/\$(.*?)\$/g, '$1').replace(/\\times/g, '×').replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '($1/$2)') : msg.text}</ReactMarkdown>
                                    </div>
                                ))}
                                {isLoadingAnswer && <div className="chat-message ai loading"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className={`quick-actions ${!canChat ? 'blurred disabled' : ''}`}>
                                <button onClick={() => canChat && handleQuickAction('summary')} disabled={!canChat || isLoadingAnswer || isGeneratingQuiz}>📝 Summary</button>
                                <button onClick={() => canChat && handleQuickAction('concepts')} disabled={!canChat || isLoadingAnswer || isGeneratingQuiz}>🔑 Concepts</button>
                                <button onClick={() => canChat && handleQuickAction('quiz')} disabled={!canChat || isLoadingAnswer || isGeneratingQuiz}>❓ Quiz Me</button>
                            </div>

                            <form className={`chat-input-form ${!canChat ? 'blurred disabled' : ''}`} onSubmit={handleSend}>
                                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." disabled={!canChat || isLoadingAnswer} />
                                <button type="submit" disabled={!canChat || isLoadingAnswer}>➤</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Rating modal rendered AFTER pdf overlay so it sits on top */}
            {isRatingOpen && <RatingModal noteId={noteId} closeModal={() => setIsRatingOpen(false)} onReviewSubmitted={() => setIsRatingOpen(false)} />}
            
            {/* Test/Quiz Modal */}
            {isTestModalOpen && quizData && (
                <TestModal 
                    quizData={quizData} 
                    noteId={noteId} 
                    topicName="Generated Quiz" 
                    closeModal={() => setIsTestModalOpen(false)} 
                />
            )}
        </>
    );
};

export default ViewPdfModal;