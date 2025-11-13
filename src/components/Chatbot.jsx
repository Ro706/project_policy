import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you with your policy today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { text: input, sender: "user" };
    const userText = input;

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem("token"); // Get the token
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token, // Add the auth-token header
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const data = await response.json();
      const botText = data.chatbot || "No response from Gemini.";

      const botMessage = { text: botText, sender: "bot" };
      setMessages(prev => [...prev, botMessage]);

    } catch (err) {
      console.error("Chatbot error:", err);

      setMessages(prev => [
        ...prev,
        {
          text: "⚠️ I’m having trouble contacting the server. Please try again later.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-popup">
      <div className="chatbot-header">
        <h3>Policy Chatbot</h3>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="message bot">
            <em>Typing...</em>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          disabled={loading}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question..."
        />
        <button onClick={handleSend} disabled={!input.trim() || loading}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
