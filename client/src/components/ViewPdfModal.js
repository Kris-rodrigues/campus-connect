import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ViewPdfModal.css';
import RatingModal from './RatingModal';

const ViewPdfModal = ({ noteId, closeModal }) => {
    // ... (all state variables remain the same) ...
    const [pdfSrc, setPdfSrc] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(true);
    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
    const [isChatVisible, setIsChatVisible] = useState(false);

    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    // Helper to check if user is staff (admin or teacher)
    const isStaff = userRole === 'admin' || userRole === 'teacher';
    
    // Chat logic (free for everyone now)
    const canChat = true;

    useEffect(() => {
        // ... (fetchPdf and fetchChatHistory remain the same) ...
        const fetchPdf = async () => {
            try {
                const response = await axios.get(`/api/notes/view/${noteId}`, {
                    headers: { 'x-auth-token': token },
                    responseType: 'blob' 
                });
                const file = new Blob([response.data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
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
        return () => { if (pdfSrc) URL.revokeObjectURL(pdfSrc); };
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

    const handleQuickAction = (action) => { /* ... (unchanged) ... */ 
        let prompt = "";
        if (action === 'summary') prompt = "Can you summarize this document for me?";
        if (action === 'concepts') prompt = "What are the key concepts in this document?";
        if (action === 'quiz') prompt = "Quiz me on this document. Ask one question at a time.";
        sendMessage(prompt);
    };

    return (
        <>
            {isRatingOpen && <RatingModal noteId={noteId} closeModal={() => setIsRatingOpen(false)} onReviewSubmitted={() => setIsRatingOpen(false)} />}

            <div className="pdf-modal-overlay" onClick={closeModal}>
                <div className={`pdf-modal-content ${canChat && isChatVisible ? 'split-view' : 'full-view'}`} onClick={e => e.stopPropagation()}>
                    
                    <button className="pdf-close-btn" onClick={closeModal}>&times;</button>
                    
                    <div className="pdf-view-container">
                        
                        {/* --- FIX: Only show Rate button if NOT staff (i.e., only for students) --- */}
                        {!isStaff && (
                            <button className="pdf-rate-btn" onClick={() => setIsRatingOpen(true)}>Rate Note</button>
                        )}
                        {/* ----------------------------------------------------------------------- */}
                        
                        {canChat && !isChatVisible && (
                            <button className="floating-chat-btn" onClick={() => setIsChatVisible(true)} title="Open Chat">
                                💬 Chat with PDF
                            </button>
                        )}

                        {loadingPdf ? (
                            <p style={{color: 'white', textAlign: 'center', paddingTop: '20%'}}>Loading PDF...</p>
                        ) : pdfSrc ? (
                            <iframe src={pdfSrc} title="PDF Viewer" width="100%" height="100%" />
                        ) : (
                            <p style={{color: 'white', textAlign: 'center', paddingTop: '20%'}}>Failed to load PDF.</p>
                        )}
                    </div>

                    {canChat && isChatVisible && (
                        <div className="chat-container">
                            <div className="chat-header">
                                <h3>Chat with PDF</h3>
                                <button className="chat-minimize-btn" onClick={() => setIsChatVisible(false)} title="Minimize Chat">➖</button>
                            </div>
                            
                            <div className="chat-message-area">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`chat-message ${msg.sender}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                ))}
                                {isLoadingAnswer && <div className="chat-message ai loading"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="quick-actions">
                                <button onClick={() => handleQuickAction('summary')} disabled={isLoadingAnswer}>📝 Summary</button>
                                <button onClick={() => handleQuickAction('concepts')} disabled={isLoadingAnswer}>🔑 Concepts</button>
                                <button onClick={() => handleQuickAction('quiz')} disabled={isLoadingAnswer}>❓ Quiz Me</button>
                            </div>

                            <form className="chat-input-form" onSubmit={handleSend}>
                                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." disabled={isLoadingAnswer} />
                                <button type="submit" disabled={isLoadingAnswer}>➤</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ViewPdfModal;