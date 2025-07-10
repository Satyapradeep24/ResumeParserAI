import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobHunt from './images/JobHunt.png';
import './Home.css';

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

  return (
    <div className="home-container">
      {!user ? (
        <>
          {/* Hero Section */}
          <div className="hero-section">
            <img
              src={JobHunt}
              alt="Job Search"
              className="hero-image"
            />
            <div className="hero-text">
              <h1>Transform Your Resume with AI Power</h1>
              <p>
                Unlock job opportunities with cutting-edge resume parsing, AI scoring, and personalized cover letters.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="cta-button"
              >
                Get Started Free →
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="features-list">
            {featureList.map(({ icon, text }, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon">{icon}</div>
                {text}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="stats-list">
            {stats.map(({ label, value }, idx) => (
              <div key={idx} className="stats-card">
                <div className="stats-value">{value}</div>
                {label}
              </div>
            ))}
          </div>
          <div className="how-it-works">
          <h2>📚 How It Works</h2>
          <p className="subtitle">
            Turn your resume into job-winning insights in under <strong>30 seconds</strong>
          </p>
          <p className="total-time">⏱️ Total Process Time: <strong>~30 seconds</strong></p>

          <div className="timeline">
            {[
              {
                step: '1',
                title: 'Upload Resume',
                duration: '5s',
                description: 'Upload PDF, Word, or image resumes with a click.',
              },
              {
                step: '2',
                title: 'Extract Details',
                duration: '8s',
                description: 'AI instantly reads your resume and extracts data.',
              },
              {
                step: '3',
                title: 'AI Scoring',
                duration: '10s',
                description: 'Resume is scored using Gemini or LLaMA-based models.',
              },
              {
                step: '4',
                title: 'Cover Letter Generation',
                duration: '5s',
                description: 'Smart, personalized letters written for each resume.',
              },
              {
                step: '5',
                title: 'Download & Use',
                duration: 'Instant',
                description: 'Download, copy, or access anytime in history.',
                note: 'Includes resume log, AI score & generated cover letter.',
              },
            ].map((item, idx) => (
              <div key={idx} className={`timeline-item ${idx % 2 === 0 ? 'left' : 'right'}`}>
                <div className="content">
                  <h4>
                    <span className="step-circle">{item.step}</span> {item.title}
                    <span className="duration">{item.duration}</span>
                  </h4>
                  <p>{item.description}</p>
                  {item.note && <small>{item.note}</small>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-left">
              <p>&copy; {new Date().getFullYear()} AI Resume Parser. All rights reserved.</p>
            </div>
            <div className="footer-right">
              <p>Built with ❤️ by <strong>Nukala Sai Satya Pradeep</strong></p>
              <p>IVth Year B.Tech, KL University</p>
            </div>
          </div>
        </footer>


        </>
      ) : (
        <div className="dashboard">
          <h1>Welcome back, {user.first_name}!</h1>
          <h3>Your Personalized Dashboard</h3>
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Parsed Resume Count</h3>
              <p className="count">{parsedCount}</p>
              <button className="cta-button" onClick={() => navigate("/resume-history")}>
                View History
              </button>
            </div>
            <div className="dashboard-card">
              <h3>AI Score Submissions</h3>
              <p className="count">{aiScoreCount}</p>
              <button className="cta-button" onClick={() => navigate("/ai-score-history")}>
                View AI Scores
              </button>
            </div>
            <div className="dashboard-card">
              <h3>Active AI Model</h3>
              <p className="count">Gemini (Default)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
