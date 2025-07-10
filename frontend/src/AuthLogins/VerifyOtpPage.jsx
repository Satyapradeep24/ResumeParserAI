import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './VerifyOTPPage.css';  // import the CSS

function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setResendMsg('');

    if (!email || !otp) {
      setError('Please fill both email and OTP');
      return;
    }

    setLoading(true);
    try {
      // const res = await fetch('http://localhost:3000/api/auth/verify-otp', {
      const res = await fetch('https://resumeparserai.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      setSuccessMsg('OTP verified successfully! You can now login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccessMsg('');
    setResendMsg('');
    if (!email) {
      setError('Email is required to resend OTP');
      return;
    }

    setResendLoading(true);
    try {
      // const res = await fetch('http://localhost:3000/api/auth/resend-otp', {
      const res = await fetch('https://resumeparserai.onrender.com/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Resend OTP failed');
      }

      setResendMsg('OTP resent successfully. Please check your email.');
    } catch (err) {
      setError(err.message || 'Resend OTP failed');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="verifyotp-container-wrapper">
    <div className="verifyotp-container">
      <h1>Verify OTP</h1>
      {error && <div className="error-msg">{error}</div>}
      {successMsg && <div className="success-msg">{successMsg}</div>}
      {resendMsg && <div className="success-msg">{resendMsg}</div>}

      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Registered Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled
        />

        <input
          type="text"
          name="otp"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOTP(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={resendLoading}
        className="resend-btn"
      >
        {resendLoading ? 'Resending OTP...' : 'Resend OTP'}
      </button>

      <p className="register-footer">
        Didn't receive an OTP? You can resend or <Link to="/register">Register again</Link>
      </p>
    </div>
    </div>
  );
}

export default VerifyOTPPage;
