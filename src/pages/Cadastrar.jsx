import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { db } from '../db'
import { useAuth } from '../context/AuthContext'

export default function Cadastrar() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [senha2, setSenha2] = useState('')
  const [erro, setErro] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (senha !== senha2) { setErro('As senhas não coincidem.'); return }
    const u = db.addUsuario(email, senha)
    if (!u) { setErro('E-mail já está em uso.'); return }
    db.addPerfil(u.id, nome)
    login({ id: u.id, email: u.email, nome })
    navigate('/')
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-header text-center"><h3>Cadastro</h3></div>
            <div className="card-body">
              {erro && <div className="alert alert-danger">{erro}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nome</label>
                  <input className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Senha</label>
                  <input type="password" className="form-control" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar Senha</label>
                  <input type="password" className="form-control" value={senha2} onChange={(e) => setSenha2(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100">Cadastrar</button>
              </form>
              <div className="text-center mt-3">
                <Link to="/login">Já tem conta? Fazer login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
