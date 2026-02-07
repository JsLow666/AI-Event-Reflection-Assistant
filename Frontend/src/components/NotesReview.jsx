import React from 'react';

function NotesReview({ notes, loading }) {
  if (loading) {
    return (
      <div className="notes-loading">
        <div className="spinner-large"></div>
        <p>Loading reflections...</p>
      </div>
    );
  }

  const noteEntries = Object.entries(notes);

  if (noteEntries.length === 0) {
    return (
      <div className="notes-empty">
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <h2>No reflections yet</h2>
          <p>Add reflections to your events to get personalized AI insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-review">
      <div className="content-wrapper">
        <div className="section-header">
          <h1 className="page-title">Your Reflections</h1>
          <p className="page-subtitle">
            AI-powered insights from {noteEntries.length} reflection{noteEntries.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="notes-grid">
          {noteEntries.map(([noteId, note]) => (
            <div key={noteId} className="note-card">
              <div className="note-header">
                {note.category && <span className="category-badge">{note.category}</span>}
              </div>

              <div className="note-section">
                <h3 className="note-section-title">
                  <span className="section-icon">📝</span>
                  What Happened
                </h3>
                <p className="note-summary">{note.summary || 'No summary available'}</p>
              </div>

              <div className="note-section">
                <h3 className="note-section-title">
                  <span className="section-icon">💡</span>
                  Lessons Learned
                </h3>
                {note.advice && note.advice.length > 0 ? (
                  <ul className="lessons-list">
                    {note.advice.map((advice, idx) => (
                      <li key={idx} className="lesson-item">
                        <span className="lesson-bullet">→</span>
                        <span>{advice}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data">No lessons extracted yet</p>
                )}
              </div>

              {note.references && note.references.length > 0 && (
                <div className="note-section">
                  <h3 className="note-section-title">
                    <span className="section-icon">🔗</span>
                    Resources
                  </h3>
                  <div className="note-references">
                    {note.references.map((ref, idx) => (
                      <a
                        key={idx}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="note-reference-link"
                      >
                        <span className="ref-icon">🌐</span>
                        <span className="ref-title">{ref.title}</span>
                        <span className="ref-arrow">→</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="ai-attribution">
                <span className="ai-icon">🤖</span>
                AI-Generated Insights
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotesReview;