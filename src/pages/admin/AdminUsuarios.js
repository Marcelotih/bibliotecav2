import React, { useEffect, useState } from 'react';
import { usuarioService } from '../../services/api';
import { Card, Input, Alert, Table, PageHeader, Spinner, Button, Modal, Badge } from '../../components/common/UI';
import { formatDate } from '../../utils/helpers';

export default function AdminUsuarios() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [buscaCpf, setBuscaCpf] = useState('');
  const [resultadoCpf, setResultadoCpf] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function load() {
      const data = await usuarioService.listar();
      setLista(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleBuscaCpf(e) {
    e.preventDefault();
    setErro('');
    const r = await usuarioService.buscarPorCpf(buscaCpf);
    if (!r) setErro('Nenhum usuário encontrado com este CPF');
    setResultadoCpf(r);
  }

  async function handleToggle(id, ativo) {
    await usuarioService.atualizar(id, { ativo: !ativo });
    const data = await usuarioService.listar();
    setLista(data);
  }

  const filtrado = lista.filter(u =>
    !busca ||
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase()) ||
    u.cpf?.includes(busca)
  );

  return (
    <div>
      <PageHeader title="Usuários" subtitle="Listagem A-Z com dados completos" />

      {/* Busca por CPF */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#374151' }}>🔍 Busca por CPF</div>
        <form onSubmit={handleBuscaCpf} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input placeholder="000.000.000-00" value={buscaCpf} onChange={e => setBuscaCpf(e.target.value)} />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
        {erro && <div style={{ marginTop: 10 }}><Alert type="error">{erro}</Alert></div>}
        {resultadoCpf && (
          <div style={{ marginTop: 12, padding: 14, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{resultadoCpf.nome}</div>
            <div style={{ fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <span>📧 {resultadoCpf.email}</span>
              <span>🪪 {resultadoCpf.cpf}</span>
              <span>🎓 {resultadoCpf.tipo}</span>
              <span>📚 {resultadoCpf.modalidade || '—'}</span>
              <span>✅ {resultadoCpf.ativo ? 'Ativo' : 'Inativo'}</span>
              <span>📅 Desde {formatDate(resultadoCpf.criadoEm?.split('T')[0])}</span>
            </div>
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Input placeholder="Filtrar por nome, email ou CPF..." value={busca} onChange={e => setBusca(e.target.value)} />
      </Card>

      <Card>
        {loading ? <Spinner /> : (
          <Table
            columns={[
              { key: 'nome', label: 'Nome (A-Z)' },
              { key: 'cpf', label: 'CPF' },
              { key: 'email', label: 'E-mail' },
              { key: 'tipo', label: 'Tipo', render: r => <span style={{ textTransform: 'capitalize' }}>{r.tipo}</span> },
              { key: 'modalidade', label: 'Modalidade', render: r => r.modalidade || '—' },
              { key: 'ativo', label: 'Status', render: r => (
                <span style={{ color: r.ativo ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
                  {r.ativo ? '✅ Ativo' : '❌ Inativo'}
                </span>
              )},
              { key: 'acoes', label: '', render: r => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button size="sm" variant="outline" onClick={() => setDetalhe(r)}>Ver</Button>
                  <Button size="sm" variant={r.ativo ? 'danger' : 'success'} onClick={() => handleToggle(r.id, r.ativo)}>
                    {r.ativo ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              )},
            ]}
            data={filtrado}
          />
        )}
      </Card>

      {detalhe && (
        <Modal open onClose={() => setDetalhe(null)} title="Detalhes do Usuário">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            {[
              ['Nome completo', detalhe.nome],
              ['E-mail', detalhe.email],
              ['CPF', detalhe.cpf],
              ['Tipo', detalhe.tipo],
              ['Modalidade', detalhe.modalidade || '—'],
              ['Status', detalhe.ativo ? 'Ativo' : 'Inativo'],
              ['Cadastrado em', formatDate(detalhe.criadoEm?.split('T')[0])],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontWeight: 600, color: '#6b7280' }}>{k}</span>
                <span style={{ textTransform: 'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
