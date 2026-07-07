import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Sessions from './pages/Sessions';
import Students from './pages/Students';
import Reports from './pages/Reports';

function AppLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-wrapper">
        <TopBar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
          <Route path="/courses"   element={<PrivateRoute><AppLayout><Courses /></AppLayout></PrivateRoute>} />
          <Route path="/sessions"  element={<PrivateRoute><AppLayout><Sessions /></AppLayout></PrivateRoute>} />
          <Route path="/students"  element={<PrivateRoute><AppLayout><Students /></AppLayout></PrivateRoute>} />
          <Route path="/reports"   element={<PrivateRoute><AppLayout><Reports /></AppLayout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
