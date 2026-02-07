import React, { useState } from 'react';

const API_BASE = 'http://127.0.0.1:8000';

function EventCreation({ onEventCreated }) {
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setAnalysis(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, datetime }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const data = await response.json();
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

      setAnalysis(parseAnalysis(data.analysis));
      
      // Reset form
      setTitle('');
      setDatetime('');

      // Notify parent after a delay so user can see the analysis
      setTimeout(() => {
        if (onEventCreated) onEventCreated();
      }, 8000);
    } catch (err) {
      setError(err.message);
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-creation">
      <div className="content-wrapper">
        <div className="section-header">
          <h1 className="page-title">Create Your Event</h1>
          <p className="page-subtitle">
            Let AI help you prepare with personalized insights
          </p>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Event Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Machine Learning Final Exam"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="datetime" className="form-label">
              Date & Time
            </label>
            <input
              id="datetime"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing with AI...
              </>
            ) : (
              <>
                <span>✨</span>
                Create & Analyze Event
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {analysis && (
          <div className="analysis-container">
            <div className="analysis-header">
              <span className="ai-badge">🤖 AI Analysis</span>
              <h2 className="analysis-title">{analysis.event_title}</h2>
              <span className="category-badge">{analysis.category}</span>
            </div>

            {analysis.long_term_preparation && analysis.long_term_preparation.length > 0 && (
              <div className="analysis-section">
                <h3 className="section-title">📚 Long-term Preparation</h3>
                <ul className="preparation-list">
                  {analysis.long_term_preparation.map((item, idx) => (
                    <li key={idx} className="preparation-item">
                      <span className="bullet">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.reminder_before_event && analysis.reminder_before_event.length > 0 && (
              <div className="analysis-section">
                <h3 className="section-title">⏰ Pre-Event Reminders</h3>
                <ul className="reminder-list">
                  {analysis.reminder_before_event.map((item, idx) => (
                    <li key={idx} className="reminder-item">
                      <span className="check">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.references && analysis.references.length > 0 && (
              <div className="analysis-section">
                <h3 className="section-title">🔗 Helpful Resources</h3>
                <div className="references-grid">
                  {analysis.references.map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="reference-card"
                    >
                      <span className="link-icon">🌐</span>
                      <span className="reference-title">{ref.title}</span>
                      <span className="arrow">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="success-message">
              Event created! Redirecting to calendar...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventCreation;