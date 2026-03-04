// src/pages/Topico.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';

const AVATAR_DEFAULT = 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png';
const fmt = (d) => new Date(d).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

export default function Topico() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState({ conteudo: '', midia: '' });
  const [enviando, setEnviando] = useState(false);

  const carregar = () => {
    setLoading(true);
    api.topicos.buscar(id).then(setData).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(carregar, [id]);

  const curtir = async () => {
    if (!user) return;
    const acao = data.jaCurtiu ? 'descurtir' : 'curtir';
    const res = await api.topicos.curtir(id, acao);
    setData((d) => ({ ...d, jaCurtiu: res.jaCurtiu, topico: { ...d.topico, curtidas: res.curtidas } }));
  };

  const submitComentario = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.topicos.comentar(id, comentario);
      setComentario({ conteudo: '', midia: '' });
      carregar();
    } finally {
      setEnviando(false);
    }
  };

  const deletarComentario = async (cid) => {
    if (!confirm('Excluir comentário?')) return;
    await api.topicos.deletarComentario(id, cid);
    carregar();
  };

  if (loading) return <div className="container py-5 text-center"><div className="spinner-border text-primary" /></div>;
  if (!data)   return <div className="container py-5"><p className="text-danger">Tópico não encontrado.</p></div>;

  const { topico, comentarios, jaCurtiu } = data;

  return (
    <div className="container py-4" style={{ maxWidth: 860 }}>
      <Link to="/" className="btn btn-link ps-0 mb-3">← Voltar</Link>

      {/* Tópico principal */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex gap-3 align-items-center mb-3">
            <img src={topico.autor_avatar || AVATAR_DEFAULT} alt=""
              style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <h4 className="mb-0">{topico.titulo}</h4>
              <small className="text-muted">
                Por <Link to={`/perfil/${topico.user_id}`}>{topico.autor_nome || 'Usuário Removido'}</Link>
                {' '}em {fmt(topico.created_at)}
              </small>
            </div>
          </div>
          <hr />
          <p style={{ whiteSpace: 'pre-wrap' }}>{topico.conteudo}</p>
          {topico.midia && <img src={topico.midia} className="img-fluid mt-2 rounded" alt="mídia" />}

          <div className="d-flex align-items-center gap-3 mt-3">
            <span className="text-muted">{topico.curtidas} curtidas</span>
            {user && (
              <button
                className={`btn btn-sm ${jaCurtiu ? 'btn-danger' : 'btn-outline-primary'}`}
                onClick={curtir}
              >
                {jaCurtiu ? 'Descurtir' : 'Curtir'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comentários */}
      <h5>Comentários ({comentarios.length})</h5>
      {comentarios.map((c) => (
        <div key={c.id} className="d-flex gap-3 mb-3">
          <img src={c.autor_avatar || AVATAR_DEFAULT} alt=""
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          <div className="card flex-grow-1 position-relative">
            <div className="card-body py-2 px-3">
              {user?.id === c.user_id && (
                <button
                  className="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 mt-1 me-1"
                  onClick={() => deletarComentario(c.id)}
                  title="Excluir"
                >✕</button>
              )}
              <strong className="d-block">{c.autor_nome || 'Usuário Removido'}</strong>
              <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{c.conteudo}</p>
              {c.midia && <img src={c.midia} className="img-fluid mb-1 rounded" alt="mídia" style={{ maxHeight: 200 }} />}
              <small className="text-muted">{fmt(c.created_at)}</small>
            </div>
          </div>
        </div>
      ))}

      {/* Form novo comentário */}
      {user ? (
        <div className="card mt-4">
          <div className="card-body">
            <h6>Adicionar Comentário</h6>
            <form onSubmit={submitComentario}>
              <div className="mb-2">
                <textarea className="form-control" rows={3} required placeholder="Escreva seu comentário..."
                  value={comentario.conteudo}
                  onChange={(e) => setComentario({ ...comentario, conteudo: e.target.value })} />
              </div>
              <div className="mb-2">
                <input type="url" className="form-control" placeholder="URL de mídia (opcional)"
                  value={comentario.midia}
                  onChange={(e) => setComentario({ ...comentario, midia: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={enviando}>
                {enviando ? 'Publicando...' : 'Publicar Comentário'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="alert alert-info mt-4">
          <Link to="/login">Faça login</Link> para comentar.
        </div>
      )}
    </div>
  );
}
