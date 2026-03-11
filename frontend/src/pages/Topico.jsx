// src/pages/Topico.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AVATAR_DEFAULT = 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png';
const fmt = (d) => new Date(d).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

export default function Topico() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState({ conteudo: '', midia: '' });
  const [enviando, setEnviando] = useState(false);
  const [uploadingMidia, setUploadingMidia] = useState(false);

  const handleMidiaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingMidia(true);
    const formData = new FormData();
    formData.append('arquivo', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    setComentario({ ...comentario, midia: data.url });
    setUploadingMidia(false);
  };

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
    
    if (user?.banned_until && new Date(user.banned_until) > new Date()) {
      alert('Você está banido de comentar até ' + new Date(user.banned_until).toLocaleString());
      return;
    } else {
      setEnviando(true);
      try {
        await api.topicos.comentar(id, comentario);
        setComentario({ conteudo: '', midia: '' });
        carregar();
      } finally {
        setEnviando(false);
      }
    }
  };

  const deletarComentario = async (cid) => {
    if (!confirm('Excluir comentário?')) return;
    await api.topicos.deletarComentario(id, cid);
    carregar();
  };

  const deletarTopico = async () => {
    if (!confirm('Excluir tópico?')) return;
    await api.topicos.deletar(id);
    window.history.back();
  };

  if (loading) return <div className="container py-5 text-center"><div className="spinner-border text-primary" /></div>;
  if (!data)   return <div className="container py-5"><p className="text-danger">Tópico não encontrado.</p></div>;

  const { topico, comentarios, jaCurtiu } = data;

  return (
    <div className="container py-4" style={{ maxWidth: 860 }}>
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-link p-0 small mb-2 d-block text-decoration-none align-self-start"
        style={{ cursor: 'pointer' }}
      >
        ← Voltar
      </button>

      {/* Tópico principal */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex gap-3 align-items-center mb-3">
            <img src={topico.autor_avatar || AVATAR_DEFAULT} alt=""
              style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <h4 className="mb-0">{topico.titulo}</h4>
              <small className="text-muted gap-2 d-flex align-items-center">
                Por <Link to={`/perfil/${topico.user_id}`}>{topico.autor_nome || 'Usuário Removido'}</Link>
                {topico.autor_role === 'adm' && <span className="badge bg-primary">Administrador</span>} 
                {' '} em {fmt(topico.created_at)}
              </small>
            </div>
          </div>

          {user && (user.id === topico.user_id || user.role === 'adm') && (
            <button 
              className="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 mt-1 me-1" 
              onClick={deletarTopico}>
                ✕
            </button>
          )}
          
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
              {(user?.id === c.user_id || user?.role === 'adm') && (
                <button
                  className="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 mt-1 me-1"
                  onClick={() => deletarComentario(c.id)}
                  title="Excluir">
                    ✕
                </button>
              )}
              <div className="mb-1 d-flex align-items-center gap-2">
                <Link to={`/perfil/${c.user_id}`} className="text-decoration-none">
                  {c.autor_nome || 'Usuário Removido'}
                </Link>
                {c.autor_role === 'adm' && <span className="badge bg-primary ms-1">Administrador</span>}
              </div>
              <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{c.conteudo}</p>
              {c.midia && (
                <img
                  src={c.midia}
                  className="img-fluid mb-1 rounded"
                  alt="mídia"
                  style={{ maxHeight: 200, width: '100%', objectFit: 'contain', display: 'block' }}
                />
              )}
              <small className="text-muted">{fmt(c.created_at)}</small>
            </div>
          </div>
        </div>
      ))}

      {/* Form novo comentário */}

      {user && (
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
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleMidiaUpload}
                />
                {uploadingMidia && <small className="text-muted">Enviando...</small>}
                {comentario.midia && (
                  <img src={comentario.midia} className="img-fluid mt-2 rounded" style={{ maxHeight: 120 }} />
                )}
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={enviando || uploadingMidia}>
                {enviando ? 'Publicando...' : 'Publicar Comentário'}
              </button>
            </form>
          </div>
        </div>
      )}

      {user?.banned_until && new Date(user.banned_until) > new Date() && (
        <div className="alert alert-warning mt-4">
          Você está banido de comentar até {new Date(user.banned_until).toLocaleString()}.
        </div>
      )}

      {!user &&
        <div className="alert alert-info mt-4">
          <Link to="/login">Faça login</Link> para comentar.
        </div>
      }
    </div>
  );
}
