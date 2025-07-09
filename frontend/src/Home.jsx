import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import './App.css';
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
    { icon: '⚡', text: 'Fast & Accurate Google gemini parsing' },
    { icon: '🤖', text: 'AI Candidate Scoring' },
    { icon: '🔒', text: 'Secure & Private' },
    { icon: '📄', text: 'Multi-format Support' },
  ];

  const stats = [
    { label: '📄 Resumes Parsed', value: '30+' },
    { label: '🎯 Jobs Matched', value: '70+' },
    { label: '😊 User Satisfaction', value: 'On process...' },
  ];


  const ctaBtnStyle = {
    marginTop: '10px',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 'bold',
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
      padding: '40px',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif'
    }}>
      {!user ? (
        <>
          {/* <div style={{ marginLeft: '580px' }}>
                <button onClick={() => navigate("/login")} style={ctaBtnStyle}>Login</button>
                <button
                  onClick={() => navigate("/register")}
                  style={{ ...ctaBtnStyle, marginLeft: '15px', backgroundColor: '#6c63ff' }}
                >
                  Register
                </button>
              </div> */}
          {/* Top Section: Image + Features */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            marginBottom: '50px'
          }}>
            {/* Left - Image */}
            <img
              src={JobHunt}
              alt="Job Hunt"
              style={{
                width: '400px',
                maxWidth: '90vw',
                borderRadius: '12px',
                
              }}
            />

            {/* Right - Features */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '400px'
            }}>
              <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
                Why Choose Us?
              </h1>
              {featureList.map((f, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  borderRadius: '10px',
                  padding: '15px 20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#007bff'
                }}>
                  <span style={{ fontSize: '1.8rem' }}>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}

              {/* CTA Buttons */}
              
            </div>
          </div>

          {/* Stats Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '50px',
            flexWrap: 'wrap',
            marginTop: '40px'
          }}>
            {stats.map(({ label, value }, idx) => (
              <div key={idx} style={{
                // backgroundColor: '#007bff',
                color: 'white',
                borderRadius: '12px',
                padding: '25px 40px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                minWidth: '150px',
                fontWeight: '700',
                fontSize: '1.3rem',
                userSelect: 'none',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem' }}>{value}</div>
                <div style={{ marginTop: '5px', fontSize: '1rem', fontWeight: '500' }}>{label}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h1>Welcome to the Resume Parser App</h1>
          <h2>Dashboard</h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              border: '1px solid #ccc',
              padding: '20px',
              width: '250px',
              borderRadius: '10px',
              backgroundColor: '#f3f3f3',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h3>Parsed Resume Count</h3>
              <p>{parsedCount}</p>
              <button style={ctaBtnStyle} onClick={() => navigate("/resume-history")}>
                View History
              </button>
            </div>

            <div style={{
              border: '1px solid #ccc',
              padding: '20px',
              width: '250px',
              borderRadius: '10px',
              backgroundColor: '#f3f3f3',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h3>Past AI Score History</h3>
              <p>{aiScoreCount}</p>
              <button style={ctaBtnStyle} onClick={() => navigate("/ai-score-history")}>
                View AI Scores
              </button>
            </div>

            <div style={{
              border: '1px solid #ccc',
              padding: '20px',
              width: '250px',
              borderRadius: '10px',
              backgroundColor: '#f3f3f3',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h3>AI Model Used</h3>
              <p>Gemini (default)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
