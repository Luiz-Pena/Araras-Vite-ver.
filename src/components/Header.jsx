import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path ? 'ativo' : ''

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="cabecalho-site">
      <div className="container d-flex justify-content-between align-items-center">
        <Link to="/" className="logo">
          <span style={{ fontSize: '1.8rem', marginRight: '10px' }}>🦜</span>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Araras</h1>
        </Link>

        <nav className="navegacao-principal d-flex">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Início</Link>
          <Link to="/categorias" className={`nav-link ${isActive('/categorias')}`}>Categorias</Link>
          <Link to="/regras" className={`nav-link ${isActive('/regras')}`}>Regras</Link>
          <Link to="/membros" className={`nav-link ${isActive('/membros')}`}>Membros</Link>
          <Link to="/eventos" className={`nav-link ${isActive('/eventos')}`}>Eventos</Link>
        </nav>

        <div className="cabecalho-acoes">
          {user ? (
            <>
              <Link to={`/perfil/${user.id}`} className="botao botao-login me-2">
                Meu Perfil
              </Link>
              <button onClick={handleLogout} className="botao botao-registrar border-0">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="botao botao-login me-2">Login</Link>
              <Link to="/cadastrar" className="botao botao-registrar">Cadastrar</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
