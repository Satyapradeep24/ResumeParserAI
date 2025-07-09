import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthLogins/AuthContext';
import './NavBar.css';

function NavBar() {
  const { token, role, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {/* Show Home only for regular users */}
        {token && role === 'user' && (
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Home
            </NavLink>
          </li>
        )}

        {/* Both admin and user can access Parser and AI Scoring */}
        {token && (role === 'user' || role === 'admin') && (
          <>
            <li>
              <NavLink to="/parser" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Parser
              </NavLink>
            </li>
            <li>
              <NavLink to="/ai-scoring" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                AI Scoring
              </NavLink>
            </li>
          </>
        )}

        {/* Admin dashboard link only for admin */}
        {token && role === 'admin' && (
          <li>
            <NavLink to="/adminDashboard" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Admin Dashboard
            </NavLink>
          </li>
        )}

        {/* Dropdown for logged in users/admins */}
        {token ? (
          <li className="navbar-dropdown" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="dropdown-toggle">
              {user ? `${user.first_name} ${user.last_name}` : (role === 'admin' ? 'Admin' : 'User')} ▾
            </button>
            {dropdownOpen && (
              <ul className="dropdown-menu">
                <li>
                  <NavLink
                    to="/user-profile"
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </NavLink>
                </li>
                <li>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </li>
        ) : (
          // Not logged in: show login/register
          <>
            <li>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Register
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
