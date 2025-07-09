import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import JobHunt from '../images/login.png'; // adjust path if needed
import './LoginPage.css';

function AdminLoginPage() {
  const { loginAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAdmin(email.trim().toLowerCase(), password);
      navigate('/adminDashboard'); // redirect admin to dashboard
    } catch (err) {
      setError(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src={JobHunt} alt="Job Hunt" className="login-image" />

      <div className="login-form-container">
        <h1>Admin Login</h1>
        {error && <div className="error-msg">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="username"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <Link to="/adminForgotPassword" className="forgot-password-link">
              Forgot Password?
            </Link>
          </p>
          {/* <p>
            Don't have an account? <Link to="/adminRegister">Register here</Link>
          </p> */}
          <p>
            Or go to <Link to="/login">User Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
