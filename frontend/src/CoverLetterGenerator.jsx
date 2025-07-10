import React, { useState, useContext } from 'react';
import './CoverLetterGenerator.css';
import { AuthContext } from './AuthLogins/AuthContext';

const CoverLetterGenerator = () => {
  const { token } = useContext(AuthContext);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('formal');
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile || !jobDescription) {
      setError('Please upload a resume and provide a job description.');
      return;
    }

    setLoading(true);
    setError('');
    setCoverLetter('');
    setCopySuccess('');

    try {
      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('jobDescription', jobDescription);
      formData.append('tone', tone);

      // const res = await fetch('http://localhost:3000/api/resume/generate-cover-letter', {
      const res = await fetch('https://resumeparserai.onrender.com/api/resume/generate-cover-letter', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }

      setCoverLetter(data.coverLetter);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter).then(() => {
      setCopySuccess('Copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  return (
    <div className="cover-letter-wrapper">
      <div className="cover-letter-card">
        <h2 className="cover-letter-title">Generate Cover Letter</h2>

        <form className="cover-letter-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="resume-upload">Upload Resume (PDF or Word):</label>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files[0])}
            required
          />

          <label htmlFor="job-description">Job Description:</label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            required
          />

          <label htmlFor="tone-select">Tone:</label>
          <select
            id="tone-select"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="formal">Formal</option>
            <option value="friendly">Friendly</option>
            <option value="creative">Creative</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Cover Letter'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {coverLetter && (
          <section className="cover-letter-result">
            <div className="copy-container">
              <button
                onClick={handleCopy}
                className="btn-copy"
                aria-label="Copy cover letter"
              >
                📋 Copy Cover Letter
              </button>
              {copySuccess && <span className="copy-success">{copySuccess}</span>}
            </div>
            <h3>Your AI-Generated Cover Letter</h3>
            <pre>{coverLetter}</pre>
          </section>
        )}
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
