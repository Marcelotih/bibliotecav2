const BASE_URL = 'http://localhost:8080';

// ─── HELPERS HTTP ─────────────────────────────────────────────────────────────

function getToken() {
  try {
    const session = JSON.parse(localStorage.getItem('__session__'));
    return session?.token || null;
  } catch {
    return null;
  }
}

async function http(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    // fetch jogou exceção = back fora do ar, sem rede ou CORS bloqueando
    throw new Error('Não foi possível conectar ao servidor. Verifique se o back-end está rodando.');
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') return null;

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!res.ok) {
    const msg = typeof data === 'string' ? data : data?.message || data?.error || `Erro ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

const get    = (path)         => http('GET',    path);
const post   = (path, body)   => http('POST',   path, body);
const put    = (path, body)   => http('PUT',    path, body);
const patch  = (path, body)   => http('PATCH',  path, body);
const del    = (path)         => http('DELETE', path);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authService = {
  async login(email, senha) {
    const data = await post('/auth/login', { email, senha });
    // data = { token, tipo, nivelAcesso, id, nome, email, cpf }
    return data;
  },

  async cadastrar(dados) {
    return post('/auth/cadastro', {
      email: dados.email,
      senha: dados.senha,
      nome: dados.nome,
      cpf: dados.cpf,
      tipo: dados.tipo || 'aluno',
      modalidade: dados.modalidade,
    });
  },
};

// ─── USUÁRIOS ─────────────────────────────────────────────────────────────────
export const usuarioService = {
  async listar() {
    const lista = await get('/usuarios');
    // Filtra admins fora (nivel ADMIN) e ordena por nome
    return lista
      .filter(u => u.ativo !== false && u.nivelAcesso !== 'ADMIN')
      .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  },

  async buscarPorCpf(cpf) {
    const lista = await get('/usuarios');
    return lista.find(u => u.cpf === cpf) || null;
  },

  async atualizar(id, dados) {
    return put(`/usuarios/${id}`, dados);
  },
};

// ─── COMPUTADORES ─────────────────────────────────────────────────────────────
export const computadorService = {
  async listar() {
    return get('/computadores');
  },

  async buscarPorPatrimonio(patrimonio) {
    const lista = await get('/computadores');
    return lista.find(c => c.patrimonio?.toLowerCase() === patrimonio?.toLowerCase()) || null;
  },

  async criar(dados) {
    return post('/computadores', dados);
  },

  async atualizar(id, dados) {
    return put(`/computadores/${id}`, dados);
  },

  async toggleAtivo(id) {
    const lista = await get('/computadores');
    const item = lista.find(c => c.id === id);
    if (!item) throw new Error('Computador não encontrado');
    return put(`/computadores/${id}`, { ...item, ativo: !item.ativo });
  },
};

// ─── SALAS ────────────────────────────────────────────────────────────────────
export const salaService = {
  async listar() {
    return get('/salas');
  },

  async buscarPorPatrimonio(patrimonio) {
    const lista = await get('/salas');
    return lista.find(s => s.patrimonio?.toLowerCase() === patrimonio?.toLowerCase()) || null;
  },

  async criar(dados) {
    return post('/salas', dados);
  },

  async atualizar(id, dados) {
    return put(`/salas/${id}`, dados);
  },

  async toggleAtivo(id) {
    const lista = await get('/salas');
    const item = lista.find(s => s.id === id);
    if (!item) throw new Error('Sala não encontrada');
    return put(`/salas/${id}`, { ...item, ativo: !item.ativo });
  },
};

// ─── RESERVAS ─────────────────────────────────────────────────────────────────
export const reservaService = {
  async listar(filtros = {}) {
    // O back retorna tudo via GET /reservas. Filtragem no front por ora.
    const lista = await get('/reservas');
    let result = lista;
    if (filtros.usuarioId) result = result.filter(r => String(r.usuarioId) === String(filtros.usuarioId));
    if (filtros.status)    result = result.filter(r => r.status === filtros.status);
    if (filtros.tipo)      result = result.filter(r => r.tipo === filtros.tipo);
    if (filtros.data)      result = result.filter(r => r.data === filtros.data);
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async buscarPorId(id) {
    return get(`/reservas/${id}`);
  },

  async horariosOcupados(tipo, recursoId, data) {
    return get(`/reservas/ocupados?tipo=${tipo}&recursoId=${recursoId}&data=${data}`);
  },

  async criar(dados) {
    return post('/reservas', {
      tipo: dados.tipo,
      recursoId: Number(dados.recursoId),
      recursoNome: dados.recursoNome,
      usuarioId: Number(dados.usuarioId),
      nomeUsuario: dados.nomeUsuario,
      data: dados.data,
      horaInicio: dados.horaInicio,
      horaFim: dados.horaFim,
      numPessoas: Number(dados.numPessoas || 1),
      adminReserva: Boolean(dados.adminReserva),
    });
  },

  async cancelar(id, usuarioId, isAdmin = false) {
    return patch(`/reservas/${id}/cancelar?admin=${isAdmin}`);
  },

  async aprovar(id) {
    return patch(`/reservas/${id}/aprovar`);
  },

  async checkin(id, usuarioId, isAdmin = false) {
    return patch(`/reservas/${id}/checkin?admin=${isAdmin}`);
  },

  async checkout(id) {
    return patch(`/reservas/${id}/checkout`);
  },
};

// ─── RELATÓRIOS ─── (calculados no front com dados da API) ───────────────────
export const relatorioService = {
  async ocupacao(periodo = {}) {
    let reservas = await get('/reservas');
    if (periodo.inicio) reservas = reservas.filter(r => r.data >= periodo.inicio);
    if (periodo.fim)    reservas = reservas.filter(r => r.data <= periodo.fim);

    const total = reservas.length;
    const porStatus = reservas.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
    const porTipo   = reservas.reduce((acc, r) => { acc[r.tipo]   = (acc[r.tipo]   || 0) + 1; return acc; }, {});
    const porDia    = reservas.reduce((acc, r) => { acc[r.data]   = (acc[r.data]   || 0) + 1; return acc; }, {});
    return { total, porStatus, porTipo, porDia };
  },

  async cadastros() {
    const usuarios = (await get('/usuarios')).filter(u => u.nivelAcesso !== 'ADMIN');
    const porTipo = usuarios.reduce((acc, u) => { acc[u.tipo || 'aluno'] = (acc[u.tipo || 'aluno'] || 0) + 1; return acc; }, {});
    const porModalidade = usuarios.reduce((acc, u) => {
      const m = u.modalidade || 'Não informado';
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});
    return { total: usuarios.length, porTipo, porModalidade, lista: usuarios.sort((a, b) => (a.nome || '').localeCompare(b.nome || '')) };
  },

  async reservasPorUsuario() {
    const [reservas, usuarios] = await Promise.all([get('/reservas'), get('/usuarios')]);
    const mapa = reservas.reduce((acc, r) => { acc[r.usuarioId] = (acc[r.usuarioId] || 0) + 1; return acc; }, {});
    return Object.entries(mapa).map(([uid, qtd]) => {
      const u = usuarios.find(x => String(x.id) === String(uid));
      return { usuarioId: uid, nome: u?.nome || 'Desconhecido', qtd };
    }).sort((a, b) => b.qtd - a.qtd);
  },
};