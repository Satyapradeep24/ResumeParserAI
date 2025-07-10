import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthLogins/AuthContext';
import { People, Description, Score, Work, BarChart, ExitToApp } from '@mui/icons-material';
import './AdminDashboard.css';

function StatCard({ icon, title, value, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `5px solid ${color}` }}>
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div>
        <div className="stat-value">{value !== null ? value : '...'}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { token, logout } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalUsers: null,
    approvedUsers: null,
    pendingApprovals: null,
    resumesParsed: null,
    aiScoresGenerated: null,
    jobsMatched: null,
  });

  const [error, setError] = useState(null);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      // const res = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
      const res = await fetch('https://resumeparserai.onrender.com/api/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await res.json();
      setStats({
        totalUsers: data.totalUsers,
        approvedUsers: data.approvedUsers,
        pendingApprovals: data.pendingApprovals,
        resumesParsed: data.resumesParsed,
        aiScoresGenerated: data.aiScoresGenerated,
        jobsMatched: data.jobsMatched,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={logout} className="logout-btn">
          <ExitToApp /> Logout
        </button>
      </header>

      {error && <div className="error-msg">{error}</div>}

      <section className="stats-grid">
        <StatCard icon={<People fontSize="large" />} title="Total Users" value={stats.totalUsers} color="#3f51b5" />
        <StatCard icon={<People fontSize="large" />} title="Approved Users" value={stats.approvedUsers} color="#4caf50" />
        <StatCard icon={<People fontSize="large" />} title="Pending Approvals" value={stats.pendingApprovals} color="#f44336" />
        <StatCard icon={<Description fontSize="large" />} title="Resumes Parsed" value={stats.resumesParsed} color="#ff9800" />
        <StatCard icon={<Score fontSize="large" />} title="AI Scores Generated" value={stats.aiScoresGenerated} color="#9c27b0" />
        <StatCard icon={<Work fontSize="large" />} title="Jobs Matched" value={stats.jobsMatched} color="#009688" />
      </section>

      <section className="analytics-section">
        <h2>Analytics & Reports</h2>
        <div className="charts-placeholder">
          {/* Placeholder for charts like bar, line, pie charts */}
          <p>Charts and graphs will be here.</p>
        </div>
      </section>
    </div>
  );
}
