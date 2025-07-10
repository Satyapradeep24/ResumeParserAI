import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthLogins/AuthContext";
import "./AuditLogsPage.css";

const MODEL_TYPES = ["gemini", "gpt-4", "deepseek", "llama", "all"];

const AuditLogsPage = () => {
  const { token } = useContext(AuthContext);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [userId, setUserId] = useState("");
  const [modelType, setModelType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", PAGE_SIZE);

      if (userId.trim()) params.append("userId", userId.trim());
      if (modelType !== "all") params.append("modelType", modelType);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      // const res = await fetch(`http://localhost:3000/api/admin/audit-logs?${params.toString()}`, {
      const res = await fetch(`https://resumeparserai.onrender.com/api/admin/audit-logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch logs");

      setLogs(data); // since backend is returning array directly
      setTotalPages(1); // pagination not implemented yet on backend

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleClearFilters = () => {
    setUserId("");
    setModelType("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <div className="audit-logs-page">
    <div className="audit-logs-container">
      <h2>Audit Logs & History</h2>

      <form className="filters-form" onSubmit={handleFilterSubmit}>
        <div className="form-group">
          <label>User ID:</label>
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Model Type:</label>
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
          >
            {MODEL_TYPES.map((model) => (
              <option key={model} value={model}>
                {model.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Date To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="buttons-group">
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Filter"}
          </button>
          <button type="button" onClick={handleClearFilters} disabled={loading}>
            Clear
          </button>
        </div>
      </form>

      {error && <p className="error-msg">{error}</p>}

      <div className="logs-table-wrapper">
        <table className="logs-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Parsed Resume</th>
              <th>Model Used</th>
              <th>IP Address</th>
              <th>Device Info</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No audit logs found.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{log.userId}</td>
                <td>{log.resumeFileName || "N/A"}</td>
                <td>{log.modelType}</td>
                <td>{log.ipAddress || "N/A"}</td>
                <td>{log.deviceInfo || "N/A"}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

export default AuditLogsPage;
