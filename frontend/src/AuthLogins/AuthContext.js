import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [approved, setApproved] = useState(() => localStorage.getItem('approved') === 'true');
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Existing user login
  const login = async (email, password) => {
    const res = await fetch('http://localhost:3000/api/auth/userLogin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setToken(data.token);
    setRole(data.role);
    setApproved(data.approved);
    setUser(data.user);

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('approved', data.approved);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  // New Admin login
  const loginAdmin = async (email, password) => {
    const res = await fetch('http://localhost:3000/api/auth/adminLogin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Admin login failed');
    }

    setToken(data.token);
    setRole(data.role);
    setApproved(data.approved);
    setUser(data.user);

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('approved', data.approved);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setApproved(false);
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, role, approved, user, login, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
