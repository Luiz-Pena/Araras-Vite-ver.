import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { db } from '../db'
import { useAuth } from '../context/AuthContext'

function formatData(str) {
  return new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Perfil() {
  const { id } = useParams()
  const userId = Number(id)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [topicos, setTopicos] = useState([])
  const [editando, setEditando] = useState(false)
  const [editNome, setEditNome] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [seguindo, setSeguindo] = useState(false)

  const load = () => {
    const p = db.getPerfil(userId)
    setPerfil(p)
    if (p) {
      setEditNome(p.nome)
      setEditBio(p.bio || '')
      setEditAvatar(p.avatar || '')
    }
    const ts = db.getTopicos()
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((t) => db.getTopicoComAutor(t.id))
    setTopicos(ts)
    if (user && user.id !== userId) {
      setSeguindo(db.jaSeguindo(user.id, userId))
    }
  }

  useEffect(() => { load() }, [userId])

  if (!perfil) return <div className="container mt-5"><p>Perfil não encontrado.</p></div>

  const seguidores = db.contarSeguidores(userId)
  const quemSeguindo = db.contarSeguindo(userId)
  const isOwner = user && user.id === userId

  const handleSalvarPerfil = (e) => {
    e.preventDefault()
    db.updatePerfil(userId, { nome: editNome, bio: editBio, avatar: editAvatar })
    setEditando(false)
    load()
  }

  const handleDeletePerfil = () => {
    if (!confirm('Excluir seu perfil permanentemente?')) return
    db.deleteUsuario(userId)
    logout()
    navigate('/')
  }

  const handleSeguir = () => {
    if (!user) return navigate('/login')
    if (seguindo) db.deixarDeSeguir(user.id, userId)
    else db.seguir(user.id, userId)
    setSeguindo(!seguindo)
    load()
  }

  const handleDeleteTopico = (tId) => {
    if (!confirm('Excluir este tópico?')) return
    db.deleteTopico(tId, userId)
    load()
  }

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar do perfil */}
        <div className="col-md-3">
          <div className="sidebar-perfil">
            <Link to="/" className="small">← Voltar</Link>
            <img
              src={perfil.avatar || 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png'}
              alt="Avatar"
              className="imagem-flutuante mt-3"
            />
            <h4>{perfil.nome}</h4>
            <p className="text-muted small mb-1"><strong>{seguidores}</strong> Seguidores</p>
            <p className="text-muted small mb-1"><strong>{quemSeguindo}</strong> Seguindo</p>
            <p className="text-muted small mb-2">Membro desde {formatData(perfil.created_at)}</p>
            {perfil.bio && <p className="small">{perfil.bio}</p>}

            {isOwner && !editando && (
              <>
                <button className="btn btn-primary btn-sm w-100 mb-2" onClick={() => setEditando(true)}>
                  Editar Perfil
                </button>
                <button className="btn btn-danger btn-sm w-100" onClick={handleDeletePerfil}>
                  Excluir Perfil
                </button>
              </>
            )}

            {isOwner && editando && (
              <form onSubmit={handleSalvarPerfil}>
                <div className="mb-2">
                  <label className="form-label small">Nome</label>
                  <input className="form-control form-control-sm" value={editNome} onChange={(e) => setEditNome(e.target.value)} required />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Avatar (URL)</label>
                  <input className="form-control form-control-sm" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Bio</label>
                  <textarea className="form-control form-control-sm" rows={3} value={editBio} onChange={(e) => setEditBio(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-success btn-sm w-100 mb-1">Salvar</button>
                <button type="button" className="btn btn-secondary btn-sm w-100" onClick={() => setEditando(false)}>Cancelar</button>
              </form>
            )}

            {!isOwner && user && (
              <button
                className={`btn btn-sm w-100 mt-2 ${seguindo ? 'btn-secondary' : 'btn-success'}`}
                onClick={handleSeguir}
              >
                {seguindo ? 'Deixar de Seguir' : 'Seguir'}
              </button>
            )}

            {!isOwner && !user && (
              <Link to="/login" className="btn btn-success btn-sm w-100 mt-2">
                Login para seguir
              </Link>
            )}
          </div>
        </div>

        {/* Publicações */}
        <div className="col-md-9">
          <h2
            className="text-white text-center mb-4 py-2"
            style={{ backgroundColor: '#0d6efd', borderRadius: '5px' }}
          >
            Publicações
          </h2>
          {topicos.length === 0 ? (
            <div className="text-center p-5 border rounded bg-white">
              <h5>Este perfil ainda não publicou tópicos.</h5>
            </div>
          ) : (
            topicos.map((t) => (
              <div key={t.id} className="card p-4 mb-4 position-relative">
                {isOwner && (
                  <button
                    className="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 mt-2 me-2"
                    onClick={() => handleDeleteTopico(t.id)}
                    title="Excluir tópico"
                  >
                    ✕
                  </button>
                )}
                <div className="d-flex align-items-center gap-2 mb-2">
                  <img
                    src={t.autor_avatar}
                    alt="Avatar"
                    className="rounded-circle"
                    style={{ width: 40, height: 40, objectFit: 'cover' }}
                  />
                  <Link to={`/topico/${t.id}`}><h5 className="mb-0">{t.titulo}</h5></Link>
                </div>
                <p style={{ whiteSpace: 'pre-wrap' }}>{t.conteudo}</p>
                {t.midia && <img src={t.midia} className="img-fluid mb-2" alt="" />}
                <div className="d-flex justify-content-between text-muted small">
                  <span>{db.contarCurtidas(t.id)} Curtidas</span>
                  <span>{t.contagem_respostas} Comentários</span>
                  <span>{formatData(t.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
