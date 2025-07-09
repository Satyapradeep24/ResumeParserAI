// PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function PrivateRoute({ children, roles }) {
  const { auth } = useContext(AuthContext);

  if (!auth.token) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(auth.role)) {
    // Logged in but role not authorized, redirect home or unauthorized page
    return <Navigate to="/" />;
  }

  if (auth.role === 'user' && !auth.approved) {
    // User is not approved yet, restrict access
    return <Navigate to="/approval-pending" />;
  }

  return children;
}

export default PrivateRoute;
