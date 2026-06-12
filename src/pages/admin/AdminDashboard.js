import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { computadorService, salaService, reservaService, usuarioService } from '../../services/api';
import { Card, Spinner, Alert, Badge } from '../../components/common/UI';
import { today, formatDate } from '../../utils/helpers';

export default function AdminDashboard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [computadores, salas, reservas, usuarios] = await Promise.all([
        computadorService.listar(),
        salaService.listar(),
        reservaService.listar({ data: today() }),
        usuarioService.listar(),
      ]);
      setDados({ computadores, salas, reservas, usuarios });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <Spinner />;

  const { computadores, salas, reservas, usuarios } = dados;
  const ativas = reservas.filter(r => ['confirmada', 'checkin'].includes(r.status));
  const computadoresOcupados = new Set(ativas.filter(r => r.tipo === 'computador').map(r => r.recursoId));
  const salasOcupadas = new Set(ativas.filter(r => r.tipo === 'sala').map(r => r.recursoId));

  const stats = [
    { label: 'Computadores livres', value: `${computadores.filter(c => c.ativo && !computadoresOcupados.has(c.id)).length} / ${computadores.filter(c => c.ativo).length}`, icon: '🖥️', color: '#2563eb', link: '/admin/computadores' },
    { label: 'Salas livres', value: `${salas.filter(s => s.ativo && !salasOcupadas.has(s.id)).length} / ${salas.filter(s => s.ativo).length}`, icon: '🚪', color: '#16a34a', link: '/admin/salas' },
    { label: 'Reservas hoje', value: reservas.length, icon: '📅', color: '#d97706', link: '/admin/reservas' },
    { label: 'Usuários cadastrados', value: usuarios.length, icon: '👥', color: '#7c3aed', link: '/admin/usuarios' },
  ];

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700 }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <Link key={s.label} to={s.link} style={{ textDecoration: 'none' }}>
            <Card style={{ borderLeft: `4px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                </div>
                <div style={{ fontSize: 28 }}>{s.icon}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Reservas Ativas Hoje</h3>
          {ativas.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Nenhuma reserva ativa no momento</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ativas.slice(0, 6).map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f9fafb', borderRadius: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.tipo === 'computador' ? '🖥️' : '🚪'} {r.recursoNome}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{r.horaInicio} – {r.horaFim} · {r.nomeUsuario}</div>
                  </div>
                  <Badge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Status dos Recursos</h3>
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Computadores</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {computadores.filter(c => c.ativo).map(c => (
                  <div key={c.id} style={{
                    padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: computadoresOcupados.has(c.id) ? '#fef2f2' : '#f0fdf4',
                    color: computadoresOcupados.has(c.id) ? '#ef4444' : '#16a34a',
                    border: `1px solid ${computadoresOcupados.has(c.id) ? '#fecaca' : '#bbf7d0'}`,
                  }}>
                    {c.patrimonio}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Salas</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {salas.filter(s => s.ativo).map(s => (
                  <div key={s.id} style={{
                    padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: salasOcupadas.has(s.id) ? '#fef2f2' : '#f0fdf4',
                    color: salasOcupadas.has(s.id) ? '#ef4444' : '#16a34a',
                    border: `1px solid ${salasOcupadas.has(s.id) ? '#fecaca' : '#bbf7d0'}`,
                  }}>
                    {s.nome}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
