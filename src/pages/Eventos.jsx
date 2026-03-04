import { useState } from 'react'
import { db } from '../db'
import Sidebar from '../components/Sidebar'

export default function Eventos() {
  const [eventos, setEventos] = useState(() => db.getEventos().sort((a, b) => new Date(b.data_evento) - new Date(a.data_evento)))
  const [showModal, setShowModal] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')
  const [local, setLocal] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    db.addEvento({ nome, descricao, data_evento: data, local })
    setEventos(db.getEventos().sort((a, b) => new Date(b.data_evento) - new Date(a.data_evento)))
    setNome(''); setDescricao(''); setData(''); setLocal('')
    setShowModal(false)
  }

  const formatData = (str) => new Date(str).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="container conteudo-pagina">
      <main className="conteudo-principal">
        <div className="topicos-cabecalho">
          <h2>Próximos Eventos</h2>
          <button className="botao botao-primario btn" onClick={() => setShowModal(true)}>
            Criar Novo Evento
          </button>
        </div>

        <div className="caixa-info">
          {eventos.length === 0 ? (
            <p>Nenhum evento cadastrado.</p>
          ) : (
            <ul className="list-group">
              {eventos.map((e) => (
                <li key={e.id} className="list-group-item">
                  <strong>{e.nome}</strong>
                  <span className="ms-2 text-muted">{formatData(e.data_evento)}</span>
                  <br />
                  <span>{e.descricao}</span>
                  {e.local && <><br /><small className="text-muted">Local: {e.local}</small></>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <aside className="barra-lateral"><Sidebar /></aside>

      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Criar Novo Evento</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Título do Evento</label>
                  <input className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Data e Hora</label>
                  <input type="datetime-local" className="form-control" value={data} onChange={(e) => setData(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descrição</label>
                  <textarea className="form-control" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Local do Evento</label>
                  <input className="form-control" value={local} onChange={(e) => setLocal(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Publicar Evento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
