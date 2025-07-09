import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    profession_title: '',
    years_of_experience: '',
    linkedin_url: '',
    language: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setChecking(false);
      if (!user) {
        alert('Unexpected error occurred');
        logout();
        navigate('/login');
      } else {
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone_number: user.phone_number || '',
          profession_title: user.profession_title || '',
          years_of_experience: user.years_of_experience || '',
          linkedin_url: user.linkedin_url || '',
          language: user.language || '',
        });
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [user, logout, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });
    if (resumeFile) {
      form.append('resume_file', resumeFile);
    }

    try {
      const res = await fetch('http://localhost:3000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
      } else {
        setSuccessMsg('Profile updated successfully!');
        setEditMode(false);

        // Update user in localStorage and context
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload(); // easiest sync solution
      }
    } catch (err) {
      setError('Server error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <div className="ai-page"><div className="ai-container"><p>Loading profile...</p></div></div>;
  if (!user) return <div className="ai-page"><div className="ai-container"><p>Unexpected error occurred</p></div></div>;

  return (
    <div className="ai-page">
      <div className="ai-container">
        <h2>User Profile</h2>

        {!editMode ? (
          <>
            <div className="results-box">
              <table>
                <tbody>
                  <tr><th>First Name</th><td>{user.first_name}</td></tr>
                  <tr><th>Last Name</th><td>{user.last_name}</td></tr>
                  <tr><th>Email</th><td>{user.email}</td></tr>
                  <tr><th>Phone</th><td>{user.phone_number || '-'}</td></tr>
                  <tr><th>Profession</th><td>{user.profession_title || '-'}</td></tr>
                  <tr><th>Experience</th><td>{user.years_of_experience || '-'} years</td></tr>
                  <tr><th>LinkedIn</th><td>{user.linkedin_url ? <a href={user.linkedin_url} target="_blank" rel="noreferrer">View</a> : '-'}</td></tr>
                  <tr><th>Language</th><td>{user.language || '-'}</td></tr>
                  <tr><th>Resume</th><td>{user.resume_file ? <a href={`http://localhost:3000/${user.resume_file}`} target="_blank" rel="noreferrer">Download</a> : 'Not uploaded'}</td></tr>
                  <tr><th>Terms Accepted</th><td>{user.terms_accepted ? '✔ Yes' : '✘ No'}</td></tr>
                </tbody>
              </table>
            </div>
            <button className="update-btn" onClick={() => setEditMode(true)}>Update Profile</button>
          </>
        ) : (
          <form className="update-form" onSubmit={handleSubmit} encType="multipart/form-data">
            {error && <p className="error-msg">{error}</p>}
            {successMsg && <p className="success-msg">{successMsg}</p>}

            <label>First Name:<input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required /></label>
            <label>Last Name:<input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required /></label>
            <label>Phone Number:<input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} /></label>
            <label>Profession Title:<input type="text" name="profession_title" value={formData.profession_title} onChange={handleChange} required /></label>
            <label>Years of Experience:<input type="number" min="0" name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} required /></label>
            <label>LinkedIn URL:<input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} /></label>
            <label>Language:<input type="text" name="language" value={formData.language} onChange={handleChange} /></label>
            <label>Resume File:<input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} /></label>

            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Save'}</button>
              <button type="button" onClick={() => { setEditMode(false); setError(''); setSuccessMsg(''); }}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
