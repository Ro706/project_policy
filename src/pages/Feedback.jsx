import React, { useState, useEffect } from 'react';
import '../feedback.css';

const Feedback = () => {
  const [experience, setExperience] = useState('');
  const [feedback, setFeedback] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
        },
        body: JSON.stringify({ experience, feedback, suggestion }),
      });

      if (!res.ok) throw new Error('Failed to submit feedback.');

      setShowMessage(true);
      setExperience('');
      setFeedback('');
      setSuggestion('');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  return (
    <div className="feedback-container">
      <h2>Feedback</h2>
      <p>We would love to hear your thoughts, concerns or problems with anything so we can improve!</p>
      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label htmlFor="experience">How was your experience?</label>
          <select
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            required
          >
            <option value="">Select an option</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="feedback">Describe your feedback:</label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="suggestion">Any suggestions for improvement?</label>
          <textarea
            id="suggestion"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
          ></textarea>
        </div>
        <button type="submit">Submit Feedback</button>
      </form>
      {showMessage && (
        <div className="feedback-message show">
          Thank you for your feedback 💬
        </div>
      )}
    </div>
  );
};

export default Feedback;
