import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { computadorService, salaService, reservaService } from '../../services/api';
import { Card, Button, Input, Alert, Select, Spinner } from '../../components/common/UI';
import { useAuth } from '../../contexts/AuthContext';
import { today, gerarSlots, slotOcupado } from '../../utils/helpers';

export default function UserReservar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [passo, setPasso] = useState(1); // 1: tipo/recurso, 2: data/hora, 3: confirmar
  const [tipo, setTipo] = useState('computador');
  const [recursos, setRecursos] = useState([]);
  const [recursoId, setRecursoId] = useState('');
  const [data, setData] = useState(today());
  const [slots, setSlots] = useState([]);
  const [ocupados, setOcupados] = useState([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [numPessoas, setNumPessoas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function load() {
      const r = tipo === 'computador' ? await computadorService.listar() : await salaService.listar();
      setRecursos(r.filter(x => x.ativo));
      setRecursoId('');
    }
    load();
  }, [tipo]);

  useEffect(() => {
    if (!recursoId || !data) return;
    async function load() {
      setLoadingSlots(true);
      const ocup = await reservaService.horariosOcupados(tipo, recursoId, data);
      setOcupados(ocup);
      setSlots(gerarSlots('07:00', '22:00', 60));
      setHoraInicio('');
      setHoraFim('');
      setLoadingSlots(false);
    }
    load();
  }, [recursoId, data, tipo]);

  const recurso = recursos.find(r => r.id === recursoId);

  function selecionarSlot(s) {
    if (slotOcupado(s, ocupados)) return;
    setHoraInicio(s.inicio);
    setHoraFim(s.fim);
  }

  async function handleConfirmar() {
    setErro('');
    setLoading(true);
    try {
      await reservaService.criar({
        tipo,
        recursoId,
        recursoNome: recurso?.nome || recurso?.descricao,
        usuarioId: user.id,
        nomeUsuario: user.nome,
        data,
        horaInicio,
        horaFim,
        numPessoas: Number(numPessoas),
      });
      navigate('/app/minhas-reservas');
    } catch (err) {
      setErro(err.message);
      setLoading(false);
    }
  }

  const maxPessoas = tipo === 'computador' ? 2 : 5;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700 }}>Nova Reserva</h1>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
        {['Recurso', 'Horário', 'Confirmar'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
              background: passo > i + 1 ? '#10b981' : passo === i + 1 ? '#2563eb' : '#e5e7eb',
              color: passo >= i + 1 ? '#fff' : '#9ca3af',
            }}>
              {passo > i + 1 ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: 13, marginLeft: 6, fontWeight: passo === i + 1 ? 700 : 400, color: passo === i + 1 ? '#111827' : '#9ca3af' }}>
              {s}
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: '#e5e7eb', margin: '0 8px' }} />}
          </div>
        ))}
      </div>

      {erro && <div style={{ marginBottom: 16 }}><Alert type="error">{erro}</Alert></div>}

      {/* Passo 1 */}
      {passo === 1 && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select label="Tipo de recurso" value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="computador">🖥️ Computador</option>
              <option value="sala">🚪 Sala</option>
            </Select>

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                {tipo === 'computador' ? 'Escolha um computador:' : 'Escolha uma sala:'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {recursos.map(r => (
                  <button key={r.id} type="button" onClick={() => setRecursoId(r.id)} style={{
                    padding: 12, borderRadius: 8, border: recursoId === r.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                    background: recursoId === r.id ? '#eff6ff' : '#fff',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: recursoId === r.id ? '#1d4ed8' : '#111827' }}>
                      {r.nome || r.descricao}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{r.patrimonio}</div>
                    {tipo === 'sala' && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>👥 máx. {r.capacidade}</div>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button disabled={!recursoId} onClick={() => setPasso(2)}>Próximo →</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Passo 2 */}
      {passo === 2 && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input type="date" label="Data" value={data} onChange={e => setData(e.target.value)} min={today()} />

            {loadingSlots ? <Spinner /> : slots.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Selecione um horário (clique para selecionar):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {slots.map(s => {
                    const ocupado = slotOcupado(s, ocupados);
                    const sel = horaInicio === s.inicio;
                    return (
                      <button key={s.inicio} type="button" onClick={() => selecionarSlot(s)}
                        disabled={ocupado}
                        style={{
                          padding: '10px 4px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          cursor: ocupado ? 'not-allowed' : 'pointer',
                          border: sel ? '2px solid #2563eb' : '1px solid #e5e7eb',
                          background: ocupado ? '#fef2f2' : sel ? '#dbeafe' : '#f9fafb',
                          color: ocupado ? '#fca5a5' : sel ? '#1d4ed8' : '#374151',
                        }}>
                        {s.inicio}
                        <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2 }}>
                          {ocupado ? '🔴' : sel ? '✓' : '🟢'}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {horaInicio && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: '#eff6ff', borderRadius: 6, fontSize: 13, color: '#1d4ed8' }}>
                    ✓ Selecionado: <b>{horaInicio} – {horaFim}</b>
                  </div>
                )}
              </div>
            )}

            <Input
              label={`Número de pessoas (máx. ${maxPessoas})`}
              type="number" min={1} max={maxPessoas}
              value={numPessoas} onChange={e => setNumPessoas(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="ghost" onClick={() => setPasso(1)}>← Voltar</Button>
              <Button disabled={!horaInicio} onClick={() => setPasso(3)}>Próximo →</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Passo 3 */}
      {passo === 3 && (
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Confirmar Reserva</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
            {[
              ['Tipo', tipo === 'computador' ? '🖥️ Computador' : '🚪 Sala'],
              ['Recurso', recurso?.nome || recurso?.descricao],
              ['Patrimônio', recurso?.patrimonio],
              ['Data', data?.split('-').reverse().join('/')],
              ['Horário', `${horaInicio} – ${horaFim}`],
              ['Pessoas', numPessoas],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280', fontSize: 14 }}>{k}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, fontSize: 13, color: '#92400e', marginBottom: 16 }}>
            ⚠️ Reservas mínimas de 1 hora. Cancelamento disponível até 30 min antes. Check-in disponível 5 min antes do início.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="ghost" onClick={() => setPasso(2)}>← Voltar</Button>
            <Button onClick={handleConfirmar} disabled={loading} variant="success">
              {loading ? 'Confirmando...' : '✅ Confirmar Reserva'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
