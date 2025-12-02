import React, { useState, useEffect } from 'react';
import "../feedback.css";

const Feedback = () => {
  const [experience, setExperience] = useState('');
  const [feedback, setFeedback] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratings = [
    { value: 'Poor', emoji: '😞', label: 'Poor' },
    { value: 'Average', emoji: '😐', label: 'Average' },
    { value: 'Good', emoji: '🙂', label: 'Good' },
    { value: 'Excellent', emoji: '🤩', label: 'Excellent' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!experience) {
      alert("Please select an experience rating.");
      return;
    }
    setIsSubmitting(true);
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
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  return (
    <div className="feedback-container">
      <div className="feedback-card glass-effect">
        <div className="feedback-header">
          <h2>We Value Your Feedback</h2>
          <p>Help us improve your experience by sharing your thoughts.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="feedback-form">
          
          {/* Experience Rating Section */}
          <div className="form-group rating-group">
            <label>How was your experience?</label>
            <div className="emoji-rating">
              {ratings.map((rate) => (
                <button
                  key={rate.value}
                  type="button"
                  className={`emoji-btn ${experience === rate.value ? 'selected' : ''}`}
                  onClick={() => setExperience(rate.value)}
                  aria-label={rate.label}
                  title={rate.label}
                >
                  <span className="emoji">{rate.emoji}</span>
                  <span className="label">{rate.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="feedback">What did you like or dislike?</label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
              placeholder="Tell us about your experience..."
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="suggestion">Any suggestions for improvement?</label>
            <textarea
              id="suggestion"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="We'd love to hear your ideas..."
              rows="3"
            ></textarea>
          </div>

          <button type="submit" className={`submit-btn ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      {showMessage && (
        <div className="feedback-toast">
          <div className="toast-content">
            <span className="toast-icon">🎉</span>
            <div className="toast-text">
              <h4>Thank You!</h4>
              <p>Your feedback helps us grow.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;