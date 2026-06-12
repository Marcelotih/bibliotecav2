import React, { useEffect, useState } from 'react';
import { salaService } from '../../services/api';
import { Card, Button, Input, Alert, Modal, Table, PageHeader, Spinner, Select } from '../../components/common/UI';
import { CalendarioDisponibilidade } from './AdminComputadores';

export default function AdminSalas() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalForm, setModalForm] = useState(false);
  const [modalCalendario, setModalCalendario] = useState(null);
  const [form, setForm] = useState({ patrimonio: '', nome: '', capacidade: 5 });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    setLoading(true);
    const data = await salaService.listar();
    setLista(data);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function handleCriar(e) {
    e.preventDefault();
    setErro('');
    try {
      await salaService.criar({ ...form, capacidade: Number(form.capacidade) });
      setSucesso('Sala criada!');
      setModalForm(false);
      setForm({ patrimonio: '', nome: '', capacidade: 5 });
      carregar();
    } catch (err) { setErro(err.message); }
  }

  async function handleToggle(id) {
    await salaService.toggleAtivo(id);
    carregar();
  }

  const filtrado = lista.filter(c =>
    !busca || c.patrimonio.toLowerCase().includes(busca.toLowerCase()) ||
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Salas"
        subtitle="Gerenciar salas e disponibilidade"
        action={<Button onClick={() => setModalForm(true)}>+ Nova Sala</Button>}
      />

      {sucesso && <div style={{ marginBottom: 14 }}><Alert type="success">{sucesso}</Alert></div>}

      <Card style={{ marginBottom: 16 }}>
        <Input placeholder="Buscar por patrimônio ou nome..." value={busca} onChange={e => setBusca(e.target.value)} />
      </Card>

      <Card>
        {loading ? <Spinner /> : (
          <Table
            columns={[
              { key: 'patrimonio', label: 'Patrimônio' },
              { key: 'nome', label: 'Nome' },
              { key: 'capacidade', label: 'Capacidade', render: r => `${r.capacidade} pessoas` },
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

      <Modal open={modalForm} onClose={() => setModalForm(false)} title="Nova Sala">
        {erro && <div style={{ marginBottom: 12 }}><Alert type="error">{erro}</Alert></div>}
        <form onSubmit={handleCriar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Código de Patrimônio" value={form.patrimonio} onChange={e => setForm(f => ({ ...f, patrimonio: e.target.value }))} required />
          <Input label="Nome da Sala" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
          <Input label="Capacidade máxima" type="number" min={1} max={5} value={form.capacidade} onChange={e => setForm(f => ({ ...f, capacidade: e.target.value }))} required />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setModalForm(false)}>Cancelar</Button>
            <Button type="submit">Criar</Button>
          </div>
        </form>
      </Modal>

      {modalCalendario && (
        <CalendarioDisponibilidade
          recurso={modalCalendario}
          tipo="sala"
          onClose={() => setModalCalendario(null)}
        />
      )}
    </div>
  );
}
