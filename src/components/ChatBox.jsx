import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBox.css';

const ChatBox = ({ pdfContent }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateSuggestedQuestions = useCallback(async (content) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/chat/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({
                    question: "Generate 3 relevant questions I could ask about this document",
                    pdfContent: content,
                    chatId
                })
            });

            const data = await response.json();
            if (data.answer) {
                const questions = data.answer
                    .split('\n')
                    .filter(q => q.trim().endsWith('?'))
                    .map(q => q.trim());
                setSuggestedQuestions(questions);
            }
        } catch (error) {
            console.error('Error generating suggestions:', error);
        }
    }, [chatId]);

    // Initialize chat and load history
    useEffect(() => {
        const initializeChat = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/chat/init', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': token
                    },
                    body: JSON.stringify({
                        documentId: Date.now().toString(),
                        context: pdfContent
                    })
                });

                const data = await response.json();
                if (data.chatId) {
                    setChatId(data.chatId);
                    if (data.messages) {
                        setMessages(data.messages.map(msg => ({
                            type: msg.role === 'user' ? 'user' : 'bot',
                            text: msg.content
                        })));
                    }
                }

                // Generate initial suggested questions
                generateSuggestedQuestions(pdfContent);
            } catch (error) {
                console.error('Chat initialization error:', error);
            }
        };

        if (pdfContent) {
            initializeChat();
        }
    }, [pdfContent, generateSuggestedQuestions]);


    const handleSend = async () => {
        if (!inputMessage.trim() || loading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        
        // Add user message to chat
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/chat/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({
                    question: userMessage,
                    pdfContent: pdfContent,
                    chatId
                })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            // Add bot response to chat
            setMessages(prev => [...prev, { 
                type: 'bot', 
                text: data.answer,
                isFailback: data.isFailback 
            }]);

            // Update chat history if available
            if (data.messageHistory) {
                setMessages(data.messageHistory.map(msg => ({
                    type: msg.role === 'user' ? 'user' : 'bot',
                    text: msg.content
                })));
            }

            // Generate new suggested questions based on the context
            generateSuggestedQuestions(pdfContent);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { 
                type: 'bot', 
                text: 'Sorry, I encountered an error. Please try again.' 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestedQuestion = (question) => {
        setInputMessage(question);
        handleSend();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-box">
            <div className="chat-header">
                <h3>Ask Questions About Your PDF</h3>
            </div>
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <p>Ask me anything about your uploaded PDF!</p>
                        {suggestedQuestions.length > 0 && (
                            <div className="suggested-questions">
                                <p>Here are some questions you might want to ask:</p>
                                {suggestedQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        className="suggested-question-btn"
                                        onClick={() => handleSuggestedQuestion(question)}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div 
                            key={index} 
                            className={`message ${message.type}-message ${message.isFailback ? 'fallback' : ''}`}
                        >
                            <div className="message-content">
                                <span className="message-icon">
                                    {message.type === 'user' ? '👤' : '🤖'}
                                </span>
                                <p>{message.text}</p>
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="message bot-message">
                        <div className="message-content">
                            <span className="message-icon">🤖</span>
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
                <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your question here..."
                    rows="3"
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || loading}
                    className={loading ? 'loading' : ''}
                >
                    {loading ? '...' : 'Send'}
                </button>
            </div>
            {suggestedQuestions.length > 0 && messages.length > 0 && (
                <div className="suggested-questions-footer">
                    <p>You might also want to ask:</p>
                    <div className="suggested-questions-scroll">
                        {suggestedQuestions.map((question, index) => (
                            <button
                                key={index}
                                className="suggested-question-btn"
                                onClick={() => handleSuggestedQuestion(question)}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBox;