import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './NavBar';
import LoginPage from './AuthLogins/LoginPage';
import RegisterPage from './AuthLogins/RegisterPage';
import ParserPage from './ParserPage';
import AIScoringPage from './AIScoringPage';
import { AuthContext, AuthProvider } from './AuthLogins/AuthContext';
import VerifyOTPPage from './AuthLogins/VerifyOtpPage';
import ProfilePage from './AuthLogins/ProfilePage';
import Home from './Home';
import ResumeHistory from './ResumeHistory';
import AiScoreHistory from './AiScoreHistory';
import ForgotPasswordPage from './AuthLogins/ForgotPassword';
import AdminLoginPage from './AuthLogins/AdminLoginPage';
import AdminDashboardPage from './AdminPages/AdminDashboardPage';
import CoverLetterGenerator from './CoverLetterGenerator';
import AuditLogsPage from './AdminPages/AuditLogsPage';
import ViewUsersPage from './AdminPages/ViewUsersPage';
import LoginSuccess from './AuthLogins/LoginSuccess';
import CompleteProfile from './AuthLogins/CompleteProfile';


function ProtectedRoute({ children, allowedRoles }) {
  const { token, role, approved } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect admins to admin dashboard if trying to access user routes or vice versa
    if (role === 'admin') {
      return <Navigate to="/adminDashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (role === 'user' && !approved) {
    return <Navigate to="/not-approved" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/adminLogin" element={<AdminLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />

          {/* Public home (change to protected if needed) */}
          <Route path="/" element={<Home />} />

          {/* Protected routes for user & admin */}
          <Route
            path="/parser"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <ParserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-scoring"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <AIScoringPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-history"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <ResumeHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-score-history"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <AiScoreHistory />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/adminDashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          
          {/* Not approved page */}
          <Route path="/cover-letter" element={<CoverLetterGenerator />} />
          <Route path="/not-approved" element={<NotApprovedPage />} />

          <Route path="/auditlogs" element={<AuditLogsPage />} />
          
          <Route path="/view-users" element={<ViewUsersPage />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />



          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-left">
              <p>&copy; {new Date().getFullYear()} AI Resume Parser. All rights reserved.</p>
            </div>
            <div className="footer-right">
              <p>Built with ❤️ by <strong>Nukala Sai Satya Pradeep</strong></p>
              <p>IVth Year B.Tech, KL University</p>
            </div>
          </div>
        </footer>
      </Router>
    </AuthProvider>
  );
}

function NotApprovedPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>
      <h2>Your account is not approved yet. Please wait for admin approval.</h2>
    </div>
  );
}

export default App;
