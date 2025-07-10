import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function LoginSuccess() {
  const navigate = useNavigate();
  const { setUser, setToken, setRole, setApproved } = useContext(AuthContext);

  useEffect(() => {
    async function handleLogin() {
      try {
        // Extract JWT token from URL hash e.g. #token=xxx
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const token = hashParams.get('token');

        if (!token) {
          console.error('LoginSuccess error: No token found in URL');
          navigate('/login');
          return;
        }

        // Fetch user profile with token
        const res = await fetch('http://localhost:3000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errMsg = `Failed to fetch profile, status: ${res.status}`;
          console.error('LoginSuccess error:', errMsg);
          throw new Error(errMsg);
        }

        const data = await res.json();

        setToken(token);
        setUser(data.user);
        setRole(data.user.role);
        setApproved(data.user.approved);

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('approved', data.user.approved);

        navigate('/');
      } catch (error) {
        console.error('LoginSuccess unexpected error:', error);
        navigate('/login');
      }
    }

    handleLogin();
  }, [navigate, setToken, setUser, setRole, setApproved]);

  return <div>Logging you in...</div>;
}

export default LoginSuccess;
