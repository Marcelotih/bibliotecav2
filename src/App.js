import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/common/Layout';

// Auth
import { LoginPage, CadastroPage } from './pages/auth/AuthPages';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComputadores from './pages/admin/AdminComputadores';
import AdminSalas from './pages/admin/AdminSalas';
import AdminReservas from './pages/admin/AdminReservas';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminRelatorios from './pages/admin/AdminRelatorios';

// User
import UserDashboard from './pages/user/UserDashboard';
import UserReservar from './pages/user/UserReservar';
import UserMinhasReservas from './pages/user/UserMinhasReservas';

function RequireAuth({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/app" replace />;
  return children;
}

function AppRoutes() {
  const { user, isAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={isAdmin ? '/admin' : '/app'} /> : <LoginPage />} />
      <Route path="/cadastro" element={user ? <Navigate to="/app" /> : <CadastroPage />} />

      {/* Admin routes */}
      <Route path="/admin" element={<RequireAuth adminOnly><Layout><AdminDashboard /></Layout></RequireAuth>} />
      <Route path="/admin/computadores" element={<RequireAuth adminOnly><Layout><AdminComputadores /></Layout></RequireAuth>} />
      <Route path="/admin/salas" element={<RequireAuth adminOnly><Layout><AdminSalas /></Layout></RequireAuth>} />
      <Route path="/admin/reservas" element={<RequireAuth adminOnly><Layout><AdminReservas /></Layout></RequireAuth>} />
      <Route path="/admin/usuarios" element={<RequireAuth adminOnly><Layout><AdminUsuarios /></Layout></RequireAuth>} />
      <Route path="/admin/relatorios" element={<RequireAuth adminOnly><Layout><AdminRelatorios /></Layout></RequireAuth>} />

      {/* User routes */}
      <Route path="/app" element={<RequireAuth><Layout><UserDashboard /></Layout></RequireAuth>} />
      <Route path="/app/reservar" element={<RequireAuth><Layout><UserReservar /></Layout></RequireAuth>} />
      <Route path="/app/minhas-reservas" element={<RequireAuth><Layout><UserMinhasReservas /></Layout></RequireAuth>} />

      <Route path="*" element={<Navigate to={user ? (isAdmin ? '/admin' : '/app') : '/login'} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
