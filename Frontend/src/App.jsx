import React, { useState, useEffect } from 'react';
import EventCreation from './components/EventCreation';
import EventCalendar from './components/EventCalendar';
import NotesReview from './components/NotesReview';
import ReflectionModal from './components/ReflectionModal';
import './App.css';

const API_BASE = 'http://127.0.0.1:8000';

function App() {
  const [currentView, setCurrentView] = useState('calendar');
  const [events, setEvents] = useState({});
  const [notes, setNotes] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch events on mount and when switching to calendar view
  useEffect(() => {
    if (currentView === 'calendar') {
      fetchEvents();
    }
  }, [currentView]);

  // Fetch notes when switching to notes view
  useEffect(() => {
    if (currentView === 'notes') {
      fetchNotes();
    }
  }, [currentView]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      // Normalize analysis field: backend may return a fenced JSON string
      const normalizeAnalysis = (analysis) => {
        if (!analysis) return {};
        if (typeof analysis === 'object') return analysis;
        if (typeof analysis === 'string') {
          let s = analysis;
          // Remove triple-backtick fences (```json ... ``` or ``` ... ```)
          const fenceMatch = s.match(/```(?:json\s*)?([\s\S]*?)```/i);
          if (fenceMatch && fenceMatch[1]) s = fenceMatch[1];
          s = s.trim();
          try {
            return JSON.parse(s);
          } catch (err) {
            // Try to extract the first JSON object {...}
            const start = s.indexOf('{');
            const end = s.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
              const candidate = s.slice(start, end + 1);
              try {
                return JSON.parse(candidate);
              } catch (e) {
                // fall through
              }
            }
            // As a last resort, return the raw string in a field so UI can show something
            return { raw: s };
          }
        }
        return {};
      };

      const normalized = {};
      Object.entries(data).forEach(([id, ev]) => {
        normalized[id] = {
          ...ev,
          analysis: normalizeAnalysis(ev.analysis),
        };
      });

      setEvents(normalized);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Failed to load events. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/notes`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();

      // Reuse normalizeAnalysis helper inline
      const normalizeData = (obj) => {
        if (!obj) return {};
        if (typeof obj === 'object') return obj;
        if (typeof obj === 'string') {
          let s = obj;
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
                // fall through
              }
            }
            return { raw: s };
          }
        }
        return {};
      };

      const normalized = {};
      Object.entries(data).forEach(([id, note]) => {
        normalized[id] = normalizeData(note);
      });

      setNotes(normalized);
    } catch (error) {
      console.error('Error fetching notes:', error);
      alert('Failed to load notes. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = () => {
    setCurrentView('calendar');
    fetchEvents();
  };

  const handleOpenReflection = (eventId) => {
    setSelectedEvent(eventId);
    setShowReflectionModal(true);
  };

  const handleReflectionSubmitted = () => {
    setShowReflectionModal(false);
    setSelectedEvent(null);
  };

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-icon">⚡</span>
            <span className="brand-text">EventGenius AI</span>
          </div>
          <div className="nav-links">
            <button
              className={`nav-link ${currentView === 'create' ? 'active' : ''}`}
              onClick={() => setCurrentView('create')}
            >
              Create Event
            </button>
            <button
              className={`nav-link ${currentView === 'calendar' ? 'active' : ''}`}
              onClick={() => setCurrentView('calendar')}
            >
              Calendar
            </button>
            <button
              className={`nav-link ${currentView === 'notes' ? 'active' : ''}`}
              onClick={() => setCurrentView('notes')}
            >
              Reflections
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'create' && (
          <EventCreation onEventCreated={handleEventCreated} />
        )}
        {currentView === 'calendar' && (
          <EventCalendar
            events={events}
            loading={loading}
            onAddReflection={handleOpenReflection}
          />
        )}
        {currentView === 'notes' && (
          <NotesReview notes={notes} loading={loading} />
        )}
      </main>

      {/* Reflection Modal */}
      {showReflectionModal && (
        <ReflectionModal
          eventId={selectedEvent}
          onClose={() => setShowReflectionModal(false)}
          onSubmitted={handleReflectionSubmitted}
        />
      )}
    </div>
  );
}

export default App;