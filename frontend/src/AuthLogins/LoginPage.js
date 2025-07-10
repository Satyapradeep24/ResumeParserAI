import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import JobHunt from '../images/login.png'; // adjust the path if needed
import './LoginPage.css';

function LoginPage() {
  const { login } = useContext(AuthContext);
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
      await login(email.trim().toLowerCase(), password);
      navigate('/'); // redirect after successful login
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src={JobHunt} alt="Job Hunt" className="login-image" />

      <div className="login-form-container">
        <h1>Login</h1>
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
        <button
          onClick={() => {
            // window.location.href = "http://localhost:3000/auth/google";
            window.location.href = "https://resumeparserai.onrender.com/auth/google";
          }}
          className="login-google-btn"
        >
          Login with Google
        </button>


        <div className="login-footer">
          <p>
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </p>
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
