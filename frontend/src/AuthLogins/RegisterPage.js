import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';
import JobHuntImage from '../images/register.png'; // adjust path if needed

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    profession_title: '',
    years_of_experience: '',
    linkedin_url: '',
    resume_file: null,
    language: 'en',
    terms_accepted: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] || null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!formData.terms_accepted) {
      setError('You must accept the Terms of Service and Privacy Policy');
      return;
    }
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.profession_title || !formData.years_of_experience) {
      setError('Please fill all required fields');
      return;
    }
    if (isNaN(formData.years_of_experience) || formData.years_of_experience < 0) {
      setError('Years of experience must be a positive number');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('phone_number', formData.phone_number);
      data.append('profession_title', formData.profession_title);
      data.append('years_of_experience', formData.years_of_experience);
      data.append('linkedin_url', formData.linkedin_url);
      if (formData.resume_file) data.append('resume_file', formData.resume_file);
      data.append('language', formData.language);
      data.append('role', 'user');
      data.append('terms_accepted', formData.terms_accepted);

      // const res = await fetch('http://localhost:3000/api/auth/registerUser', {
      const res = await fetch('https://resumeparserai.onrender.com/api/auth/registerUser', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Registration failed');
      }

      navigate('/verify-otp', { state: { email: formData.email } });

    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* <div className="register-image-container"> */}
        <img src={JobHuntImage} alt="Job Hunt" className="register-image" />
      {/* </div> */}
      <div className="register-form-container">
        <h1>Register</h1>
        {error && <div className="error-msg">{error}</div>}

        <form className="register-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            type="text"
            name="first_name"
            placeholder="First Name *"
            value={formData.first_name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="last_name"
            placeholder="Last Name *"
            value={formData.last_name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="username"
          />

          <input
            type="password"
            name="password"
            placeholder="Password *"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password *"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
          />

          <input
            type="text"
            name="profession_title"
            placeholder="Profession Title *"
            value={formData.profession_title}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="years_of_experience"
            placeholder="Years of Experience *"
            value={formData.years_of_experience}
            onChange={handleChange}
            min="0"
            required
          />

          <input
            type="url"
            name="linkedin_url"
            placeholder="LinkedIn URL"
            value={formData.linkedin_url}
            onChange={handleChange}
          />

          <label className="file-upload-label">
            Upload Resume (optional)
            <input
              type="file"
              name="resume_file"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
            />
          </label>

          <label className="terms-checkbox">
            <input
              type="checkbox"
              name="terms_accepted"
              checked={formData.terms_accepted}
              onChange={handleChange}
              required
            />{' '}
            I accept the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
