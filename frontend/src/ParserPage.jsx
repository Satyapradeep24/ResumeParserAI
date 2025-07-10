import React, { useState, useCallback } from 'react';

import './ParserPage.css';

function ExpandableCell({ content }) {
  const [expanded, setExpanded] = useState(false);

  const isString = typeof content === 'string';
  const isLongContent = isString && content.length > 300;

  const toggleExpanded = () => setExpanded(prev => !prev);

  return (
    <div>
      <div className={isLongContent && !expanded ? 'truncate-text' : ''}>
        {content}
      </div>
      {isLongContent && (
        <button className="show-more-button" onClick={toggleExpanded}>
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
}


function ParserPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [modelType, setModelType] = useState('gemini');
  const [parsedResults, setParsedResults] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const validFiles = Array.from(e.target.files).filter(file => {
        const fileType = file.type.toLowerCase();
        return fileType === 'application/pdf' ||
               fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               fileType === 'image/png' ||
               fileType === 'image/jpeg';
      });

      if (validFiles.length === 0) {
        setError('Please upload PDF, DOCX, PNG or JPG files only');
        return;
      }

      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      setError(null);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);

    const validFiles = Array.from(e.dataTransfer.files).filter(file => {
      const fileType = file.type.toLowerCase();
      return fileType === 'application/pdf' ||
             fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
             fileType === 'image/png' ||
             fileType === 'image/jpeg';
    });

    if (validFiles.length === 0) {
      setError('Please upload PDF, DOCX, PNG or JPG files only');
      return;
    }

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    setError(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    setProcessingStatus('Starting upload...');

    const formData = new FormData();
    files.forEach(file => formData.append('resumes', file));
    formData.append('modelType', modelType);

    try {
      setProgress(5);
      setProcessingStatus(`Uploading ${files.length} files...`);

      // Get token from localStorage (adjust if stored differently)
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setError('Authentication token not found. Please login.');
        return;
      }

      const response = await fetch('http://localhost:3000/api/resume/batch-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,  // <-- Add token here
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const errorMessages = errorData.errors.map(err => `${err.fileName}: ${err.error}`).join('\n');
          throw new Error(errorMessages);
        } else {
          throw new Error(errorData.error || `Upload failed with status ${response.status}`);
        }
      }

      const BATCH_SIZE = 4;
      const totalBatches = Math.ceil(files.length / BATCH_SIZE);
      const progressPerBatch = 80 / totalBatches;

      let currentBatch = 0;
      const progressInterval = setInterval(() => {
        if (currentBatch < totalBatches) {
          const batchStart = currentBatch * BATCH_SIZE;
          const batchEnd = Math.min(batchStart + BATCH_SIZE, files.length);
          setProgress(10 + (currentBatch * progressPerBatch));
          setProcessingStatus(`Processing batch ${currentBatch + 1} of ${totalBatches} (Files ${batchStart + 1}-${batchEnd})`);
          currentBatch++;
        } else {
          clearInterval(progressInterval);
        }
      }, 5000);

      const responseData = await response.json();

      setParsedResults(responseData.results);

      // Convert base64 excelData to blob and trigger download (if exists)
      if (responseData.excelData) {
        const byteCharacters = atob(responseData.excelData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'parsed_resumes.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      setFiles([]);
      setProcessingStatus('Complete!');
      setTimeout(() => {
        setProgress(0);
        setProcessingStatus('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to upload resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="ai-page">
      <div className="ai-container">
        <h1>Resume AI Parser</h1>

        <div
          className={`drop-zone ${isDragActive ? 'active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {error && <div className="error-msg">{error}</div>}

          <p>Drag & Drop Resumes Here</p>
          <p>or</p>
          <input
            id="resume-upload"
            type="file"
            multiple
            accept=".pdf,.docx,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor="resume-upload" className="upload-button">
            Select Resumes
          </label>
        </div>

        {files.length > 0 && (
          <div className="file-list">
            <p>Selected files ({files.length}):</p>
            <ul>
              {files.map((file, i) => (
                <li key={i}>
                  {file.name}
                  <button onClick={() => removeFile(i)}>Remove</button>
                </li>
              ))}
            </ul>

            <button
              className="submit-button"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? `Uploading... ${Math.round(progress)}%` : 'Upload and Parse All'}
            </button>
          </div>
        )}

        <div className="model-select">
          {['gemini'].map(model => (
            <label key={model}>
              <input
                type="radio"
                name="model"
                value={model}
                checked={modelType === model}
                onChange={() => setModelType(model)}
              />
              {model.toUpperCase()}
            </label>
          ))}
        </div>


        {loading && (
          <div style={{ marginTop: 20 }}>
            <progress value={progress} max="100" style={{ width: '100%' }} />
            <p>{processingStatus}</p>
          </div>
        )}

        {parsedResults.length > 0 && (
          <div className="results-box">
            <h3>Parsed Results</h3>
            <table>
              <thead>
                <tr>
                  {Object.keys(parsedResults[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedResults.map((result, idx) => (
                  <tr key={idx}>
                    {Object.values(result).map((value, i) => (
                      <td key={i}>
                        {typeof value === 'object'
                          ? Array.isArray(value)
                            ? value.map((item, j) =>
                                typeof item === 'object' ? (
                                  <ExpandableCell
                                    key={j}
                                    content={Object.entries(item).map(([k, v]) => (
                                      <div key={k}>
                                        <strong>{k}:</strong> {v}
                                      </div>
                                    ))}
                                  />
                                ) : (
                                  <ExpandableCell key={j} content={item.toString()} />
                                )
                              )
                            : <ExpandableCell content={JSON.stringify(value)} />
                          : <ExpandableCell content={value?.toString() || ''} />
                        }
                      </td>
                    ))}
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

export default ParserPage;
