import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthLogins/AuthContext';
import { useNavigate } from 'react-router-dom';

function AiScoreHistory() {
  const { token } = useContext(AuthContext);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchScores = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/ai-score-history', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch AI score history");

        const data = await res.json();
        setScores(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [token, navigate]);

  if (loading) return <div>Loading AI score history...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h2>Your AI Resume Scoring History</h2>
        <div style={resultsBoxStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={thStyle}>File Name</th>
                <th style={thStyle}>Post Applied</th>
                <th style={thStyle}>Model</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Match</th>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>Details</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, idx) => (
                <React.Fragment key={s._id}>
                  <tr style={idx % 2 === 0 ? evenRowStyle : {}}>
                    <td style={tdStyle}>{s.fileName}</td>
                    <td style={tdStyle}>{s.postAppliedFor || '-'}</td>
                    <td style={tdStyle}>{s.modelType}</td>
                    <td style={tdStyle}>{s.aiScore}%</td>
                    <td style={tdStyle}>{s.positionMatch ? '✓' : '✗'}</td>
                    <td style={tdStyle}>{new Date(s.timestamp).toLocaleString()}</td>
                    <td style={tdStyle}>
                      <button
                        style={showMoreButtonStyle}
                        onClick={() => setExpandedIndex(idx)}
                      >View Reasons</button>
                    </td>
                  </tr>

                  {expandedIndex === idx && (
                    <tr>
                      <td colSpan={8}>
                        <div style={popupStyle}>
                          <h4>Job Description</h4>
                          <p>{s.jobDescription}</p>
                          <h4>Match Reasons</h4>
                          <ul>{s.matchReasons?.map((r, i) => <li key={i}>{r}</li>)}</ul>
                          <h4>Mismatch Reasons</h4>
                          <ul>{s.mismatchReasons?.map((r, i) => <li key={i}>{r}</li>)}</ul>
                          <button onClick={() => setExpandedIndex(null)} style={closeButtonStyle}>
                            Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {scores.length === 0 && (
            <div className="no-data-msg" style={noDataMsgStyle}>
              No AI score history found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// === Inline Styles ===
const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f6a192 0%, #f0d3aa 50%, #d6b4d1 100%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '30px 10px'
};

const containerStyle = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 0 18px rgba(0, 0, 0, 0.1)',
  padding: '30px',
  maxWidth: '1100px',
  width: '100%'
};

const resultsBoxStyle = {
  marginTop: '30px',
  overflowX: 'auto',
  border: '1px solid #ddd',
  borderRadius: '6px',
  background: '#fff',
  padding: '15px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.9rem'
};

const thStyle = {
  padding: '10px 12px',
  border: '1px solid #ddd',
  textAlign: 'left',
  verticalAlign: 'top',
  backgroundColor: '#007bff',
  color: 'black',
  fontWeight: 600
};

const tdStyle = {
  padding: '10px 12px',
  border: '1px solid #ddd',
  verticalAlign: 'top'
};

const headerRowStyle = {
  backgroundColor: '#007bff',
  color: '#fff'
};

const evenRowStyle = {
  backgroundColor: '#f9f9f9'
};

const showMoreButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#007bff',
  cursor: 'pointer',
  fontWeight: 600,
  padding: 0,
  marginTop: '4px',
  fontSize: '0.85rem'
};

const popupStyle = {
  backgroundColor: '#f4f4f4',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  position: 'relative',
  lineHeight: '1.6'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: '#dc3545',
  color: 'white',
  border: 'none',
  padding: '5px 10px',
  borderRadius: '4px',
  cursor: 'pointer'
};

const noDataMsgStyle = {
  marginTop: '20px',
  textAlign: 'center',
  fontSize: '1.2rem',
  color: '#777',
  fontWeight: 600,
  minHeight: '50px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export default AiScoreHistory;
