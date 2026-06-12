import React from 'react';
import { STATUS_COLOR, STATUS_LABEL } from '../../utils/helpers';

export function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, ...style }}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, disabled, variant = 'primary', size = 'md', style, type = 'button' }) {
  const base = {
    border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600, transition: 'opacity .15s',
    opacity: disabled ? 0.5 : 1,
    padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '8px 16px',
    fontSize: size === 'sm' ? 13 : 15,
  };
  const variants = {
    primary: { background: '#2563eb', color: '#fff' },
    danger: { background: '#ef4444', color: '#fff' },
    success: { background: '#10b981', color: '#fff' },
    outline: { background: '#fff', color: '#2563eb', border: '1px solid #2563eb' },
    ghost: { background: 'transparent', color: '#374151' },
    warning: { background: '#f59e0b', color: '#fff' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

export function Badge({ status }) {
  return (
    <span style={{
      background: STATUS_COLOR[status] + '20', color: STATUS_COLOR[status],
      border: `1px solid ${STATUS_COLOR[status]}40`,
      borderRadius: 99, padding: '2px 10px', fontSize: 12, fontWeight: 600,
    }}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export function Input({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>}
      <input style={{
        border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px',
        fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box',
      }} {...props} />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>}
      <select style={{
        border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px',
        fontSize: 14, outline: 'none', width: '100%', background: '#fff',
      }} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Alert({ type = 'error', children }) {
  const colors = {
    error: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
  };
  const c = colors[type];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 6, padding: '10px 14px', fontSize: 14 }}>
      {children}
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 32, height: 32, border: '3px solid #e5e7eb',
        borderTop: '3px solid #2563eb', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#00000066', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 10, padding: 24, maxWidth: 540, width: '100%',
        maxHeight: '90vh', overflow: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Table({ columns, data, emptyMsg = 'Nenhum registro encontrado' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>{emptyMsg}</td></tr>
          ) : data.map((row, i) => (
            <tr key={row.id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: '10px 12px', color: '#111827' }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>{title}</h1>
        {subtitle && <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
