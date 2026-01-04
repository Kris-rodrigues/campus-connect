import React from 'react';
import './NoteCard.css';

// Removed 'onChat' prop
const NoteCard = ({ note, onViewFile, isAdmin, onEdit, onDelete, onSummarize, onQuiz, onGenerateQA, onPaywall }) => {

  const uploaderName = note.uploader ? note.uploader.name : (note.uploaderName || 'Unknown');
  const isSubscribed = localStorage.getItem('isSubscribed') === 'true';

  return (
    <div className="note-card-simple">
      {note.averageRating > 0 && (
        <div className="card-average-rating">
          ★ {note.averageRating.toFixed(1)} 
          <span className="review-count">({note.reviewCount})</span>
        </div>
      )}

      <h3 className="card-title">{note.title}</h3>
      <p className="card-subject">{note.subject}</p>
      <p className="card-description">{note.description || 'No description provided.'}</p>
      
      {/* --- AI Feature Buttons (Chat button removed) --- */}
      <div className="ai-features">
        <button onClick={() => isSubscribed || isAdmin ? onSummarize(note._id) : onPaywall()} title="Summarize Content">
            📝 {!(isSubscribed || isAdmin) && <span className="lock-icon">🔒</span>}
        </button>
        <button onClick={() => isSubscribed || isAdmin ? onQuiz(note._id) : onPaywall()} title="Generate Quiz">
            ❓ {!(isSubscribed || isAdmin) && <span className="lock-icon">🔒</span>}
        </button>
        {/* The Q&A/Chat button is no longer here */}
      </div>

      <div className="card-footer-simple">
        <span className="uploader-name">Uploaded by: {uploaderName}</span>
        
        {isAdmin ? (
          <div className="action-buttons-inline">
            <button onClick={() => onViewFile(note._id)} className="view-btn-simple small">View & Chat</button>
            <button className="edit-btn small" onClick={() => onEdit(note)}>✏️ Edit</button>
            <button className="delete-btn small" onClick={() => onDelete(note._id)}>🗑️ Delete</button>
          </div>
        ) : (
          <button onClick={() => onViewFile(note._id)} className="view-btn-simple">
            {isSubscribed ? 'View & Chat' : 'View Preview'}
            {!isSubscribed && <span className="lock-icon-btn">🔒 2 Page Preview</span>}
          </button>
        )}
      </div>
    </div>
  );
};

export default NoteCard;