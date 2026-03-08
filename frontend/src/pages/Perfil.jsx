// src/pages/Perfil.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';

const AVATAR_DEFAULT = 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png';
const fmt = (d) => new Date(d).toLocaleDateString('pt-BR');

export default function Perfil() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState({ nome: '', bio: '', avatar: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('arquivo', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    setEditForm({ ...editForm, avatar: data.url });
    setUploadingAvatar(false);
  };

  const tornarAdm = async () => {
    if (!confirm('Tornar este usuário administrador?')) return;
    await api.perfis.tornarAdm(id);
    carregar();
  };

  const carregar = () =>
    api.perfis.buscar(id).then((d) => {
      setData(d);
      setEditForm({ nome: d.perfil.nome || '', bio: d.perfil.bio || '', avatar: d.perfil.avatar || '' });
    });

  useEffect(() => { carregar(); }, [id]);

  const salvarPerfil = async (e) => {
    e.preventDefault();
    await api.perfis.editar(editForm);
    setEditando(false);
    carregar();
  };

  const excluirPerfil = async () => {
    if (!confirm('Excluir sua conta permanentemente?')) return;
    await api.perfis.deletar();
    await logout();
    nav('/login');
  };

  const banirUsuario = async () => {
    if (!confirm('Banir este usuário? Ele nao poderá comentar ou criar tópicos por 7 dias.')) return;
    await api.perfis.banir(id);
    carregar();
  }

  const deletarTopico = async (tid) => {
    if (!confirm('Excluir este tópico?')) return;
    await api.topicos.deletar(tid);
    carregar();
  };

  const seguir = async () => {
    const acao = data.jaSegue ? 'deixar_de_seguir' : 'seguir';
    const res = await api.perfis.seguir(id, acao);
    setData((d) => ({ ...d, jaSegue: res.jaSegue }));
    carregar();
  };

  if (!data) return <div className="container py-5 text-center"><div className="spinner-border text-primary" /></div>;

  const { perfil, topicos, jaSegue } = data;
  const isMeu = user?.id === perfil.id;

  return (
    <div className="container-fluid py-3" style={{ display: 'flex', gap: 24 }}>
      {/* Sidebar perfil */}
      <aside style={{ width: 300, flexShrink: 0 }}>
        <div className="card p-3">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-link p-0 small mb-2 d-block text-decoration-none align-self-start"
            style={{ cursor: 'pointer' }}
          >
            ← Voltar
          </button>
          <img src={perfil.avatar || AVATAR_DEFAULT} alt="" className="rounded-circle mb-2"
            style={{ width: 120, height: 120, objectFit: 'cover' }} />
          <h5>{perfil.nome}</h5>
          {perfil?.banned_until && new Date(perfil.banned_until) > new Date() && (
            <span className="badge bg-danger mb-2">Banido até {fmt(perfil.banned_until)}</span>
          )}
          {perfil?.role === 'adm' && <span className="badge bg-primary">Administrador</span>}
          <p className="text-muted small">{perfil.seguidores} Seguidores · {perfil.seguindo} Seguindo</p>
          <p className="small text-muted">Membro desde {fmt(perfil.created_at)}</p>
          {perfil.bio && <p className="small">{perfil.bio}</p>}

          {user?.role === 'adm' && !isMeu && perfil.role !== 'adm' && (
            <button className="btn btn-danger btn-sm w-100 mb-2" onClick={banirUsuario}>
              Banir Usuário
            </button>
          )}

          {user?.role === 'adm' && !isMeu && perfil.role === 'user' && (
            <button className="btn btn-primary btn-sm w-100 mb-2" onClick={tornarAdm}>
              Tornar Administrador
            </button>
          )}

          {isMeu && !editando && (
            <>
              <button className="btn btn-primary btn-sm w-100 mb-2" onClick={() => setEditando(true)}>
                Editar Perfil
              </button>
            </>
          )}

          {isMeu && editando && (
            <form onSubmit={salvarPerfil}>
              <div className="mb-2">
                <label className="form-label small">Nome</label>
                <input className="form-control form-control-sm" required value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label small">Avatar</label>
                <input
                  type="file"
                  className="form-control form-control-sm"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                  {uploadingAvatar && <small className="text-muted">Enviando...</small>}
                  {editForm.avatar && (
                    <img
                      src={editForm.avatar}
                      className="rounded-circle mt-2"
                      style={{ width: 60, height: 60, objectFit: 'cover' }}
                    />
                  )}
              </div>
              <div className="mb-2">
                <label className="form-label small">Bio</label>
                <textarea className="form-control form-control-sm" rows={3} value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-success btn-sm w-100 mb-1">Salvar</button>
              <button type="button" className="btn btn-secondary btn-sm w-100 mb-1" onClick={() => setEditando(false)}>Cancelar</button>
              <button type="button" className="btn btn-danger btn-sm w-100" onClick={excluirPerfil}>Excluir Conta</button>
            </form>
          )}

          {!isMeu && user && (
            <button className={`btn btn-sm w-100 ${jaSegue ? 'btn-secondary' : 'btn-success'}`} onClick={seguir}>
              {jaSegue ? 'Deixar de Seguir' : 'Seguir'}
            </button>
          )}
        </div>
      </aside>

      {/* Publicações */}
      <main style={{ flex: 1 }}>
        <h5 className="mb-3">Publicações</h5>
          {topicos.length === 0 && <p className="text-muted">Nenhuma publicação ainda.</p>}
            {topicos.map((t) => (
              <div 
                key={t.id} 
                className="card mb-3 position-relative shadow-sm cartao"
                onClick={() => navigate(`/topico/${t.id}`)}
                style={{ cursor: 'pointer' }}
              >
              <div className="card-body">
                {(isMeu || user?.role === 'adm') && (
                  <button
                    className="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 mt-1 me-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletarTopico(t.id);
                    }}
                    style={{ zIndex: 2 }} 
                >
                  ✕
                </button>
                )}
        
              <Link 
                to={`/topico/${t.id}`} 
                className="text-dark fw-semibold d-block mb-1"
                onClick={(e) => e.stopPropagation()}
              >
                {t.titulo}
              </Link>

              <p className="text-muted small mb-1" style={{ whiteSpace: 'pre-wrap' }}>
                {t.conteudo.slice(0, 200)}{t.conteudo.length > 200 ? '…' : ''}
              </p>

              {t.midia && (
                <img 
                  src={t.midia} 
                  className="img-fluid rounded mb-1" 
                  alt="mídia" 
                  style={{ maxHeight: 160, width: '100%', objectFit: 'cover' }} 
                />
              )}

              <small className="text-muted">
                {t.curtidas} curtidas · {t.comentarios} comentários · {fmt(t.created_at)}
              </small>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
