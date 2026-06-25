export const TIPOS_USUARIO = ['aluno', 'professor', 'funcionario', 'visitante'];
export const MODALIDADES = ['Presencial', 'EAD', 'Híbrido', 'Pós-graduação', 'Extensão'];

export const STATUS_LABEL = {
  pendente: 'Pendente',
  confirmada: 'Confirmada',
  checkin: 'Em uso',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export const STATUS_COLOR = {
  pendente: '#f59e0b',
  confirmada: '#3b82f6',
  checkin: '#10b981',
  concluida: '#6b7280',
  cancelada: '#ef4444',
};

export function formatDate(iso) {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

export function hojeHora() {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
}

export function gerarSlots(inicio = '07:00', fim = '22:00', intervalo = 60) {
  const slots = [];
  let [h, m] = inicio.split(':').map(Number);
  const [fh, fm] = fim.split(':').map(Number);
  while (h * 60 + m < fh * 60 + fm) {
    const s = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    m += intervalo;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    const e = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    if (h * 60 + m <= fh * 60 + fm) slots.push({ inicio: s, fim: e });
  }
  return slots;
}

export function pessoasNoSlot(slot, ocupados) {
  return ocupados
    .filter(o => !(slot.fim <= o.inicio || slot.inicio >= o.fim))
    .reduce((total, o) => total + Number(o.numPessoas || 1), 0);
}

export function slotOcupado(slot, ocupados, capacidade = 1) {
  return pessoasNoSlot(slot, ocupados) >= capacidade;
}
