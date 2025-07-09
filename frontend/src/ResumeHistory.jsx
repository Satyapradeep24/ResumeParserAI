import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthLogins/AuthContext';
import { useNavigate } from 'react-router-dom';

function ResumeHistory() {
  const { token, user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch history');
        }
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token, navigate]);

  if (loading) return <div className="ai-page"><div className="ai-container">Loading resume history...</div></div>;
  if (error) return <div className="ai-page"><div className="ai-container error-msg">Error: {error}</div></div>;
  if (history.length === 0) return <div className="ai-page"><div className="ai-container">No resume history found.</div></div>;

  return (
    <div className="ai-page">
      <div className="ai-container">
        <h2>Your Resume Parsing History</h2>
        <div className="results-box">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Post Applied For</th>
                <th>Model Type</th>
                <th>AI Score</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item._id}>
                  <td>{item.fileName}</td>
                  <td>{item.fullName || '-'}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.phone || '-'}</td>
                  <td>{item.postAppliedFor || '-'}</td>
                  <td>{item.modelType}</td>
                  <td>{item.aiScore != null ? item.aiScore : '-'}</td>
                  <td>{new Date(item.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ResumeHistory;
