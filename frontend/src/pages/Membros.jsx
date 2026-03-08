// src/pages/Membros.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Membros() {
  const [membros, setMembros] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { api.membros.listar().then(setMembros); }, []);

  const handleClickMembro = (m) => {
    // Navega para o perfil do membro
    navigate(`/perfil/${m.id}`);
  }

  return (
    <div className="container py-4 d-flex gap-4">
      <main style={{ flex: 3 }}>
        <h4 className="mb-3">Membros do Fórum</h4>
        {membros.map((m) => (
          <div key={m.id} className="card mb-2">
            <div 
              className="card-body d-flex align-items-center gap-3 cartao"
              onClick={() => handleClickMembro(m)}
              style={{ cursor: 'pointer' }}
            >
              <Link to={`/perfil/${m.id}`}>
                <img src={m.avatar || 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png'}
                  alt="" style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }} />
              </Link>
              <div className="flex-grow-1">
                <Link to={`/perfil/${m.id}`} className="fw-semibold text-dark">{m.nome}</Link>
                <div className="small text-muted">
                  Membro desde {new Date(m.created_at).toLocaleDateString('pt-BR')}
                  {' · '}{m.contagem_topicos} tópicos
                  <br />
                  {m?.role === 'adm' ? <span className="badge bg-primary">Administrador</span> : <span className="badge bg-secondary">Usuário</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
