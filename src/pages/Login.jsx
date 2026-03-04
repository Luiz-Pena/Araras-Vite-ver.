import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { db } from '../db'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const u = db.loginUsuario(email, senha)
    if (!u) {
      setErro('E-mail ou senha incorretos.')
      return
    }
    const perfil = db.getPerfil(u.id)
    login({ id: u.id, email: u.email, nome: perfil?.nome || 'Usuário' })
    navigate('/')
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-header text-center">
              <h3>Login</h3>
            </div>
            <div className="card-body">
              {erro && <div className="alert alert-danger">{erro}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Senha</label>
                  <input
                    type="password"
                    className="form-control"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Entrar</button>
              </form>
              <div className="d-flex justify-content-between mt-3">
                <Link to="/cadastrar">Cadastrar</Link>
                <Link to="/">Voltar</Link>
              </div>
              <div className="mt-3 p-2 bg-light rounded small text-muted">
                <strong>Demo:</strong> demo@araras.com / demo123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
