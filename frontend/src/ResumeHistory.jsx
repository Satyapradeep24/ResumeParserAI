import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthLogins/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ResumeHistory.css';

function ResumeHistory() {
  const { token } = useContext(AuthContext);
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
          throw new Error('Failed to fetch resume history.');
        }
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token, navigate]);

  if (loading) return <div className="page"><div className="container">Loading resume history...</div></div>;
  if (error) return <div className="page"><div className="container error">{error}</div></div>;
  if (history.length === 0) return <div className="page"><div className="container">No resume history found.</div></div>;

  return (
    <div className="page">
      <div className="container">
        <h2 className="title">📄 Your Resume Parsing History</h2>
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>📁 File</th>
                <th>👤 Name</th>
                <th>✉️ Email</th>
                <th>📞 Phone</th>
                <th>💼 Post</th>
                <th>🤖 Model</th>
                <th>⭐ AI Score</th>
                <th>🕒 Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={item._id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td>{item.fileName || '-'}</td>
                  <td>{item.fullName || '-'}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.phone || '-'}</td>
                  <td>{item.postAppliedFor || '-'}</td>
                  <td>{item.modelType || '-'}</td>
                  <td style={{ 
                    color: item.aiScore >= 80 ? 'green' : item.aiScore >= 50 ? 'orange' : 'red',
                    fontWeight: '700'
                  }}>
                    {item.aiScore != null ? `${item.aiScore}%` : '-'}
                  </td>
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
