import React from 'react';
import './AiModal.css';

const AiModal = ({ mode, content, isLoading, closeModal }) => {
  // Determine the title based on the AI mode
  let title = 'AI Feature';
  if (mode === 'summary') title = 'Summary';
  else if (mode === 'quiz') title = 'Generated Quiz'; // Updated title
  else if (mode === 'qa') title = 'Generated Q&A';

  return (
    <div className="ai-modal-overlay" onClick={closeModal}>
      <div className="ai-modal-content" onClick={e => e.stopPropagation()}>
        <button className="ai-close-btn" onClick={closeModal}>&times;</button>
        <h2>{title}</h2>
        <div className="ai-result-box">
          {isLoading ? (
            <p className="loading-text">Generating response...</p>
          ) : (
            // Use <pre> tag to preserve whitespace and line breaks (like Q/A format)
            <pre className="ai-content">{content}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiModal;