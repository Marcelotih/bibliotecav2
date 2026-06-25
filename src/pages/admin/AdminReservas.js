import React, { useEffect, useState } from 'react';
import { reservaService, computadorService, salaService, usuarioService } from '../../services/api';
import { Card, Button, Input, Alert, Modal, Table, PageHeader, Spinner, Badge, Select } from '../../components/common/UI';
import { today, formatDate, gerarSlots, slotOcupado, pessoasNoSlot } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminReservas() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroData, setFiltroData] = useState(today());
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [modalNovaReserva, setModalNovaReserva] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    setLoading(true);
    const filtros = {};
    if (filtroData) filtros.data = filtroData;
    if (filtroTipo) filtros.tipo = filtroTipo;
    if (filtroStatus) filtros.status = filtroStatus;
    const data = await reservaService.listar(filtros);
    setReservas(data);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [filtroData, filtroTipo, filtroStatus]);

  async function handleCancelar(id) {
    if (!window.confirm('Cancelar esta reserva?')) return;
    try {
      await reservaService.cancelar(id, user.id, true);
      setSucesso('Reserva cancelada');
      carregar();
    } catch (err) { setErro(err.message); }
  }

  async function handleCheckin(id) {
    try {
      await reservaService.checkin(id, user.id, true);
      setSucesso('Check-in realizado');
      carregar();
    } catch (err) { setErro(err.message); }
  }

  async function handleCheckout(id) {
    try {
      await reservaService.checkout(id);
      setSucesso('Check-out realizado');
      carregar();
    } catch (err) { setErro(err.message); }
  }

  async function handleAprovar(id) {
    try {
      await reservaService.aprovar(id);
      setSucesso('Reserva aprovada');
      carregar();
    } catch (err) { setErro(err.message); }
  }

  return (
    <div>
      <PageHeader
        title="Reservas"
        subtitle="Gerenciar todas as reservas"
        action={<Button onClick={() => setModalNovaReserva(true)}>+ Nova Reserva</Button>}
      />

      {erro && <div style={{ marginBottom: 14 }}><Alert type="error">{erro}</Alert></div>}
      {sucesso && <div style={{ marginBottom: 14 }}><Alert type="success">{sucesso}</Alert></div>}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 160px' }}>
            <Input type="date" label="Data" value={filtroData} onChange={e => setFiltroData(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <Select label="Tipo" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="computador">Computador</option>
              <option value="sala">Sala</option>
            </Select>
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <Select label="Status" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="confirmada">Confirmada</option>
              <option value="checkin">Em uso</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </Select>
          </div>
          <div style={{ flex: '0 0 auto', alignSelf: 'flex-end' }}>
            <Button variant="ghost" onClick={() => { setFiltroData(''); setFiltroTipo(''); setFiltroStatus(''); }}>
              Limpar
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {loading ? <Spinner /> : (
          <Table
            columns={[
              { key: 'tipo', label: 'Tipo', render: r => r.tipo === 'computador' ? '🖥️ PC' : '🚪 Sala' },
              { key: 'recursoNome', label: 'Recurso' },
              { key: 'nomeUsuario', label: 'Usuário' },
              { key: 'data', label: 'Data', render: r => formatDate(r.data) },
              { key: 'horario', label: 'Horário', render: r => `${r.horaInicio}–${r.horaFim}` },
              { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
              { key: 'acoes', label: 'Ações', render: r => (
                <div style={{ display: 'flex', gap: 6 }}>
                  {r.status === 'pendente' && <Button size="sm" variant="success" onClick={() => handleAprovar(r.id)}>Aprovar</Button>}
                  {r.status === 'confirmada' && <Button size="sm" variant="success" onClick={() => handleCheckin(r.id)}>Check-in</Button>}
                  {r.status === 'checkin' && <Button size="sm" variant="outline" onClick={() => handleCheckout(r.id)}>Check-out</Button>}
                  {['pendente', 'confirmada'].includes(r.status) && (
                    <Button size="sm" variant="danger" onClick={() => handleCancelar(r.id)}>Cancelar</Button>
                  )}
                </div>
              )},
            ]}
            data={reservas}
          />
        )}
      </Card>

      {modalNovaReserva && (
        <ModalNovaReservaAdmin
          adminId={user.id}
          onClose={() => setModalNovaReserva(false)}
          onSuccess={() => { setSucesso('Reserva criada!'); setModalNovaReserva(false); carregar(); }}
        />
      )}
    </div>
  );
}

function ModalNovaReservaAdmin({ adminId, onClose, onSuccess }) {
  const [tipo, setTipo] = useState('computador');
  const [recursos, setRecursos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [recursoId, setRecursoId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [data, setData] = useState(today());
  const [slots, setSlots] = useState([]);
  const [ocupados, setOcupados] = useState([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [numPessoas, setNumPessoas] = useState(1);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [r, u] = await Promise.all([
        tipo === 'computador' ? computadorService.listar() : salaService.listar(),
        usuarioService.listar(),
      ]);
      setRecursos(r.filter(x => x.ativo));
      setUsuarios(u);
      setRecursoId('');
    }
    load();
  }, [tipo]);

  useEffect(() => {
    if (!recursoId || !data) return;
    async function load() {
      const ocup = await reservaService.horariosOcupados(tipo, recursoId, data);
      setOcupados(ocup);
      setSlots(gerarSlots('07:00', '22:00', 60));
    }
    load();
  }, [recursoId, data, tipo]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    const recurso = recursos.find(r => r.id === recursoId);
    const usuario = usuarios.find(u => u.id === usuarioId);
    try {
      await reservaService.criar({
        tipo, recursoId, recursoNome: recurso?.nome || recurso?.descricao,
        usuarioId, nomeUsuario: usuario?.nome,
        data, horaInicio, horaFim,
        numPessoas: Number(numPessoas),
        adminReserva: true,
      });
      onSuccess();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Nova Reserva (Admin)">
      {erro && <div style={{ marginBottom: 12 }}><Alert type="error">{erro}</Alert></div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Select label="Tipo" value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="computador">Computador</option>
          <option value="sala">Sala</option>
        </Select>
        <Select label="Recurso" value={recursoId} onChange={e => setRecursoId(e.target.value)} required>
          <option value="">Selecione...</option>
          {recursos.map(r => <option key={r.id} value={r.id}>{r.nome || r.descricao} — {r.patrimonio}</option>)}
        </Select>
        <Select label="Usuário" value={usuarioId} onChange={e => setUsuarioId(e.target.value)} required>
          <option value="">Selecione o usuário...</option>
          {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome} ({u.tipo})</option>)}
        </Select>
        <Input type="date" label="Data" value={data} onChange={e => setData(e.target.value)} min={today()} required />

        {recursoId && data && (
          <>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Horários disponíveis:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {slots.map(s => {
                  const capacidade = tipo === 'computador' ? 2 : 1;
                  const pessoas = pessoasNoSlot(s, ocupados);
                  const ocupado = slotOcupado(s, ocupados, capacidade) || pessoas + Number(numPessoas || 1) > capacidade;
                  const sel = horaInicio === s.inicio;
                  return (
                    <button type="button" key={s.inicio} disabled={ocupado}
                      onClick={() => { setHoraInicio(s.inicio); setHoraFim(s.fim); }}
                      style={{
                        padding: '6px 4px', borderRadius: 5, fontSize: 11, cursor: ocupado ? 'not-allowed' : 'pointer',
                        border: sel ? '2px solid #2563eb' : '1px solid #e5e7eb',
                        background: ocupado ? '#fef2f2' : sel ? '#dbeafe' : '#f9fafb',
                        color: ocupado ? '#ef4444' : sel ? '#1d4ed8' : '#374151',
                        fontWeight: sel ? 700 : 400,
                      }}>
                      {s.inicio}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Input label="Hora início" type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} required />
              </div>
              <div style={{ flex: 1 }}>
                <Input label="Hora fim" type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} required />
              </div>
            </div>
          </>
        )}

        <Input label={tipo === 'computador' ? 'Nº de pessoas (máx 2)' : 'Nº de pessoas (máx 5)'}
          type="number" min={1} max={tipo === 'computador' ? 2 : 5}
          value={numPessoas} onChange={e => setNumPessoas(e.target.value)} />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading || !horaInicio}>
            {loading ? 'Salvando...' : 'Criar Reserva'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
