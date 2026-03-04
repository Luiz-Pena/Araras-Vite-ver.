// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await login(form);
      nav('/');
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card-header text-center"><h4>Login</h4></div>
        <div className="card-body">
          {erro && <div className="alert alert-danger">{erro}</div>}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">E-mail</label>
              <input type="email" className="form-control" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Senha</label>
              <input type="password" className="form-control" required
                value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary w-100">Entrar</button>
          </form>
        </div>
        <div className="card-footer text-center">
          <small>Não tem conta? <Link to="/cadastro">Cadastre-se</Link></small>
        </div>
      </div>
    </div>
  );
}
