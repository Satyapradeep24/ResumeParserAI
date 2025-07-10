import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './CompleteProfile.css';

const CompleteProfile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    profession_title: '',
    years_of_experience: '',
    linkedin_url: '',
    language: 'en',
    terms_accepted: false
  });

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      email: searchParams.get('email') || '',
      first_name: searchParams.get('first_name') || '',
      last_name: searchParams.get('last_name') || ''
    }));
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // const res = await fetch('http://localhost:3000/api/auth/complete-google-profile', {
      const res = await fetch('https://resumeparserai.onrender.com/api/auth/complete-google-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to complete profile');

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('approved', data.approved);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="complete-profile-container">
      <div className="profile-card">
        <h2>Complete Your Profile</h2>
        <p className="subheading">Please fill in the details below to finish your registration.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="first_name">First Name <span className="required">*</span></label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="John"
              value={form.first_name}
              onChange={handleChange}
              required
              autoComplete="given-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name <span className="required">*</span></label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Doe"
              value={form.last_name}
              onChange={handleChange}
              required
              autoComplete="family-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              disabled
              autoComplete="email"
            />
            <small className="info-text">Email is verified and cannot be changed.</small>
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="+1 234 567 890"
              value={form.phone_number}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profession_title">Profession Title <span className="required">*</span></label>
            <input
              id="profession_title"
              name="profession_title"
              type="text"
              placeholder="e.g. Software Engineer"
              value={form.profession_title}
              onChange={handleChange}
              required
              autoComplete="organization-title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="years_of_experience">Years of Experience <span className="required">*</span></label>
            <input
              id="years_of_experience"
              name="years_of_experience"
              type="number"
              min="0"
              step="1"
              placeholder="3"
              value={form.years_of_experience}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="linkedin_url">LinkedIn Profile URL</label>
            <input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={form.linkedin_url}
              onChange={handleChange}
              autoComplete="url"
            />
          </div>

          <div className="form-group">
            <label htmlFor="language">Preferred Language</label>
            <input
              id="language"
              name="language"
              type="text"
              placeholder="English"
              value={form.language}
              onChange={handleChange}
              autoComplete="language"
            />
          </div>

          <label className="terms-label" htmlFor="terms_accepted">
            <input
              type="checkbox"
              id="terms_accepted"
              name="terms_accepted"
              checked={form.terms_accepted}
              onChange={handleChange}
              required
            />
            I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> <span className="required">*</span>
          </label>

          <button type="submit" className="btn-primary">Finish Registration</button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
