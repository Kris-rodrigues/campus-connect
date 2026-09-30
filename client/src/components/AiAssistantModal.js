import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './AiAssistantModal.css';

const AiAssistantModal = ({ closeModal }) => {
    const [messages, setMessages] = useState([
        { sender: 'ai', text: "Hey there! 👋 I'm your **AI Study Assistant**. Ask me anything — concepts, formulas, study tips, problem solving — I've got you covered!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const quickPrompts = [
        { label: '📐 Explain a concept', prompt: 'Explain the concept of ' },
        { label: '🧮 Solve a problem', prompt: 'Help me solve this problem: ' },
        { label: '📝 Study tips', prompt: 'Give me effective study tips for ' },
        { label: '🧠 Create mnemonics', prompt: 'Create a mnemonic to remember ' },
    ];

    const handleSend = async (e) => {
        e?.preventDefault();
        const userMessage = input.trim();
        if (!userMessage || isLoading) return;

        const newMessages = [...messages, { sender: 'user', text: userMessage }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const res = await axios.post('/api/ai/assistant',
                { question: userMessage, history: newMessages.slice(-8) },
                { headers: { 'x-auth-token': token } }
            );
            setMessages(prev => [...prev, { sender: 'ai', text: res.data.answer }]);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
            setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleQuickPrompt = (prompt) => {
        setInput(prompt);
        inputRef.current?.focus();
    };

    return (
        <div className="ai-assistant-overlay" onClick={closeModal}>
            <div className="ai-assistant-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="ai-assistant-header">
                    <div className="ai-assistant-title">
                        <span className="ai-assistant-icon">✦</span>
                        <div>
                            <h2>AI Study Assistant</h2>
                            <span className="ai-assistant-status">Powered by Gemini</span>
                        </div>
                    </div>
                    <button className="ai-assistant-close" onClick={closeModal}>&times;</button>
                </div>

                {/* Messages */}
                <div className="ai-assistant-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`ai-msg ${msg.sender}`}>
                            {msg.sender === 'ai' && <span className="ai-msg-avatar">✦</span>}
                            <div className={`ai-msg-bubble ${msg.sender} markdown-body`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="ai-msg ai">
                            <span className="ai-msg-avatar">✦</span>
                            <div className="ai-msg-bubble ai loading-bubble">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts (shown only at start) */}
                {messages.length <= 1 && (
                    <div className="ai-quick-prompts">
                        {quickPrompts.map((qp, i) => (
                            <button key={i} className="ai-quick-btn" onClick={() => handleQuickPrompt(qp.prompt)}>
                                {qp.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <form className="ai-assistant-input" onSubmit={handleSend}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AiAssistantModal;
