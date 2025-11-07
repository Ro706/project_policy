import React from 'react';

const features = [
  {
    icon: '🔒',
    title: 'User Authentication',
    desc: 'Secure registration and login to keep your documents and summaries private.'
  },
  {
    icon: '📄',
    title: 'PDF Summarization',
    desc: 'Upload PDFs and get concise, configurable summaries to save time.'
  },
  {
    icon: '🌐',
    title: 'Translation',
    desc: 'Translate summaries into multiple Indian languages for wider accessibility.'
  },
  {
    icon: '🔊',
    title: 'Text-to-Speech',
    desc: 'Listen to summaries in the selected language for on-the-go consumption.'
  },
  {
    icon: '🤖',
    title: 'Chat with PDF',
    desc: 'Ask questions about the uploaded document and get AI-powered answers.'
  },
  {
    icon: '⬇️',
    title: 'Download Summary',
    desc: 'Save summaries as PDF files for offline use and record-keeping.'
  }
];

const styles = {
  page: {
    background: 'linear-gradient(180deg, #0f1724 0%, #081027 100%)',
    color: '#E6EEF8',
    minHeight: '100vh',
    padding: '48px 20px',
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto'
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    alignItems: 'flex-start'
  },
  title: {
    fontSize: 36,
    lineHeight: 1.05,
    margin: 0,
    color: '#FFFFFF'
  },
  subtitle: {
    color: '#A9C1E6',
    fontSize: 16,
    margin: 0,
    maxWidth: 820
  },
  card: {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    color: '#EAF3FF'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 14,
    marginTop: 18
  },
  featureItem: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    padding: 14,
    borderRadius: 10,
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start'
  },
  icon: {
    fontSize: 28,
    lineHeight: 1
  },
  featureTitle: {
    margin: 0,
    fontSize: 15,
    color: '#FFFFFF'
  },
  featureDesc: {
    margin: '6px 0 0 0',
    fontSize: 13,
    color: '#BFD7FF',
    lineHeight: 1.35
  },
  ctaRow: {
    marginTop: 22,
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  },
  ctaBtn: {
    background: '#2563EB',
    color: '#FFF',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600
  },
  secondaryLink: {
    color: '#A9C1E6',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: 14
  },
  sectionTitle: {
    marginTop: 28,
    marginBottom: 8,
    fontSize: 18,
    color: '#FFFFFF'
  },
  paragraph: {
    color: '#CDE3FF',
    fontSize: 15,
    lineHeight: 1.6,
    margin: 0
  }
};

const About = () => {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.title}>About Policy Summarizer</h1>
          <p style={styles.subtitle}>
            The Policy Summarizer helps you quickly understand lengthy policy and legal documents —
            from terms of service to government regulations — by providing concise summaries, translations,
            audio playback, and an interactive chatbot for follow-up questions.
          </p>
        </div>

        <div style={styles.card} aria-labelledby="project-desc">
          <h2 id="project-desc" style={{ margin: 0, color: '#DFF0FF' }}>Project Description</h2>
          <p style={{ ...styles.paragraph, marginTop: 12 }}>
            The Policy Summarizer is a web application that allows users to upload PDF documents, get summaries,
            translate them, and interact with a chatbot to ask questions about the document. This tool is
            designed to help users quickly understand the content of lengthy policy documents.
          </p>

          <h3 style={styles.sectionTitle}>Key Features</h3>
          <div style={styles.featuresGrid}>
            {features.map((f) => (
              <div key={f.title} style={styles.featureItem}>
                <div style={styles.icon} aria-hidden>{f.icon}</div>
                <div>
                  <h4 style={styles.featureTitle}>{f.title}</h4>
                  <p style={styles.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.ctaRow}>
            <a href="/" style={{ textDecoration: 'none' }}>
              <button style={styles.ctaBtn}>Get Started</button>
            </a>
            <a href="/account" style={styles.secondaryLink}>View your saved summaries</a>
          </div>

          <h3 style={styles.sectionTitle}>Why it matters</h3>
          <p style={styles.paragraph}>
            By making complex documents more accessible and actionable, Policy Summarizer empowers individuals,
            journalists, researchers, and advocates to understand rights and responsibilities, to hold organizations
            accountable, and to accelerate informed decision-making.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
