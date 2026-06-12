import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservaService } from '../../services/api';
import { Card, Badge, Spinner, Button } from '../../components/common/UI';
import { useAuth } from '../../contexts/AuthContext';
import { today, formatDate } from '../../utils/helpers';

export default function UserDashboard() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    const data = await reservaService.listar({ usuarioId: user.id });
    setReservas(data);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function handleCheckin(id) {
    setErro('');
    try {
      await reservaService.checkin(id, user.id);
      setSucesso('Check-in realizado! Bom uso!');
      carregar();
    } catch (err) { setErro(err.message); }
  }

  async function handleCancelar(id) {
    setErro('');
    if (!window.confirm('Deseja cancelar esta reserva?')) return;
    try {
      await reservaService.cancelar(id, user.id);
      setSucesso('Reserva cancelada');
      carregar();
    } catch (err) { setErro(err.message); }
  }

  const proximas = reservas.filter(r =>
    ['pendente', 'confirmada', 'checkin'].includes(r.status) && r.data >= today()
  ).slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Olá, {user.nome.split(' ')[0]}! 👋</h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14, textTransform: 'capitalize' }}>
          {user.tipo} · {user.modalidade || 'sem modalidade definida'}
        </p>
      </div>

      {erro && <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, fontSize: 14 }}>{erro}</div>}
      {sucesso && <div style={{ marginBottom: 14, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: 6, fontSize: 14 }}>{sucesso}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <Link to="/app/reservar" style={{ textDecoration: 'none' }}>
          <Card style={{ textAlign: 'center', cursor: 'pointer', borderColor: '#bfdbfe', background: '#eff6ff' }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>➕</div>
            <div style={{ fontWeight: 700, color: '#2563eb' }}>Nova Reserva</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Computador ou Sala</div>
          </Card>
        </Link>
        <Link to="/app/minhas-reservas" style={{ textDecoration: 'none' }}>
          <Card style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>📋</div>
            <div style={{ fontWeight: 700, color: '#374151' }}>Minhas Reservas</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{reservas.length} total</div>
          </Card>
        </Link>
      </div>

      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Próximas Reservas</h3>
        {loading ? <Spinner /> : proximas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
            <div>Nenhuma reserva próxima</div>
            <Link to="/app/reservar" style={{ display: 'inline-block', marginTop: 12, color: '#2563eb', fontWeight: 600, fontSize: 14 }}>
              Fazer uma reserva agora →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {proximas.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {r.tipo === 'computador' ? '🖥️' : '🚪'} {r.recursoNome}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {formatDate(r.data)} · {r.horaInicio}–{r.horaFim}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Badge status={r.status} />
                  {r.status === 'confirmada' && (
                    <Button size="sm" variant="success" onClick={() => handleCheckin(r.id)}>Check-in</Button>
                  )}
                  {['pendente', 'confirmada'].includes(r.status) && (
                    <Button size="sm" variant="danger" onClick={() => handleCancelar(r.id)}>Cancelar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
