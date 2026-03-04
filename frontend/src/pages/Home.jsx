// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import NovoTopicoModal from '../components/NovoTopicoModal';

function TopicCard({ t }) {
  const avatar = t.autor_avatar || 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png';
  return (
    <div className="card mb-3 cartao-topico">
      <div className="card-body d-flex gap-3 align-items-center">
        <Link to={`/perfil/${t.user_id}`}>
          <img src={avatar} alt="" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
        </Link>
        <div className="flex-grow-1">
          <h6 className="mb-1">
            <Link to={`/topico/${t.id}`} className="text-dark fw-semibold">{t.titulo}</Link>
          </h6>
          <small className="text-muted">
            Por <Link to={`/perfil/${t.user_id}`}>{t.autor_nome || 'Usuário Removido'}</Link>{' '}
            em <Link to={`/categorias?curso=${encodeURIComponent(t.categoria_nome)}`}
              className="badge bg-primary-subtle text-primary text-decoration-none">
              {t.categoria_nome}
            </Link>
            <span className="ms-2">{t.contagem_respostas} Respostas</span>
          </small>
        </div>
        <div className="text-end text-muted" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          <div>Última resposta</div>
          <div>{new Date(t.created_at).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [topicos, setTopicos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    setLoading(true);
    api.topicos.listar().then(setTopicos).finally(() => setLoading(false));
  };

  useEffect(carregar, []);

  return (
    <div className="container py-4 d-flex gap-4">
      <main style={{ flex: 3 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Tópicos Recentes</h4>
          {user && (
            <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalNovoTopico">
              Criar Novo Tópico
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : topicos.length === 0 ? (
          <p className="text-muted">Nenhum tópico encontrado.</p>
        ) : (
          topicos.map((t) => <TopicCard key={t.id} t={t} />)
        )}
      </main>

      <Sidebar />
      {user && <NovoTopicoModal onCriado={carregar} />}
    </div>
  );
}
