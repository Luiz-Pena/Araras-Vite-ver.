// src/pages/Cadastro.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Cadastro() {
  const { cadastro } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', senha2: '' });
  const [erro, setErro] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await cadastro(form);
      nav('/');
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow" style={{ width: '100%', maxWidth: 440 }}>
        <div className="card-header text-center"><h4>Cadastro</h4></div>
        <div className="card-body">
          {erro && <div className="alert alert-danger">{erro}</div>}
          <form onSubmit={submit}>
            {[
              { label: 'Nome',             key: 'nome',   type: 'text'     },
              { label: 'E-mail',           key: 'email',  type: 'email'    },
              { label: 'Senha',            key: 'senha',  type: 'password' },
              { label: 'Confirmar Senha',  key: 'senha2', type: 'password' },
            ].map(({ label, key, type }) => (
              <div className="mb-3" key={key}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-control" required
                  value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <button type="submit" className="btn btn-primary w-100">Cadastrar</button>
          </form>
        </div>
        <div className="card-footer text-center">
          <small>Já tem conta? <Link to="/login">Entrar</Link></small>
        </div>
      </div>
    </div>
  );
}
