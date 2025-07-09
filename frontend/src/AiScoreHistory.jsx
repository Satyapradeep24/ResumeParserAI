import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthLogins/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AiScoreHistory.css';

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

        if (!res.ok) throw new Error('Failed to fetch AI score history');

        const data = await res.json();
        setScores(data);
      } catch (err) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [token, navigate]);

  if (loading) return <div className="page"><div className="container">Loading AI score history...</div></div>;
  if (error) return <div className="page"><div className="container error">{error}</div></div>;
  if (scores.length === 0) return <div className="page"><div className="container">No AI score history found.</div></div>;

  return (
    <div className="page">
      <div className="container">
        <h2 className="title">🤖 Your AI Resume Scoring History</h2>

        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>📁 File Name</th>
                <th>💼 Post Applied</th>
                <th>🧠 Model</th>
                <th>⭐ Score</th>
                <th>✔️ Match</th>
                <th>🕒 Timestamp</th>
                <th>🔍 Details</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, idx) => (
                <React.Fragment key={s._id}>
                  <tr className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td>{s.fileName || '-'}</td>
                    <td>{s.postAppliedFor || '-'}</td>
                    <td>{s.modelType || '-'}</td>
                    <td style={{ 
                      color: s.aiScore >= 80 ? 'green' : s.aiScore >= 50 ? 'orange' : 'red',
                      fontWeight: '700'
                    }}>
                      {s.aiScore != null ? `${s.aiScore}%` : '-'}
                    </td>

                    <td>{s.positionMatch ? '✓' : '✗'}</td>
                    <td>{new Date(s.timestamp).toLocaleString()}</td>
                    <td>
                      <button
                        className="show-more-btn"
                        onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                        aria-expanded={expandedIndex === idx}
                      >
                        {expandedIndex === idx ? 'Hide' : 'View'} Reasons
                      </button>
                    </td>
                  </tr>

                  {expandedIndex === idx && (
                    <tr className="expanded-row">
                      <td colSpan={7}>
                        <div className="details-popup">
                          <h4>Job Description</h4>
                          <p>{s.jobDescription || 'No job description provided.'}</p>

                          <h4>Match Reasons</h4>
                          {s.matchReasons && s.matchReasons.length > 0 ? (
                            <ul>{s.matchReasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                          ) : <p>None</p>}

                          <h4>Mismatch Reasons</h4>
                          {s.mismatchReasons && s.mismatchReasons.length > 0 ? (
                            <ul>{s.mismatchReasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                          ) : <p>None</p>}

                          <button
                            className="close-btn"
                            onClick={() => setExpandedIndex(null)}
                            aria-label="Close details"
                          >
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
        </div>
      </div>
    </div>
  );
}

export default AiScoreHistory;
