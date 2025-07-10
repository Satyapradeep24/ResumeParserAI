import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobHunt from './images/JobHunt.png';

function Home() {
  const navigate = useNavigate();
  const [parsedCount, setParsedCount] = useState(0);
  const [aiScoreCount, setAiScoreCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) return;

    const fetchParsedCount = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/auth/count?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setParsedCount(data.count);
      } catch (error) {
        console.error("Error fetching parsed resume count:", error);
      }
    };

    const fetchAiScoreCount = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/auth/ai-score-count?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setAiScoreCount(data.count);
      } catch (error) {
        console.error("Error fetching AI score count:", error);
      }
    };

    fetchParsedCount();
    fetchAiScoreCount();
  }, [userId, token]);

  const featureList = [
    { icon: '⚡', text: 'Lightning-fast Gemini AI parsing' },
    { icon: '🤖', text: 'Automated Candidate Scoring with AI' },
    { icon: '🔒', text: 'End-to-End Data Privacy & Security' },
    { icon: '📄', text: 'Supports PDF, Word & Image Files' },
  ];

  const stats = [
    { label: '📄 Resumes Parsed', value: '30+' },
    { label: '🎯 Jobs Matched', value: '70+' },
    { label: '😊 User Satisfaction', value: 'In Progress...' },
  ];

  const cardStyle = {
    borderRadius: '12px',
    background: '#fff',
    padding: '30px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    minWidth: '250px',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
  };

  const ctaBtnStyle = {
    marginTop: '15px',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6a192 0%, #f0d3aa 50%, #d6b4d1 100%)',
      padding: '50px 20px',
      boxSizing: 'border-box',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      {!user ? (
        <>
          {/* Hero Section */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '50px',
            marginBottom: '60px'
          }}>
            <img
              src={JobHunt}
              alt="Job Search"
              style={{ width: '380px', maxWidth: '90vw', borderRadius: '16px' }}
            />
            <div style={{ maxWidth: '500px' }}>
              <h1 style={{ fontSize: '2.4rem', color: '#333', marginBottom: '20px' }}>
                Transform Your Resume with AI Power
              </h1>
              <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '30px' }}>
                Unlock job opportunities with cutting-edge resume parsing, AI scoring, and personalized cover letters.
              </p>
              <button
                onClick={() => navigate("/register")}
                style={ctaBtnStyle}
              >
                Get Started Free →
              </button>
            </div>
          </div>

          {/* Features */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '25px',
            marginBottom: '40px'
          }}>
            {featureList.map(({ icon, text }, idx) => (
              <div key={idx} style={{
                ...cardStyle,
                maxWidth: '300px',
                fontSize: '1rem',
                fontWeight: '500',
                color: '#007bff'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '15px' }}>{icon}</div>
                {text}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            flexWrap: 'wrap'
          }}>
            {stats.map(({ label, value }, idx) => (
              <div key={idx} style={{
                ...cardStyle,
                background: '#333',
                color: 'white',
                minWidth: '200px',
                fontSize: '1.2rem'
              }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>{value}</div>
                {label}
              </div>
            ))}
          </div>
          {/* <button 
            onClick={() => window.location.href = "http://localhost:3000/auth/google"} 
            style={{backgroundColor: '#4285F4', color: 'white', padding: '10px 20px', borderRadius: '4px'}}
          >
            Login with Google
          </button> */}


        </>
      ) : (
        <div style={{ padding: '50px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', color: '#333' }}>Welcome back, {user.first_name}!</h1>
          <h3 style={{ color: '#555', marginTop: '10px' }}>Your Personalized Dashboard</h3>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            marginTop: '40px',
            flexWrap: 'wrap'
          }}>
            <div style={cardStyle}>
              <h3>Parsed Resume Count</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{parsedCount}</p>
              <button style={ctaBtnStyle} onClick={() => navigate("/resume-history")}>
                View History
              </button>
            </div>
            <div style={cardStyle}>
              <h3>AI Score Submissions</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{aiScoreCount}</p>
              <button style={ctaBtnStyle} onClick={() => navigate("/ai-score-history")}>
                View AI Scores
              </button>
            </div>
            <div style={cardStyle}>
              <h3>Active AI Model</h3>
              <p style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Gemini (Default)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
