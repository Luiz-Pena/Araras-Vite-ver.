import { Link } from 'react-router-dom'
import { db } from '../db'

export default function Sidebar() {
  const eventos = db.getEventos().slice(0, 3)
  const categorias = db.getCategorias().map((c) => ({
    ...c,
    contagem: db.getTopicos().filter((t) => t.categoria_id === c.id).length,
  })).sort((a, b) => b.contagem - a.contagem).slice(0, 5)

  const formatData = (str) =>
    new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <>
      {/* Eventos recentes */}
      <div className="caixa-info">
        <h4 className="caixa-info-titulo">Próximos Eventos</h4>
        {eventos.length === 0 ? (
          <p className="text-muted small">Nenhum evento.</p>
        ) : (
          <div className="lista-eventos">
            {eventos.map((e) => (
              <div key={e.id} className="mb-2">
                <strong>{e.nome}</strong>
                <span>{formatData(e.data_evento)}</span>
                {e.local && <span className="d-block text-muted" style={{ fontSize: '0.8rem' }}>{e.local}</span>}
              </div>
            ))}
            <Link to="/eventos" className="small">Ver todos →</Link>
          </div>
        )}
      </div>

      {/* Categorias */}
      <div className="caixa-info">
        <h4 className="caixa-info-titulo">Categorias</h4>
        <ul className="caixa-info-lista">
          {categorias.map((c) => (
            <li key={c.id}>
              <Link to={`/categorias?curso=${encodeURIComponent(c.nome)}`}>
                {c.nome}
                <span className="contador">{c.contagem}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
