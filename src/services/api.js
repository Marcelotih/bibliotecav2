/**
 * CAMADA DE SERVIÇO — localStorage agora, API REST depois.
 * Para migrar: substitua os métodos abaixo por fetch('/api/...').
 * Todos os métodos retornam Promise para já simular comportamento assíncrono.
 */

// ─── SEED INICIAL ────────────────────────────────────────────────────────────
const SEED_KEY = '__biblioteca_seeded__';

function seed() {
  if (localStorage.getItem(SEED_KEY)) return;

  // Admin padrão
  const users = [
    {
      id: 'admin-1',
      nome: 'Administrador',
      email: 'admin@biblioteca.com',
      senha: 'admin123',
      cpf: '000.000.000-00',
      tipo: 'admin',
      modalidade: null,
      ativo: true,
      criadoEm: new Date().toISOString(),
    },
  ];

  // Computadores
  const computadores = Array.from({ length: 10 }, (_, i) => ({
    id: `pc-${i + 1}`,
    patrimonio: `PAT-${String(i + 1).padStart(4, '0')}`,
    descricao: `Computador ${i + 1}`,
    ativo: true,
    criadoEm: new Date().toISOString(),
  }));

  // Salas
  const salas = [
    { id: 'sala-1', nome: 'Sala A', patrimonio: 'SAL-0001', capacidade: 5, ativo: true, criadoEm: new Date().toISOString() },
    { id: 'sala-2', nome: 'Sala B', patrimonio: 'SAL-0002', capacidade: 5, ativo: true, criadoEm: new Date().toISOString() },
    { id: 'sala-3', nome: 'Sala C', patrimonio: 'SAL-0003', capacidade: 5, ativo: true, criadoEm: new Date().toISOString() },
  ];

  _set('usuarios', users);
  _set('computadores', computadores);
  _set('salas', salas);
  _set('reservas', []);
  localStorage.setItem(SEED_KEY, '1');
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function _get(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function _set(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function _id() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
function delay(ms = 50) {
  return new Promise(r => setTimeout(r, ms));
}

seed();

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authService = {
  async login(email, senha) {
    await delay();
    const users = _get('usuarios');
    const user = users.find(u => u.email === email && u.senha === senha && u.ativo);
    if (!user) throw new Error('Email ou senha inválidos');
    const { senha: _, ...safe } = user;
    return safe;
  },

  async cadastrar(dados) {
    await delay();
    const users = _get('usuarios');
    if (users.find(u => u.email === dados.email)) throw new Error('Email já cadastrado');
    if (users.find(u => u.cpf === dados.cpf)) throw new Error('CPF já cadastrado');
    const novo = { id: _id(), ...dados, tipo: dados.tipo || 'aluno', ativo: true, criadoEm: new Date().toISOString() };
    _set('usuarios', [...users, novo]);
    const { senha: _, ...safe } = novo;
    return safe;
  },
};

// ─── USUÁRIOS (admin) ─────────────────────────────────────────────────────────
export const usuarioService = {
  async listar() {
    await delay();
    return _get('usuarios').filter(u => u.tipo !== 'admin').sort((a, b) => a.nome.localeCompare(b.nome));
  },

  async buscarPorCpf(cpf) {
    await delay();
    const users = _get('usuarios');
    return users.find(u => u.cpf === cpf) || null;
  },

  async atualizar(id, dados) {
    await delay();
    const users = _get('usuarios').map(u => u.id === id ? { ...u, ...dados } : u);
    _set('usuarios', users);
    return users.find(u => u.id === id);
  },
};

// ─── COMPUTADORES ─────────────────────────────────────────────────────────────
export const computadorService = {
  async listar() {
    await delay();
    return _get('computadores');
  },

  async buscarPorPatrimonio(patrimonio) {
    await delay();
    return _get('computadores').find(c => c.patrimonio.toLowerCase() === patrimonio.toLowerCase()) || null;
  },

  async criar(dados) {
    await delay();
    const lista = _get('computadores');
    if (lista.find(c => c.patrimonio === dados.patrimonio)) throw new Error('Patrimônio já cadastrado');
    const novo = { id: _id(), ...dados, ativo: true, criadoEm: new Date().toISOString() };
    _set('computadores', [...lista, novo]);
    return novo;
  },

  async atualizar(id, dados) {
    await delay();
    const lista = _get('computadores').map(c => c.id === id ? { ...c, ...dados } : c);
    _set('computadores', lista);
    return lista.find(c => c.id === id);
  },

  async toggleAtivo(id) {
    await delay();
    const lista = _get('computadores').map(c => c.id === id ? { ...c, ativo: !c.ativo } : c);
    _set('computadores', lista);
    return lista.find(c => c.id === id);
  },
};

// ─── SALAS ────────────────────────────────────────────────────────────────────
export const salaService = {
  async listar() {
    await delay();
    return _get('salas');
  },

  async buscarPorPatrimonio(patrimonio) {
    await delay();
    return _get('salas').find(s => s.patrimonio.toLowerCase() === patrimonio.toLowerCase()) || null;
  },

  async criar(dados) {
    await delay();
    const lista = _get('salas');
    if (lista.find(s => s.patrimonio === dados.patrimonio)) throw new Error('Patrimônio já cadastrado');
    const nova = { id: _id(), ...dados, ativo: true, criadoEm: new Date().toISOString() };
    _set('salas', [...lista, nova]);
    return nova;
  },

  async atualizar(id, dados) {
    await delay();
    const lista = _get('salas').map(s => s.id === id ? { ...s, ...dados } : s);
    _set('salas', lista);
    return lista.find(s => s.id === id);
  },

  async toggleAtivo(id) {
    await delay();
    const lista = _get('salas').map(s => s.id === id ? { ...s, ativo: !s.ativo } : s);
    _set('salas', lista);
    return lista.find(s => s.id === id);
  },
};

// ─── RESERVAS ─────────────────────────────────────────────────────────────────
// Status: pendente | confirmada | checkin | concluida | cancelada
export const reservaService = {
  async listar(filtros = {}) {
    await delay();
    let reservas = _get('reservas');
    if (filtros.usuarioId) reservas = reservas.filter(r => r.usuarioId === filtros.usuarioId);
    if (filtros.status) reservas = reservas.filter(r => r.status === filtros.status);
    if (filtros.tipo) reservas = reservas.filter(r => r.tipo === filtros.tipo);
    if (filtros.data) reservas = reservas.filter(r => r.data === filtros.data);
    return reservas.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
  },

  async buscarPorId(id) {
    await delay();
    return _get('reservas').find(r => r.id === id) || null;
  },

  /**
   * Verifica disponibilidade de um recurso em data/hora.
   * tipo: 'computador' | 'sala'
   * Retorna lista de slots ocupados na data.
   */
  async horariosOcupados(tipo, recursoId, data) {
    await delay();
    const reservas = _get('reservas').filter(
      r => r.tipo === tipo && r.recursoId === recursoId && r.data === data &&
        !['cancelada'].includes(r.status)
    );
    return reservas.map(r => ({ inicio: r.horaInicio, fim: r.horaFim, reservaId: r.id }));
  },

  async criar(dados) {
    await delay();
    const reservas = _get('reservas');

    // Valida mínimo 1 hora
    const [ih, im] = dados.horaInicio.split(':').map(Number);
    const [fh, fm] = dados.horaFim.split(':').map(Number);
    const duracaoMin = (fh * 60 + fm) - (ih * 60 + im);
    if (duracaoMin < 60) throw new Error('Reserva mínima de 1 hora');

    // Valida conflito
    const conflito = reservas.find(r =>
      r.tipo === dados.tipo &&
      r.recursoId === dados.recursoId &&
      r.data === dados.data &&
      !['cancelada'].includes(r.status) &&
      !(dados.horaFim <= r.horaInicio || dados.horaInicio >= r.horaFim)
    );
    if (conflito) throw new Error('Horário já reservado');

    // Limite por recurso
    if (dados.tipo === 'computador') {
      const ocupantes = reservas.filter(r =>
        r.tipo === 'computador' && r.recursoId === dados.recursoId &&
        r.data === dados.data && !['cancelada'].includes(r.status) &&
        !(dados.horaFim <= r.horaInicio || dados.horaInicio >= r.horaFim)
      );
      if (ocupantes.length >= 2) throw new Error('Limite de 2 pessoas por computador atingido');
    }

    const nova = {
      id: _id(),
      ...dados,
      status: dados.adminReserva ? 'confirmada' : 'pendente',
      criadoEm: new Date().toISOString(),
    };
    _set('reservas', [...reservas, nova]);
    return nova;
  },

  async cancelar(id, usuarioId, isAdmin = false) {
    await delay();
    const reservas = _get('reservas');
    const reserva = reservas.find(r => r.id === id);
    if (!reserva) throw new Error('Reserva não encontrada');
    if (!isAdmin && reserva.usuarioId !== usuarioId) throw new Error('Sem permissão');
    if (['checkin', 'concluida', 'cancelada'].includes(reserva.status)) {
      throw new Error('Não é possível cancelar reserva neste status');
    }

    // Limite de cancelamento: 30 min antes (configurável)
    if (!isAdmin) {
      const agora = new Date();
      const inicio = new Date(`${reserva.data}T${reserva.horaInicio}`);
      const diffMin = (inicio - agora) / 60000;
      if (diffMin < 30) throw new Error('Cancelamento só é permitido até 30 minutos antes do início');
    }

    const atualizadas = reservas.map(r => r.id === id ? { ...r, status: 'cancelada', canceladoEm: new Date().toISOString() } : r);
    _set('reservas', atualizadas);
    return atualizadas.find(r => r.id === id);
  },

  async checkin(id, usuarioId, isAdmin = false) {
    await delay();
    const reservas = _get('reservas');
    const reserva = reservas.find(r => r.id === id);
    if (!reserva) throw new Error('Reserva não encontrada');

    // Check-in só 5 min antes
    if (!isAdmin) {
      const agora = new Date();
      const inicio = new Date(`${reserva.data}T${reserva.horaInicio}`);
      const diffMin = (inicio - agora) / 60000;
      if (diffMin > 5) throw new Error('Check-in disponível apenas 5 minutos antes do início');
    }

    const atualizadas = reservas.map(r => r.id === id ? { ...r, status: 'checkin', checkinEm: new Date().toISOString() } : r);
    _set('reservas', atualizadas);
    return atualizadas.find(r => r.id === id);
  },

  async checkout(id) {
    await delay();
    const reservas = _get('reservas').map(r =>
      r.id === id ? { ...r, status: 'concluida', checkoutEm: new Date().toISOString() } : r
    );
    _set('reservas', reservas);
    return reservas.find(r => r.id === id);
  },
};

// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
export const relatorioService = {
  async ocupacao(periodo = {}) {
    await delay();
    let reservas = _get('reservas');
    if (periodo.inicio) reservas = reservas.filter(r => r.data >= periodo.inicio);
    if (periodo.fim) reservas = reservas.filter(r => r.data <= periodo.fim);

    const total = reservas.length;
    const porStatus = reservas.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    const porTipo = reservas.reduce((acc, r) => {
      acc[r.tipo] = (acc[r.tipo] || 0) + 1;
      return acc;
    }, {});
    const porDia = reservas.reduce((acc, r) => {
      acc[r.data] = (acc[r.data] || 0) + 1;
      return acc;
    }, {});

    return { total, porStatus, porTipo, porDia };
  },

  async cadastros() {
    await delay();
    const usuarios = _get('usuarios').filter(u => u.tipo !== 'admin');
    const porTipo = usuarios.reduce((acc, u) => {
      acc[u.tipo] = (acc[u.tipo] || 0) + 1;
      return acc;
    }, {});
    const porModalidade = usuarios.reduce((acc, u) => {
      const m = u.modalidade || 'Não informado';
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});
    return { total: usuarios.length, porTipo, porModalidade, lista: usuarios.sort((a, b) => a.nome.localeCompare(b.nome)) };
  },

  async reservasPorUsuario() {
    await delay();
    const reservas = _get('reservas');
    const usuarios = _get('usuarios');
    const mapa = reservas.reduce((acc, r) => {
      acc[r.usuarioId] = (acc[r.usuarioId] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(mapa).map(([uid, qtd]) => {
      const u = usuarios.find(x => x.id === uid);
      return { usuarioId: uid, nome: u?.nome || 'Desconhecido', qtd };
    }).sort((a, b) => b.qtd - a.qtd);
  },
};
