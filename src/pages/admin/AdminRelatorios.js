import React, { useEffect, useState } from 'react';
import { relatorioService } from '../../services/api';
import { Card, Input, Button, Spinner, PageHeader, Table } from '../../components/common/UI';
import { today, formatDate } from '../../utils/helpers';

function StatCard({ label, value, color = '#2563eb' }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '16px 20px', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function AdminRelatorios() {
  const [tab, setTab] = useState('ocupacao');
  const [ocupacao, setOcupacao] = useState(null);
  const [cadastros, setCadastros] = useState(null);
  const [porUsuario, setPorUsuario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState({ inicio: '', fim: today() });

  async function carregarOcupacao() {
    setLoading(true);
    const d = await relatorioService.ocupacao(periodo);
    setOcupacao(d);
    setLoading(false);
  }

  async function carregarCadastros() {
    setLoading(true);
    const d = await relatorioService.cadastros();
    setCadastros(d);
    setLoading(false);
  }

  async function carregarPorUsuario() {
    setLoading(true);
    const d = await relatorioService.reservasPorUsuario();
    setPorUsuario(d);
    setLoading(false);
  }

  useEffect(() => {
    if (tab === 'ocupacao') carregarOcupacao();
    else if (tab === 'cadastros') carregarCadastros();
    else if (tab === 'por-usuario') carregarPorUsuario();
  }, [tab]);

  const tabs = [
    { id: 'ocupacao', label: '📊 Ocupação' },
    { id: 'cadastros', label: '👥 Cadastros feitos' },
    { id: 'por-usuario', label: '📋 Reservas feitas' },
  ];

  return (
    <div>
      <PageHeader title="Relatórios" subtitle="Análise do uso da biblioteca" />

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #e5e7eb', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            color: tab === t.id ? '#2563eb' : '#6b7280',
            borderBottom: tab === t.id ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: -2,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OCUPAÇÃO */}
      {tab === 'ocupacao' && (
        <div>
          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 160px' }}>
                <Input type="date" label="De" value={periodo.inicio} onChange={e => setPeriodo(p => ({ ...p, inicio: e.target.value }))} />
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <Input type="date" label="Até" value={periodo.fim} onChange={e => setPeriodo(p => ({ ...p, fim: e.target.value }))} />
              </div>
              <Button onClick={carregarOcupacao}>Filtrar</Button>
            </div>
          </Card>

          {loading ? <Spinner /> : ocupacao && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
                <StatCard label="Total de Reservas" value={ocupacao.total} />
                <StatCard label="Confirmadas" value={ocupacao.porStatus?.confirmada || 0} color="#3b82f6" />
                <StatCard label="Em uso" value={ocupacao.porStatus?.checkin || 0} color="#10b981" />
                <StatCard label="Concluídas" value={ocupacao.porStatus?.concluida || 0} color="#6b7280" />
                <StatCard label="Canceladas" value={ocupacao.porStatus?.cancelada || 0} color="#ef4444" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card>
                  <h3 style={{ margin: '0 0 14px', fontSize: 15 }}>Por Tipo de Recurso</h3>
                  {Object.entries(ocupacao.porTipo || {}).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ textTransform: 'capitalize' }}>{k === 'computador' ? '🖥️ Computador' : '🚪 Sala'}</span>
                      <span style={{ fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </Card>

                <Card>
                  <h3 style={{ margin: '0 0 14px', fontSize: 15 }}>Reservas por Dia</h3>
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {Object.entries(ocupacao.porDia || {}).sort((a, b) => b[0].localeCompare(a[0])).map(([dia, qtd]) => (
                      <div key={dia} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                        <span>{formatDate(dia)}</span>
                        <span style={{ fontWeight: 700 }}>{qtd} reserva{qtd > 1 ? 's' : ''}</span>
                      </div>
                    ))}
                    {Object.keys(ocupacao.porDia || {}).length === 0 && (
                      <p style={{ color: '#9ca3af', fontSize: 13 }}>Sem dados no período</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CADASTROS */}
      {tab === 'cadastros' && (
        <div>
          {loading ? <Spinner /> : cadastros && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
                <StatCard label="Total de Usuários" value={cadastros.total} />
                {Object.entries(cadastros.porTipo).map(([k, v]) => (
                  <StatCard key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={v} color="#7c3aed" />
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <Card>
                  <h3 style={{ margin: '0 0 14px', fontSize: 15 }}>Por Modalidade</h3>
                  {Object.entries(cadastros.porModalidade).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span>{k}</span>
                      <span style={{ fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </Card>
              </div>

              <Card>
                <h3 style={{ margin: '0 0 14px', fontSize: 15 }}>Usuários Cadastrados (A-Z)</h3>
                <Table
                  columns={[
                    { key: 'nome', label: 'Nome' },
                    { key: 'cpf', label: 'CPF' },
                    { key: 'email', label: 'E-mail' },
                    { key: 'tipo', label: 'Tipo', render: r => <span style={{ textTransform: 'capitalize' }}>{r.tipo}</span> },
                    { key: 'modalidade', label: 'Modalidade', render: r => r.modalidade || '—' },
                    { key: 'criadoEm', label: 'Cadastrado em', render: r => formatDate(r.criadoEm?.split('T')[0]) },
                  ]}
                  data={cadastros.lista}
                />
              </Card>
            </div>
          )}
        </div>
      )}

      {/* POR USUÁRIO */}
      {tab === 'por-usuario' && (
        <Card>
          {loading ? <Spinner /> : (
            <Table
              columns={[
                { key: 'nome', label: 'Usuário' },
                { key: 'qtd', label: 'Total de Reservas', render: r => <b>{r.qtd}</b> },
              ]}
              data={porUsuario}
              emptyMsg="Nenhuma reserva feita ainda"
            />
          )}
        </Card>
      )}
    </div>
  );
}
