import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatModal.css'; // We'll create this

const ChatModal = ({ noteId, closeModal }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null); // To auto-scroll

    // Add a greeting message when the modal opens
    useEffect(() => {
        setMessages([{
            sender: 'ai',
            text: 'Hello! Ask me any question about this document.'
        }]);
    }, []);

    // Auto-scroll to the bottom when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        const userMessage = input.trim();
        if (!userMessage) return;

        // Add user's message to the chat
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            // Call the new chat API endpoint
            const res = await axios.post(`/api/ai/chat/${noteId}`, 
                { question: userMessage }, 
                { headers: { 'x-auth-token': token } }
            );
            
            // Add AI's response to the chat
            setMessages(prev => [...prev, { sender: 'ai', text: res.data.answer }]);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Error: Could not get response.';
            setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-modal-overlay" onClick={closeModal}>
            <div className="chat-modal-content" onClick={e => e.stopPropagation()}>
                <div className="chat-modal-header">
                    <h2>Chat with PDF</h2>
                    <button className="chat-close-btn" onClick={closeModal}>&times;</button>
                </div>
                
                <div className="chat-message-area">
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.sender}`}>
                            <p>{msg.text}</p>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="chat-message ai loading">
                            <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <form className="chat-input-form" onSubmit={handleSend}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>Send</button>
                </form>
            </div>
        </div>
    );
};

export default ChatModal;