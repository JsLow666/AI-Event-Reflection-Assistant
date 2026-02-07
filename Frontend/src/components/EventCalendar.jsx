import React, { useState } from 'react';

function EventCalendar({ events, loading, onAddReflection }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate calendar for given month
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const calendar = [];
    let week = new Array(7).fill(null);
    
    // Fill in days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      week[i] = null; // Previous month dates marked as null
    }
    
    // Fill in the days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = (startDayOfWeek + day - 1) % 7;
      week[dayOfWeek] = day;
      
      if (dayOfWeek === 6 || day === daysInMonth) {
        calendar.push([...week]);
        week = new Array(7).fill(null);
      }
    }
    
    return { calendar, year, month };
  };

  const { calendar, year, month } = generateCalendar();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Find events for a specific date
  const getEventsForDate = (day) => {
    if (!day) return [];
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return Object.entries(events).filter(([_, event]) => {
      return event.datetime.startsWith(dateStr);
    });
  };

  const handleDateClick = (day) => {
    if (!day) return;
    
    const eventsOnDate = getEventsForDate(day);
    if (eventsOnDate.length > 0) {
      setSelectedDate(day);
      setSelectedEvent(eventsOnDate[0]);
    }
  };

  const closeDetails = () => {
    setSelectedDate(null);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="calendar-loading">
        <div className="spinner-large"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="event-calendar">
      <div className="content-wrapper">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#FF9D00' }}>
              ←
            </button>
            <div>
              <h1 className="page-title">{monthNames[month]} {year}</h1>
              <p className="page-subtitle">
                {Object.keys(events).length} events scheduled
              </p>
            </div>
            <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#FF9D00' }}>
              →
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {/* Day headers */}
          <div className="calendar-header">
            {dayNames.map((day) => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="calendar-body">
            {calendar.map((week, weekIdx) => (
              <div key={weekIdx} className="calendar-week">
                {week.map((day, dayIdx) => {
                  const eventsOnDate = getEventsForDate(day);
                  const hasEvents = eventsOnDate.length > 0;
                  const isSelected = day === selectedDate;
                  const isToday = day === new Date().getDate() && 
                    month === new Date().getMonth() && 
                    year === new Date().getFullYear();

                  return (
                    <div
                      key={dayIdx}
                      className={`calendar-day ${day ? '' : 'empty'} ${hasEvents ? 'has-events' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                      onClick={() => handleDateClick(day)}
                    >
                      {day && (
                        <>
                          <span className="day-number">{day}</span>
                          {hasEvents && (
                            <div className="event-indicators">
                              {eventsOnDate.map((_, idx) => (
                                <span key={idx} className="event-dot"></span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Event Details Panel */}
        {selectedEvent && (
          <div className="event-details-panel">
            <div className="details-content">
              <div className="details-header">
                <div>
                  {selectedEvent[1].analysis && selectedEvent[1].analysis.category && (
                    <span className="category-badge-small">
                      {selectedEvent[1].analysis.category}
                    </span>
                  )}
                  <h2 className="event-title">{selectedEvent[1].title}</h2>
                  <p className="event-datetime">
                    📅 {new Date(selectedEvent[1].datetime).toLocaleString()}
                  </p>
                </div>
                <button onClick={closeDetails} className="close-btn">
                  ✕
                </button>
              </div>

              {selectedEvent[1].analysis && selectedEvent[1].analysis.long_term_preparation && selectedEvent[1].analysis.long_term_preparation.length > 0 && (
                <div className="details-section">
                  <h3 className="details-section-title">📚 Long-term Prep</h3>
                  <ul className="details-list">
                    {selectedEvent[1].analysis.long_term_preparation.slice(0, 4).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEvent[1].analysis && selectedEvent[1].analysis.reminder_before_event && selectedEvent[1].analysis.reminder_before_event.length > 0 && (
                <div className="details-section">
                  <h3 className="details-section-title">⏰ Pre-Event Checklist</h3>
                  <ul className="details-list checklist">
                    {selectedEvent[1].analysis.reminder_before_event.map((item, idx) => (
                      <li key={idx}>
                        <input type="checkbox" id={`reminder-${idx}`} />
                        <label htmlFor={`reminder-${idx}`}>{item}</label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className="add-reflection-btn"
                onClick={() => onAddReflection(selectedEvent[0])}
              >
                <span>✍️</span>
                Add Reflection After Event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventCalendar;