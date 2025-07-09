import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true); // for 3-second timer

  useEffect(() => {
    const timeout = setTimeout(() => {
      setChecking(false);
      if (!user) {
        alert('Unexpected error occurred');
        logout();
        navigate('/login');
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [user, logout, navigate]);

  return (
    <div className="ai-page">
      <div className="ai-container">
        <h2>User Profile</h2>

        {checking ? (
          <p>Loading profile...</p>
        ) : user ? (
          <div className="results-box">
            <table>
              <tbody>
                <tr><th>First Name</th><td>{user.first_name}</td></tr>
                <tr><th>Last Name</th><td>{user.last_name}</td></tr>
                <tr><th>Email</th><td>{user.email}</td></tr>
                <tr><th>Phone</th><td>{user.phone_number}</td></tr>
                <tr><th>Profession</th><td>{user.profession_title}</td></tr>
                <tr><th>Experience</th><td>{user.years_of_experience} years</td></tr>
                <tr><th>LinkedIn</th><td><a href={user.linkedin_url} target="_blank" rel="noreferrer">View</a></td></tr>
                <tr><th>Language</th><td>{user.language}</td></tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p>Unexpected error occurred</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
