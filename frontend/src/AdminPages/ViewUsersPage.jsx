import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../AuthLogins/AuthContext";
import "./ViewUsersPage.css";

const ViewUsersPage = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      // const res = await fetch("http://localhost:3000/api/admin/users", {
      const res = await fetch("https://resumeparserai.onrender.com/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <h2 className="title">All Registered Users</h2>

        {loading ? (
          <p className="no-data-msg">Loading users...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : users.length === 0 ? (
          <p className="no-data-msg">No users found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="history-table" aria-label="Registered Users Table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Profession</th>
                  <th>Experience</th>
                  <th>LinkedIn URL</th>
                  <th>Language</th>
                  <th>Approved</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone_number}</td>
                    <td>{user.profession_title}</td>
                    <td>{user.years_of_experience} yrs</td>
                    <td>
                      {user.linkedin_url ? (
                        <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="link">
                          {user.linkedin_url}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>{user.language || "N/A"}</td>
                    <td>{user.approved ? "✅ Yes" : "❌ No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUsersPage;
