import React, { useEffect, useState } from 'react';
import { reservaService } from '../../services/api';
import { Card, Badge, Button, Alert, Spinner, PageHeader, Select } from '../../components/common/UI';
import { useAuth } from '../../contexts/AuthContext';
import { today, formatDate } from '../../utils/helpers';

export default function UserMinhasReservas() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('ativas');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    setLoading(true);
    const data = await reservaService.listar({ usuarioId: user.id });
    setReservas(data);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function handleCancelar(id) {
    setErro('');
    if (!window.confirm('Cancelar esta reserva?')) return;
    try {
      await reservaService.cancelar(id, user.id);
      setSucesso('Reserva cancelada com sucesso');
      carregar();
    } catch (err) { setErro(err.message); }
  }

  async function handleCheckin(id) {
    setErro('');
    try {
      await reservaService.checkin(id, user.id);
      setSucesso('Check-in realizado! Bom estudo!');
      carregar();
    } catch (err) { setErro(err.message); }
  }

  async function handleCheckout(id) {
    setErro('');
    try {
      await reservaService.checkout(id);
      setSucesso('Check-out realizado. Obrigado!');
      carregar();
    } catch (err) { setErro(err.message); }
  }

  const filtradas = reservas.filter(r => {
    if (filtro === 'ativas') return ['pendente', 'confirmada', 'checkin'].includes(r.status);
    if (filtro === 'historico') return ['concluida', 'cancelada'].includes(r.status);
    return true;
  });

  return (
    <div>
      <PageHeader title="Minhas Reservas" />

      {erro && <div style={{ marginBottom: 14 }}><Alert type="error">{erro}</Alert></div>}
      {sucesso && <div style={{ marginBottom: 14 }}><Alert type="success">{sucesso}</Alert></div>}

      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {[
          { id: 'ativas', label: `Ativas (${reservas.filter(r => ['pendente','confirmada','checkin'].includes(r.status)).length})` },
          { id: 'historico', label: `Histórico (${reservas.filter(r => ['concluida','cancelada'].includes(r.status)).length})` },
          { id: 'todas', label: `Todas (${reservas.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setFiltro(t.id)} style={{
            padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: filtro === t.id ? '#2563eb' : '#fff',
            color: filtro === t.id ? '#fff' : '#374151',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtradas.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
          <div style={{ color: '#9ca3af' }}>Nenhuma reserva encontrada</div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtradas.map(r => (
            <Card key={r.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{r.tipo === 'computador' ? '🖥️' : '🚪'}</span>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{r.recursoNome}</span>
                    <Badge status={r.status} />
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>📅 {formatDate(r.data)}</span>
                    <span>⏰ {r.horaInicio} – {r.horaFim}</span>
                    <span>👥 {r.numPessoas} pessoa{r.numPessoas > 1 ? 's' : ''}</span>
                  </div>
                  {r.status === 'confirmada' && (
                    <div style={{ fontSize: 12, color: '#d97706', marginTop: 6 }}>
                      ⚠️ Check-in disponível 30 min antes do início
                    </div>
                  )}
                  {r.status === 'pendente' && (
                    <div style={{ fontSize: 12, color: '#d97706', marginTop: 6 }}>
                      Aguardando aprovação do admin para uso acima de 1 hora
                    </div>
                  )}
                  {r.status === 'cancelada' && r.canceladoEm && (
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                      Cancelada em {new Date(r.canceladoEm).toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {r.status === 'confirmada' && (
                    <Button size="sm" variant="success" onClick={() => handleCheckin(r.id)}>
                      Check-in
                    </Button>
                  )}
                  {r.status === 'checkin' && (
                    <Button size="sm" variant="outline" onClick={() => handleCheckout(r.id)}>
                      Check-out
                    </Button>
                  )}
                  {['pendente', 'confirmada'].includes(r.status) && (
                    <Button size="sm" variant="danger" onClick={() => handleCancelar(r.id)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
