import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthLogins/AuthContext';
import './NavBar.css';

function NavBar() {
  const { token, role, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const adminDropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  const toggleAdminDropdown = () => {
    setAdminDropdownOpen(prev => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setAdminDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {token && role === 'user' && (
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Home
            </NavLink>
          </li>
        )}

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
            <li>
              <NavLink to="/cover-letter" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Cover Letter Generator
              </NavLink>
            </li>
          </>
        )}

        {/* Admin Controls Dropdown */}
        {token && role === 'admin' && (
          <li className="navbar-dropdown" ref={adminDropdownRef}>
            <button onClick={toggleAdminDropdown} className="dropdown-toggle">
              Admin Controls ▾
            </button>
            {adminDropdownOpen && (
              <ul className="dropdown-menu">
                <li>
                  <NavLink
                    to="/adminDashboard"
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                    onClick={() => setAdminDropdownOpen(false)}
                  >
                    Admin Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/auditlogs"
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                    onClick={() => setAdminDropdownOpen(false)}
                  >
                    Audit Logs
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/view-users"
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                    onClick={() => setAdminDropdownOpen(false)}
                  >
                    View Users
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        )}

        {/* User/Admin Profile Dropdown */}
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
          <>
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Home
              </NavLink>
            </li>
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
