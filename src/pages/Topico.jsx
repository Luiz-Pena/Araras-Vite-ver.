import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { db } from '../db'
import { useAuth } from '../context/AuthContext'

function formatData(str) {
  return new Date(str).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Topico() {
  const { id } = useParams()
  const topicoId = Number(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [topico, setTopico] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [curtidas, setCurtidas] = useState(0)
  const [jaCurtiu, setJaCurtiu] = useState(false)
  const [novoComent, setNovoComent] = useState('')
  const [midiaComent, setMidiaComent] = useState('')

  const load = () => {
    const t = db.getTopicoComAutor(topicoId)
    setTopico(t)
    const resps = db.getRespostasByTopico(topicoId).map((r) => {
      const p = db.getPerfil(r.user_id)
      return {
        ...r,
        autor_nome: p?.nome || 'Usuário Removido',
        autor_avatar: p?.avatar || 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png',
      }
    })
    setComentarios(resps)
    setCurtidas(db.contarCurtidas(topicoId))
    if (user) setJaCurtiu(db.jaCurtiu(user.id, topicoId))
  }

  useEffect(() => { load() }, [topicoId])

  if (!topico) return <div className="container mt-5"><p>Tópico não encontrado.</p></div>

  const handleCurtir = () => {
    if (!user) return navigate('/login')
    if (jaCurtiu) { db.descurtir(user.id, topicoId) }
    else { db.curtir(user.id, topicoId) }
    setCurtidas(db.contarCurtidas(topicoId))
    setJaCurtiu(!jaCurtiu)
  }

  const handleComentario = (e) => {
    e.preventDefault()
    db.addResposta({ conteudo: novoComent, user_id: user.id, topico_id: topicoId, midia: midiaComent })
    setNovoComent('')
    setMidiaComent('')
    load()
  }

  const handleDeleteComentario = (cId) => {
    if (!confirm('Excluir este comentário?')) return
    db.deleteResposta(cId, user.id)
    load()
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '900px' }}>
      <Link to="/">← Voltar para o Início</Link>

      <div className="card p-4 mt-3">
        <div className="d-flex align-items-center mb-3">
          <Link to={`/perfil/${topico.user_id}`}>
            <img
              src={topico.autor_avatar}
              alt="Avatar"
              className="rounded-circle me-3"
              style={{ width: 60, height: 60, objectFit: 'cover' }}
            />
          </Link>
          <div>
            <h1 className="card-title mb-0">{topico.titulo}</h1>
            <small className="text-muted">
              Por{' '}
              <Link to={`/perfil/${topico.user_id}`}>{topico.autor_nome}</Link>, em{' '}
              {formatData(topico.created_at)}
            </small>
          </div>
        </div>

        <hr />
        <p className="card-text fs-5" style={{ whiteSpace: 'pre-wrap' }}>{topico.conteudo}</p>
        {topico.midia && <img src={topico.midia} className="img-fluid mt-3" alt="Mídia" />}
      </div>

      {/* Curtidas */}
      <div className="d-flex align-items-center justify-content-between mt-4 mb-2">
        <span className="text-muted">{curtidas} Curtidas</span>
        <button
          onClick={handleCurtir}
          className={`btn ${jaCurtiu ? 'btn-danger' : 'btn-primary'}`}
        >
          {jaCurtiu ? 'Descurtir' : 'Curtir'}
        </button>
      </div>
      <hr />

      {/* Comentários */}
      <h3>Comentários ({comentarios.length})</h3>
      <hr />

      {comentarios.length === 0 && <p>Nenhum comentário ainda.</p>}
      {comentarios.map((c) => (
        <div key={c.id} className="d-flex mb-3">
          <img
            src={c.autor_avatar}
            alt="Avatar"
            className="rounded-circle me-3"
            style={{ width: 40, height: 40, objectFit: 'cover', flexShrink: 0 }}
          />
          <div className="card p-3 flex-grow-1 position-relative">
            {user && user.id === c.user_id && (
              <button
                className="btn btn-sm btn-outline-danger border-0 p-0 position-absolute top-0 end-0 mt-2 me-2"
                onClick={() => handleDeleteComentario(c.id)}
                title="Excluir"
              >
                ✕
              </button>
            )}
            <strong>{c.autor_nome}</strong>
            <p className="mt-1 mb-1" style={{ whiteSpace: 'pre-wrap' }}>{c.conteudo}</p>
            {c.midia && <img src={c.midia} className="img-fluid" alt="" />}
            <small className="text-muted">{formatData(c.created_at)}</small>
          </div>
        </div>
      ))}

      {/* Formulário novo comentário */}
      {user ? (
        <div className="card p-4 mt-4">
          <h4>Adicionar Comentário</h4>
          <form onSubmit={handleComentario}>
            <div className="mb-3">
              <textarea
                className="form-control"
                rows={3}
                placeholder="Escreva seu comentário..."
                value={novoComent}
                onChange={(e) => setNovoComent(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="url"
                className="form-control"
                placeholder="Opcional: URL de imagem/vídeo"
                value={midiaComent}
                onChange={(e) => setMidiaComent(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Publicar Comentário</button>
          </form>
        </div>
      ) : (
        <div className="alert alert-info mt-4">
          <Link to="/login">Faça login</Link> para adicionar um comentário.
        </div>
      )}
    </div>
  )
}
