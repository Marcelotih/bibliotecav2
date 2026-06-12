import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const adminLinks = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/computadores', label: '🖥️ Computadores' },
  { to: '/admin/salas', label: '🚪 Salas' },
  { to: '/admin/reservas', label: '📅 Reservas' },
  { to: '/admin/usuarios', label: '👥 Usuários' },
  { to: '/admin/relatorios', label: '📈 Relatórios' },
];

const userLinks = [
  { to: '/app', label: '🏠 Início', end: true },
  { to: '/app/reservar', label: '➕ Nova Reserva' },
  { to: '/app/minhas-reservas', label: '📋 Minhas Reservas' },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = isAdmin ? adminLinks : userLinks;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navStyle = {
    display: 'block', padding: '10px 16px', borderRadius: 6, textDecoration: 'none',
    fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 2,
  };
  const activeStyle = { ...navStyle, background: '#dbeafe', color: '#1d4ed8', fontWeight: 700 };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#fff', borderRight: '1px solid #e5e7eb',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#1d4ed8' }}>📚 Biblioteca</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{isAdmin ? 'Painel Admin' : 'Portal do Usuário'}</div>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              style={({ isActive }) => isActive ? activeStyle : navStyle}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.nome}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, textTransform: 'capitalize' }}>{user?.tipo}</div>
          {isAdmin && (
            <NavLink to="/app" style={{ ...navStyle, fontSize: 12, padding: '6px 10px', background: '#f0fdf4', color: '#16a34a', marginBottom: 4 }}>
              👤 Modo Usuário
            </NavLink>
          )}
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px', background: 'none', border: '1px solid #e5e7eb',
            borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#6b7280',
          }}>
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
