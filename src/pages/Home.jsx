import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopicCard from '../components/TopicCard'
import NovoTopicoModal from '../components/NovoTopicoModal'
import { db } from '../db'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Home() {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [topicos, setTopicos] = useState(() => db.getTopicosRecentes())

  const refresh = () => setTopicos(db.getTopicosRecentes())

  return (
    <div className="container conteudo-pagina">
      <main className="conteudo-principal">
        <div className="topicos-cabecalho">
          <h2>Tópicos Recentes</h2>
          {user ? (
            <button className="botao botao-primario btn" onClick={() => setShowModal(true)}>
              Criar Novo Tópico
            </button>
          ) : (
            <Link to="/login" className="botao botao-primario btn">
              Login para postar
            </Link>
          )}
        </div>

        <div className="lista-topicos">
          {topicos.length === 0 ? (
            <p>Nenhum tópico encontrado.</p>
          ) : (
            topicos.map((t) => <TopicCard key={t.id} topico={t} />)
          )}
        </div>
      </main>

      <aside className="barra-lateral">
        <Sidebar />
      </aside>

      <NovoTopicoModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCriado={refresh}
      />
    </div>
  )
}
