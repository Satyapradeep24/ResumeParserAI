import React, { useState, useCallback } from 'react';
import './AIScoringPage.css';
import NavBar from './NavBar';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import App from './App';


function AIScoringPage() {
  <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ai-scoring" element={<AIScoringPage />} />
      </Routes>
    </Router>
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [modelType, setModelType] = useState('gemini');
  const [results, setResults] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const validFiles = selected.filter(file => {
      const type = file.type.toLowerCase();
      return type.includes('pdf') || type.includes('word') || type.includes('image');
    });

    if (validFiles.length === 0) {
      setError('Please upload PDF, DOCX, PNG, or JPG files.');
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    const dropped = Array.from(e.dataTransfer.files);
    handleFileChange({ target: { files: dropped } });
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!jobDescription || files.length === 0) {
      setError('Please provide job description and upload files.');
      return;
    }

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setError('Authentication token not found. Please login.');
        return;
      }
    const formData = new FormData();
    files.forEach(file => formData.append('resumes', file));
    formData.append('modelType', modelType);
    formData.append('jobDescription', jobDescription);

    try {
      // const res = await fetch('http://localhost:3000/api/resume/ai-score', {
      const res = await fetch('https://resumeparserai.onrender.com/api/resume/ai-score', {
        headers: {
          Authorization: `Bearer ${token}`,  // <-- Add token here
        },
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to score');

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="ai-container">
        <h1>AI Resume Scoring</h1>

        <textarea
          className="input-textarea"
          rows="5"
          placeholder="Enter job description..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <div
          className={`drop-zone ${isDragActive ? 'active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <p>Drag & Drop resumes here or</p>
          <input
            type="file"
            accept=".pdf,.docx,.jpg,.png"
            multiple
            id="upload-input"
            onChange={handleFileChange}
            hidden
          />
          <label htmlFor="upload-input" className="upload-button">Select Files</label>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {files.length > 0 && (
          <div className="file-list">
            <h4>Selected Files:</h4>
            <ul>
              {files.map((file, i) => (
                <li key={i}>
                  {file.name}
                  <button onClick={() => removeFile(i)}>Remove</button>
                </li>
              ))}
            </ul>
            <button onClick={handleUpload} className="submit-button" disabled={loading}>
              {loading ? 'Scoring...' : 'Score Resumes'}
            </button>
          </div>
        )}

        <div className="model-select">
          <label>
            <input
              type="radio"
              name="model"
              value="gemini"
              checked={modelType === 'gemini'}
              onChange={(e) => setModelType(e.target.value)}
            />
            Gemini
          </label>
        </div>

        {results.length > 0 && (
          <div className="results-box">
            <h3>Scoring Results</h3>
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Model</th>
                  <th>Score</th>
                  <th>Position</th>
                  <th>Match</th>
                  <th>Experience</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.fileName}</td>
                    <td>{r.modelType}</td>
                    <td>{r.aiScore}%</td>
                    <td>{r.postAppliedFor}</td>
                    <td>{r.positionMatch ? '✓ Match' : '✗ No Match'}</td>
                    <td>{r.totalExperience}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIScoringPage;

