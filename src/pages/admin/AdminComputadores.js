import React, { useEffect, useState } from 'react';
import { computadorService, reservaService } from '../../services/api';
import { Card, Button, Badge, Input, Alert, Modal, Table, PageHeader, Spinner } from '../../components/common/UI';
import { today, formatDate, gerarSlots, slotOcupado, pessoasNoSlot } from '../../utils/helpers';

export default function AdminComputadores() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalForm, setModalForm] = useState(false);
  const [modalCalendario, setModalCalendario] = useState(null);
  const [form, setForm] = useState({ patrimonio: '', descricao: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [populando, setPopulando] = useState(false);

  const COMPUTADORES_SEED = [
    { patrimonio: 'PC-001', descricao: 'Computador Dell OptiPlex - Mesa 01' },
    { patrimonio: 'PC-002', descricao: 'Computador Dell OptiPlex - Mesa 02' },
    { patrimonio: 'PC-003', descricao: 'Computador Dell OptiPlex - Mesa 03' },
    { patrimonio: 'PC-004', descricao: 'Computador Dell OptiPlex - Mesa 04' },
    { patrimonio: 'PC-005', descricao: 'Computador Dell OptiPlex - Mesa 05' },
    { patrimonio: 'PC-006', descricao: 'Computador HP ProDesk - Mesa 06' },
    { patrimonio: 'PC-007', descricao: 'Computador HP ProDesk - Mesa 07' },
    { patrimonio: 'PC-008', descricao: 'Computador HP ProDesk - Mesa 08' },
    { patrimonio: 'PC-009', descricao: 'Computador Lenovo ThinkCentre - Mesa 09' },
    { patrimonio: 'PC-010', descricao: 'Computador Lenovo ThinkCentre - Mesa 10' },
  ];

  async function handlePopular() {
    setPopulando(true);
    setErro('');
    let criados = 0;
    for (const pc of COMPUTADORES_SEED) {
      try { await computadorService.criar(pc); criados++; } catch (_) {}
    }
    setSucesso(`${criados} computador(es) criado(s)!`);
    setPopulando(false);
    carregar();
  }

  async function carregar() {
    setLoading(true);
    const data = await computadorService.listar();
    setLista(data);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function handleCriar(e) {
    e.preventDefault();
    setErro('');
    try {
      await computadorService.criar(form);
      setSucesso('Computador criado!');
      setModalForm(false);
      setForm({ patrimonio: '', descricao: '' });
      carregar();
    } catch (err) { setErro(err.message); }
  }

  async function handleToggle(id) {
    await computadorService.toggleAtivo(id);
    carregar();
  }

  const filtrado = lista.filter(c =>
    !busca || c.patrimonio.toLowerCase().includes(busca.toLowerCase()) ||
    c.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Computadores"
        subtitle="Gerenciar equipamentos e disponibilidade"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" onClick={handlePopular} disabled={populando}>
              {populando ? '⏳ Criando...' : '🚀 Popular Dados'}
            </Button>
            <Button onClick={() => setModalForm(true)}>+ Novo Computador</Button>
          </div>
        }
      />

      {sucesso && <div style={{ marginBottom: 14 }}><Alert type="success">{sucesso}</Alert></div>}

      <Card style={{ marginBottom: 16 }}>
        <Input placeholder="Buscar por patrimônio ou descrição..." value={busca} onChange={e => setBusca(e.target.value)} />
      </Card>

      <Card>
        {loading ? <Spinner /> : (
          <Table
            columns={[
              { key: 'patrimonio', label: 'Patrimônio' },
              { key: 'descricao', label: 'Descrição' },
              { key: 'ativo', label: 'Status', render: r => (
                <span style={{ color: r.ativo ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
                  {r.ativo ? '✅ Ativo' : '❌ Desativado'}
                </span>
              )},
              { key: 'acoes', label: 'Ações', render: r => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="sm" variant="outline" onClick={() => setModalCalendario(r)}>
                    📅 Disponibilidade
                  </Button>
                  <Button size="sm" variant={r.ativo ? 'danger' : 'success'} onClick={() => handleToggle(r.id)}>
                    {r.ativo ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              )},
            ]}
            data={filtrado}
          />
        )}
      </Card>

      <Modal open={modalForm} onClose={() => setModalForm(false)} title="Novo Computador">
        {erro && <div style={{ marginBottom: 12 }}><Alert type="error">{erro}</Alert></div>}
        <form onSubmit={handleCriar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Código de Patrimônio" value={form.patrimonio} onChange={e => setForm(f => ({ ...f, patrimonio: e.target.value }))} required />
          <Input label="Descrição" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} required />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setModalForm(false)}>Cancelar</Button>
            <Button type="submit">Criar</Button>
          </div>
        </form>
      </Modal>

      {modalCalendario && (
        <CalendarioDisponibilidade
          recurso={modalCalendario}
          tipo="computador"
          onClose={() => setModalCalendario(null)}
        />
      )}
    </div>
  );
}

export function CalendarioDisponibilidade({ recurso, tipo, onClose }) {
  const [data, setData] = useState(today());
  const [slots, setSlots] = useState([]);
  const [ocupados, setOcupados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const ocup = await reservaService.horariosOcupados(tipo, recurso.id, data);
      setOcupados(ocup);
      setSlots(gerarSlots('07:00', '22:00', 60));
      setLoading(false);
    }
    load();
  }, [data, recurso.id, tipo]);

  return (
    <Modal open onClose={onClose} title={`Disponibilidade — ${recurso.nome || recurso.descricao}`}>
      <div style={{ marginBottom: 16 }}>
        <Input type="date" label="Data" value={data} onChange={e => setData(e.target.value)} />
      </div>
      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {slots.map(s => {
            const capacidade = tipo === 'computador' ? 2 : 1;
            const ocupado = slotOcupado(s, ocupados, capacidade);
            const pessoas = pessoasNoSlot(s, ocupados);
            return (
              <div key={s.inicio} style={{
                padding: '8px 6px', borderRadius: 6, textAlign: 'center', fontSize: 12, fontWeight: 600,
                background: ocupado ? '#fef2f2' : '#f0fdf4',
                color: ocupado ? '#ef4444' : '#16a34a',
                border: `1px solid ${ocupado ? '#fecaca' : '#bbf7d0'}`,
              }}>
                {s.inicio}–{s.fim}
                <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2 }}>
                  {ocupado ? '🔴 Ocupado' : tipo === 'computador' && pessoas > 0 ? `🟡 ${2 - pessoas} vaga livre` : '🟢 Livre'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}