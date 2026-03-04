import { useState, useEffect } from 'react'
import { db } from '../db'
import { useAuth } from '../context/AuthContext'

export default function NovoTopicoModal({ show, onClose, onCriado, categoriaInicial }) {
  const { user } = useAuth()
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [midia, setMidia] = useState('')
  const categorias = db.getCategorias()

  useEffect(() => {
    if (categoriaInicial) {
      const cat = categorias.find((c) => c.nome === categoriaInicial)
      if (cat) setCategoriaId(cat.id)
    }
  }, [categoriaInicial])

  if (!show) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!user) return
    db.addTopico({
      titulo,
      conteudo,
      user_id: user.id,
      categoria_id: Number(categoriaId),
      midia,
    })
    setTitulo('')
    setConteudo('')
    setMidia('')
    onCriado && onCriado()
    onClose()
  }

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Criar Novo Tópico</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Título</label>
              <input
                className="form-control"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Categoria</label>
              <select
                className="form-select"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Conteúdo</label>
              <textarea
                className="form-control"
                rows={3}
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mídia (URL)</label>
              <input
                type="url"
                className="form-control"
                placeholder="Opcional: URL de imagem/vídeo"
                value={midia}
                onChange={(e) => setMidia(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Publicar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
