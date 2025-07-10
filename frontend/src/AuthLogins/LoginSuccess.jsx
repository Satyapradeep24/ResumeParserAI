import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function LoginSuccess() {
  const navigate = useNavigate();
  const { setUser, setToken, setRole, setApproved } = useContext(AuthContext);

  useEffect(() => {
    // Extract token from URL fragment
    const hash = window.location.hash;
    const tokenMatch = hash.match(/token=([^&]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (token) {
      // Save token to localStorage and context
      localStorage.setItem('token', token);
      setToken(token);

      // Optionally fetch user info from backend or decode token here
      // For simplicity, redirect to profile or home page
      navigate('/');
    } else {
      // No token found, redirect to login
      navigate('/login');
    }
  }, [navigate, setToken]);

  return <div>Logging you in...</div>;
}

export default LoginSuccess;
