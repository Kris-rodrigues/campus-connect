import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 1. Import axios
import './TestModal.css';

// 2. Add 'noteId' and 'topicName' to props so we know what the quiz was about
const TestModal = ({ quizData, noteId, topicName, closeModal }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300); 

    useEffect(() => {
        if (timeLeft > 0 && !showResult) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else if (timeLeft === 0 && !showResult) {
            handleSubmit();
        }
    }, [timeLeft, showResult]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleOptionSelect = (optionIndex) => {
        setSelectedOptions({ ...selectedOptions, [currentQuestion]: optionIndex });
    };

    const handleNext = () => {
        if (currentQuestion < quizData.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        // 1. Calculate Score
        let newScore = 0;
        quizData.forEach((q, index) => {
            if (selectedOptions[index] === q.answer) {
                newScore++;
            }
        });
        setScore(newScore);
        setShowResult(true);

        // --- 3. NEW: Save Result to Database ---
        try {
            const token = localStorage.getItem('token');
            // Use a default name if topicName isn't provided
            const quizTopic = topicName || "General Knowledge"; 
            
            if (token) {
                await axios.post('/api/quiz/submit', {
                    noteId: noteId, // We need to make sure this is passed from parent
                    topicName: quizTopic,
                    score: newScore,
                    totalQuestions: quizData.length
                }, { headers: { 'x-auth-token': token } });
                console.log("Quiz score saved successfully!");
            }
        } catch (err) {
            console.error("Failed to save quiz result:", err);
        }
        // ---------------------------------------
    };

    return (
        <div className="test-modal-overlay">
            <div className="test-modal-content">
                <div className="test-header">
                    <h2>Exam Simulator</h2>
                    {!showResult && <div className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>⏱ {formatTime(timeLeft)}</div>}
                    <button className="test-close-btn" onClick={closeModal}>&times;</button>
                </div>

                <div className="test-body">
                    {showResult ? (
                        <div className="result-view">
                            <div className="score-circle">
                                <span className="score-number">{Math.round((score / quizData.length) * 100)}%</span>
                                <span className="score-text">Score</span>
                            </div>
                            <h3>You got {score} out of {quizData.length} correct!</h3>
                            
                            <div className="review-list">
                                {quizData.map((q, index) => (
                                    <div key={index} className={`review-item ${selectedOptions[index] === q.answer ? 'correct' : 'wrong'}`}>
                                        <p className="review-q"><strong>Q{index + 1}:</strong> {q.question}</p>
                                        <p className="your-ans">
                                            Your Answer: {selectedOptions[index] !== undefined ? q.options[selectedOptions[index]] : <span style={{color: 'orange'}}>Skipped</span>}
                                        </p>
                                        {selectedOptions[index] !== q.answer && (
                                            <p className="correct-ans">Correct Answer: {q.options[q.answer]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button className="retry-btn" onClick={closeModal}>Close Test</button>
                        </div>
                    ) : (
                        <div className="question-view">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}></div>
                            </div>
                            <p className="question-counter">Question {currentQuestion + 1} of {quizData.length}</p>
                            
                            <h3 className="question-text">{quizData[currentQuestion].question}</h3>

                            <div className="options-list">
                                {quizData[currentQuestion].options.map((option, index) => (
                                    <div 
                                        key={index} 
                                        className={`option-item ${selectedOptions[currentQuestion] === index ? 'selected' : ''}`}
                                        onClick={() => handleOptionSelect(index)}
                                    >
                                        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                        <span className="option-text">{option}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {!showResult && (
                    <div className="test-footer">
                        <button className="nav-btn" onClick={handlePrev} disabled={currentQuestion === 0}>Previous</button>
                        {currentQuestion === quizData.length - 1 ? (
                            <button className="submit-test-btn" onClick={handleSubmit}>Submit Test</button>
                        ) : (
                            <button className="nav-btn next" onClick={handleNext}>Next</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestModal;