import React from 'react';
import './NoteCard.css';

const NoteCard = ({ note, onViewFile, isAdmin, onEdit, onDelete, onSummarize, onQuiz, onGenerateQA, onPaywall }) => {

  const uploaderName = note.uploader ? note.uploader.name : (note.uploaderName || 'Unknown');
  const isSubscribed = localStorage.getItem('isSubscribed') === 'true';

  return (
    <div className="note-card-simple">
      {/* Type Badge */}
      <div className="card-header-row">
        <span className="card-type-badge notes">Notes</span>
        <div className="card-header-right">
          {note.averageRating > 0 && (
            <div className="card-average-rating">
              ★ {note.averageRating.toFixed(1)} 
              <span className="review-count">({note.reviewCount})</span>
            </div>
          )}
          <span className="card-icon-btn">📄</span>
        </div>
      </div>

      <h3 className="card-title">{note.title}</h3>
      <p className="card-description">{note.description || 'No description provided.'}</p>
      
      {/* --- AI Feature Buttons --- */}
      <div className="ai-features">
        <button onClick={() => isSubscribed || isAdmin ? onSummarize(note._id) : onPaywall()} title="Summarize Content">
            📝 <span className="ai-btn-text">Summary</span>
            {!(isSubscribed || isAdmin) && <span className="lock-icon">🔒</span>}
        </button>
        <button onClick={() => isSubscribed || isAdmin ? onQuiz(note._id) : onPaywall()} title="Generate Quiz">
            ❓ <span className="ai-btn-text">Quiz</span>
            {!(isSubscribed || isAdmin) && <span className="lock-icon">🔒</span>}
        </button>
      </div>

      <div className="card-dashed-separator"></div>

      <div className="card-footer-simple">
        <span className="uploader-name">{uploaderName}</span>
        
        {isAdmin ? (
          <div className="action-buttons-inline">
            <button onClick={() => onViewFile(note._id)} className="view-link">View →</button>
            <button className="edit-btn small" onClick={() => onEdit(note)}>Edit</button>
            <button className="delete-btn small" onClick={() => onDelete(note._id)}>Delete</button>
          </div>
        ) : (
          <button onClick={() => onViewFile(note._id)} className="view-link">
            {isSubscribed ? 'View →' : 'Preview →'}
          </button>
        )}
      </div>
    </div>
  );
};

export default NoteCard;