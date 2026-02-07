import React, { useState } from 'react';

const API_BASE = 'http://127.0.0.1:8000';

function ReflectionModal({ eventId, onClose, onSubmitted }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: eventId, note }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit reflection');
      }

      const data = await response.json();

      // Parse analysis string (may be fenced JSON)
      const parseAnalysis = (analysis) => {
        if (!analysis) return null;
        if (typeof analysis === 'object') return analysis;
        if (typeof analysis === 'string') {
          let s = analysis;
          const fenceMatch = s.match(/```(?:json\s*)?([\s\S]*?)```/i);
          if (fenceMatch && fenceMatch[1]) s = fenceMatch[1];
          s = s.trim();
          try {
            return JSON.parse(s);
          } catch (err) {
            const start = s.indexOf('{');
            const end = s.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
              try {
                return JSON.parse(s.slice(start, end + 1));
              } catch (e) {
                // fallthrough
              }
            }
            return { raw: s };
          }
        }
        return null;
      };

      setAnalysis(parseAnalysis(data));
      setNote('');

      // Auto-close after showing analysis
      setTimeout(() => {
        if (onSubmitted) onSubmitted();
      }, 6000);
    } catch (err) {
      setError(err.message);
      console.error('Error submitting reflection:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Your Reflection</h2>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        {!analysis ? (
          <form onSubmit={handleSubmit} className="reflection-form">
            <p className="modal-description">
              Share what happened during the event. AI will analyze your experience and provide personalized advice.
            </p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., I forgot to bring my student ID and couldn't enter the exam hall..."
              className="reflection-textarea"
              rows={6}
              required
            />

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !note.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    Get AI Insights
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="reflection-analysis">
            <div className="ai-badge-large">🤖 AI Reflection Analysis</div>

            <div className="analysis-card">
              <h3 className="analysis-card-title">📝 Summary</h3>
              {analysis.summary && <p className="summary-text">{analysis.summary}</p>}
            </div>

            <div className="analysis-card">
              <h3 className="analysis-card-title">💡 Personalized Advice</h3>
              {analysis.advice && analysis.advice.length > 0 && (
                <ul className="advice-list">
                  {analysis.advice.map((item, idx) => (
                    <li key={idx} className="advice-item">
                      <span className="advice-number">{idx + 1}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {analysis.references && analysis.references.length > 0 && (
              <div className="analysis-card">
                <h3 className="analysis-card-title">🔗 Further Reading</h3>
                <div className="references-list">
                  {analysis.references.map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="reference-link"
                    >
                      <span className="link-icon">📄</span>
                      <span>{ref.title}</span>
                      <span className="arrow">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="success-banner">
              ✓ Reflection saved! Closing in a moment...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReflectionModal;