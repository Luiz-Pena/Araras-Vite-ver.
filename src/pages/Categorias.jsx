import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { db } from '../db'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import TopicCard from '../components/TopicCard'
import NovoTopicoModal from '../components/NovoTopicoModal'

export default function Categorias() {
  const [searchParams] = useSearchParams()
  const cursoSelecionado = searchParams.get('curso')
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [topicos, setTopicos] = useState([])
  const categorias = db.getCategorias()

  useEffect(() => {
    if (cursoSelecionado) {
      const cat = categorias.find((c) => c.nome === cursoSelecionado)
      if (cat) setTopicos(db.getTopicosPorCategoria(cat.id))
    }
  }, [cursoSelecionado])

  const refresh = () => {
    if (cursoSelecionado) {
      const cat = categorias.find((c) => c.nome === cursoSelecionado)
      if (cat) setTopicos(db.getTopicosPorCategoria(cat.id))
    }
  }

  return (
    <div className="container conteudo-pagina">
      <main className="conteudo-principal">
        <div className="topicos-cabecalho">
          {cursoSelecionado ? (
            <>
              <h2>Tópicos: {cursoSelecionado}</h2>
              {user && (
                <button className="botao botao-primario btn" onClick={() => setShowModal(true)}>
                  Criar Novo Tópico
                </button>
              )}
            </>
          ) : (
            <h2>Cursos UFU Monte Carmelo</h2>
          )}
        </div>

        {cursoSelecionado ? (
          <div>
            {topicos.length === 0 ? (
              <p className="text-muted">Nenhum tópico encontrado nesta categoria.</p>
            ) : (
              topicos.map((t) => <TopicCard key={t.id} topico={t} />)
            )}
          </div>
        ) : (
          <div>
            {categorias.map((c) => (
              <div key={c.id} className="caixa-info mb-3">
                <h4 className="caixa-info-titulo">
                  <Link to={`/categorias?curso=${encodeURIComponent(c.nome)}`}>{c.nome}</Link>
                </h4>
                <p className="text-muted mb-0">{c.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <aside className="barra-lateral">
        <Sidebar />
      </aside>

      <NovoTopicoModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCriado={refresh}
        categoriaInicial={cursoSelecionado}
      />
    </div>
  )
}
