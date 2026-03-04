// src/components/Header.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = async () => {
    await logout();
    nav('/');
  };

  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid #dee2e6',
      padding: '15px 0',
    }}>
      <div className="container d-flex justify-content-between align-items-center">
        <Link to="/" className="d-flex align-items-center text-decoration-none gap-2">
          <img src="/92020.png" alt="Araras" width={40} height={40} />
          <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0d6efd' }}>Araras</span>
        </Link>

        <nav className="d-flex gap-3">
          {[
            { to: '/',           label: 'Início'     },
            { to: '/categorias', label: 'Categorias' },
            { to: '/regras',     label: 'Regras'     },
            { to: '/membros',    label: 'Membros'    },
            { to: '/eventos',    label: 'Eventos'    },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                color: isActive ? '#0d6efd' : '#212529',
                fontWeight: 500,
                textDecoration: 'none',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="d-flex gap-2">
          {user ? (
            <>
              <Link to={`/perfil/${user.id}`} className="btn btn-outline-primary btn-sm">
                Meu Perfil
              </Link>
              <button className="btn btn-primary btn-sm" onClick={handleLogout}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-outline-primary btn-sm">Login</Link>
              <Link to="/cadastro" className="btn btn-primary btn-sm">Cadastrar</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
