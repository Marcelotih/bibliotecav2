import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Button, Alert, Select } from '../../components/common/UI';
import { TIPOS_USUARIO, MODALIDADES } from '../../utils/helpers';

export function LoginPage() {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const user = await authService.login(form.email, form.senha);
      login(user);
      navigate(user.tipo === 'admin' ? '/admin' : '/app');
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#fff', padding: 36, borderRadius: 12, border: '1px solid #e5e7eb', width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36 }}>📚</div>
          <h1 style={{ margin: '8px 0 4px', fontSize: 22, fontWeight: 800 }}>Biblioteca</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Sistema de Reservas</p>
        </div>

        {erro && <div style={{ marginBottom: 16 }}><Alert type="error">{erro}</Alert></div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="E-mail" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Senha" type="password" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} required />
          <Button type="submit" disabled={loading} size="lg" style={{ marginTop: 4 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
          Não tem conta? <Link to="/cadastro" style={{ color: '#2563eb', fontWeight: 600 }}>Cadastre-se</Link>
        </p>

        <div style={{ marginTop: 16, padding: 12, background: '#f9fafb', borderRadius: 6, fontSize: 12, color: '#9ca3af' }}>
          <b>Admin:</b> admin@admin.com / 123456789
        </div>
      </div>
    </div>
  );
}

export function CadastroPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', cpf: '', senha: '', tipo: 'aluno', modalidade: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await authService.cadastrar(form);
      setSucesso(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, border: '1px solid #e5e7eb', width: '100%', maxWidth: 440 }}>
        <h1 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700 }}>Criar Conta</h1>

        {erro && <div style={{ marginBottom: 14 }}><Alert type="error">{erro}</Alert></div>}
        {sucesso && <div style={{ marginBottom: 14 }}><Alert type="success">Conta criada! Redirecionando...</Alert></div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Nome completo" value={form.nome} onChange={e => set('nome', e.target.value)} required />
          <Input label="E-mail" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
          <Input label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={e => set('cpf', e.target.value)} required />
          <Input label="Senha" type="password" value={form.senha} onChange={e => set('senha', e.target.value)} required minLength={6} />
          <Select label="Tipo de usuário" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            {TIPOS_USUARIO.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </Select>
          <Select label="Modalidade do curso" value={form.modalidade} onChange={e => set('modalidade', e.target.value)}>
            <option value="">Selecione...</option>
            {MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Button type="submit" disabled={loading || sucesso} size="lg">
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#6b7280' }}>
          Já tem conta? <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
