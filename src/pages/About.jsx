import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../about.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      <div className="hero-section">
        <h1 className="hero-title">About Policy Summarizer</h1>
        <p className="hero-subtitle">
          Demystifying complex documents with AI-powered summarization, translation, and interactive chat.
        </p>
      </div>

      <div className="content-card">
        <section>
          <h2 className="section-header">Mission & Vision</h2>
          <p className="paragraph">
            Policy Summarizer empowers individuals, professionals, and researchers to quickly understand lengthy legal and policy documents. 
            By leveraging advanced AI, we transform dense PDFs into concise, actionable insights, breaking down language barriers and making information accessible to everyone.
          </p>
        </section>

        <section className="architecture-section">
          <h2 className="section-header">Core Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">📄</span>
              <h3 className="feature-title">Smart Summarization</h3>
              <p className="feature-desc">Upload PDFs and receive concise summaries tailored to your needs (200, 700, or 1000+ words).</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <h3 className="feature-title">Interactive Chatbot</h3>
              <p className="feature-desc">Ask follow-up questions about your document and get instant, context-aware answers from our AI.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌐</span>
              <h3 className="feature-title">Multi-Language Support</h3>
              <p className="feature-desc">Translate summaries into over 10 languages, ensuring you understand the content in your preferred language.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔊</span>
              <h3 className="feature-title">Text-to-Speech</h3>
              <p className="feature-desc">Listen to your summaries on the go with our optimized, low-latency audio playback feature.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-desc">Your data is handled with top-tier security, including encrypted passwords and secure authentication protocols.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <h3 className="feature-title">Real-Time Processing</h3>
              <p className="feature-desc">Experience lightning-fast results thanks to our asynchronous microservices architecture.</p>
            </div>
          </div>
        </section>

        <section className="architecture-section">
          <h2 className="section-header">Who Is This For?</h2>
          <div className="use-cases-grid">
            <div className="use-case-item">
              <span className="use-case-title">🎓 Students & Researchers</span>
              <p className="use-case-desc">Quickly digest complex academic papers and research reports without getting bogged down in jargon.</p>
            </div>
            <div className="use-case-item">
              <span className="use-case-title">⚖️ Legal Professionals</span>
              <p className="use-case-desc">Get rapid overviews of case files and policy documents to streamline your review process.</p>
            </div>
            <div className="use-case-item">
              <span className="use-case-title">🏢 Business Executives</span>
              <p className="use-case-desc">Make informed decisions faster by summarizing lengthy market reports and compliance documents.</p>
            </div>
            <div className="use-case-item">
              <span className="use-case-title">📰 Journalists</span>
              <p className="use-case-desc">Analyze government reports and white papers instantly to break news with accuracy and speed.</p>
            </div>
          </div>
        </section>

        <section className="architecture-section">
          <h2 className="section-header">How It Works</h2>
          <div className="arch-block">
            <h3 className="arch-title">1. Intelligent Offloading</h3>
            <p className="paragraph" style={{ marginBottom: 0 }}>
              We prioritize speed. Complex summarization tasks are handled by specialized external services, ensuring our application remains responsive and you get results faster.
            </p>
          </div>
          <div className="arch-block">
            <h3 className="arch-title">2. Low-Latency Audio</h3>
            <p className="paragraph" style={{ marginBottom: 0 }}>
              Our Text-to-Speech engine streams audio directly to your browser, allowing playback to start almost instantly without waiting for the full file to download.
            </p>
          </div>
          <div className="arch-block">
            <h3 className="arch-title">3. Secure Authentication</h3>
            <p className="paragraph" style={{ marginBottom: 0 }}>
              We use industry-standard authentication (JWT) and Google Sign-In to ensure your account and saved summaries remain private and secure.
            </p>
          </div>
        </section>

        <section className="privacy-section">
          <span className="privacy-badge">Privacy & Trust</span>
          <h2 className="feature-title" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Your Data Is Safe With Us</h2>
          <p className="paragraph" style={{ marginBottom: 0 }}>
            We understand the sensitivity of the documents you upload. That's why we employ end-to-end encryption for data transmission and strict access controls. We do not sell your data or use your documents to train public models without your explicit consent.
          </p>
        </section>

        <div className="cta-section">
          <h2 className="cta-title">Ready to simplify your reading?</h2>
          <p className="cta-text">Join thousands of users who are saving time with Policy Summarizer.</p>
          <button className="cta-button" onClick={() => navigate('/')}>Get Started for Free</button>
        </div>
      </div>
    </div>
  );
};

export default About;
