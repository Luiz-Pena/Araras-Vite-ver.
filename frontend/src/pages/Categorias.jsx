import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import NovoTopicoModal from '../components/NovoTopicoModal';

export default function Categorias() {
  const [params] = useSearchParams();
  const curso = params.get('curso');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [itens, setItens] = useState([]);

  const carregar = () => {
    if (curso) {
      api.categorias.topicos(curso).then(setItens);
    } else {
      api.categorias.listar().then(setItens);
    }
  };

  const deletarTopico = async (e, tid) => {
    e.stopPropagation(); // Impede que o clique no botão abra o tópico
    if (!confirm('Deseja realmente excluir este tópico?')) return;
    try {
      await api.topicos.deletar(tid);
      carregar();
    } catch (err) {
      alert('Erro ao deletar: ' + err.message);
    }
  };

  const handleCardClick = (tid) => {
    navigate(`/topico/${tid}`);
  };

  useEffect(carregar, [curso]);

  return (
    <div className="container py-4 d-flex gap-4">
      <main style={{ flex: 3 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>{curso ? `Tópicos: ${curso}` : 'Cursos UFU Monte Carmelo'}</h4>
          {curso && user && (!user.banned_until || new Date(user.banned_until) < new Date()) && (
            <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalNovoTopico">
              Criar Tópico
            </button>
          )}
        </div>

        {!curso && itens.map((c) => (
          <div key={c.id} className="card mb-2 shadow-sm">
            <div className="card-body">
              <h6><Link to={`/categorias?curso=${encodeURIComponent(c.nome)}`}>{c.nome}</Link></h6>
              <p className="text-muted small mb-0">{c.descricao}</p>
            </div>
          </div>
        ))}

        {curso && itens.map((t) => (
          <div 
            key={t.id} 
            className="card mb-2 cartao-topico position-relative"
            onClick={() => handleCardClick(t.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-body d-flex gap-3 align-items-center">
              {user && (user.id === t.user_id || user.role === 'adm') && (
                <button 
                  className="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 mt-1 me-1"
                  onClick={(e) => deletarTopico(e, t.id)}
                  style={{ zIndex: 2 }}
                >
                  ✕
                </button>
              )}

              <Link to={`/perfil/${t.user_id}`} onClick={(e) => e.stopPropagation()}>
                <img 
                  src={t.autor_avatar || 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png'}
                  alt="" 
                  style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }} 
                />
              </Link>

              <div className="flex-grow-1">
                <Link to={`/topico/${t.id}`} className="fw-semibold text-dark">{t.titulo}</Link>
                <div className="small text-muted">
                  Por <Link to={`/perfil/${t.user_id}`} onClick={(e) => e.stopPropagation()}>
                    {t.autor_nome || 'Removido'}
                  </Link>
                  {' · '}{t.contagem_respostas} respostas
                </div>
              </div>

              <div className="text-muted small text-end">
                {new Date(t.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        ))}

        {itens.length === 0 && <p className="text-muted">Nenhum item encontrado.</p>}
      </main>
      
      <Sidebar />
      {user && <NovoTopicoModal onCriado={carregar} />}
    </div>
  );
}