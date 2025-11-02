import React from 'react';

function LandingPage() {
  return (
    <div style={{
      fontFamily: 'JetBrains Mono, monospace',
      backgroundColor: '#f0faff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      {/* Title */}
      <h1 style={{
        fontSize: '3rem',
        color: '#00bcd4',
        marginBottom: '10px',
        textAlign: 'center'
      }}>
        Welcome to AL-code.AI
      </h1>

      {/* Description */}
      <p style={{
        fontSize: '1.2rem',
        color: '#333',
        maxWidth: '700px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        A fast, elegant Python playground built for students and developers. Write, run, and learn Python directly in your browser — no setup required.
      </p>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/editor" style={{
          padding: '12px 24px',
          backgroundColor: '#00e5ff',
          color: '#000',
          borderRadius: '8px',
          fontWeight: 'bold',
          textDecoration: 'none',
          boxShadow: '0 0 10px rgba(0,255,204,0.5)',
          transition: 'transform 0.2s ease'
        }}>
          Try the Editor 🚀
        </a>
        <a href="#features" style={{
          padding: '12px 24px',
          backgroundColor: '#fff',
          color: '#00bcd4',
          border: '2px solid #00bcd4',
          borderRadius: '8px',
          fontWeight: 'bold',
          textDecoration: 'none',
          transition: 'transform 0.2s ease'
        }}>
          Features
        </a>
      </div>

      {/* Features Section */}
      <section id="features" style={{ marginTop: '60px', maxWidth: '800px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: '#00bcd4', marginBottom: '20px' }}>Why AL-code.AI?</h2>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '1rem', color: '#444' }}>
          <li>⚡ Instant Python execution with Pyodide</li>
          <li>🧠 Smart, minimal UI for focused coding</li>
          <li>🌍 Designed with global accessibility in mind</li>
          <li>🎯 Built for students, educators, and curious minds</li>
        </ul>
      </section>
    </div>
  );
}

export default LandingPage;
