import { Link } from 'react-router-dom'
import { db } from '../db'
import Sidebar from '../components/Sidebar'

export function Membros() {
  const membros = db.getMembros().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div className="container conteudo-pagina">
      <main className="conteudo-principal">
        <div className="topicos-cabecalho">
          <h2>Membros do Fórum</h2>
        </div>
        {membros.map((m) => (
          <div key={m.user_id} className="cartao-topico">
            <div className="topico-autor-avatar">
              <Link to={`/perfil/${m.user_id}`}>
                <img src={m.avatar || 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png'} alt="Avatar" />
              </Link>
            </div>
            <div className="topico-detalhes">
              <h3 className="topico-titulo">
                <Link to={`/perfil/${m.user_id}`}>{m.nome}</Link>
              </h3>
              <div className="topico-info">
                <span>Membro desde: {new Date(m.created_at).toLocaleDateString('pt-BR')}</span>
                <span className="topico-estatisticas">{m.contagem_topicos} Tópicos</span>
              </div>
            </div>
          </div>
        ))}
        {membros.length === 0 && <p>Nenhum membro encontrado.</p>}
      </main>
      <aside className="barra-lateral"><Sidebar /></aside>
    </div>
  )
}

export function Regras() {
  const regras = [
    { n: 1, titulo: 'Respeite os outros membros.', desc: 'Comentários ofensivos, discriminatórios ou de cunho sexual não serão tolerados.' },
    { n: 2, titulo: 'Mantenha a organização.', desc: 'Publique tópicos na categoria correta e evite spam.' },
    { n: 3, titulo: 'Evite postagens duplicadas.', desc: 'Use a ferramenta de busca para verificar se sua pergunta já foi respondida.' },
    { n: 4, titulo: 'Não compartilhe informações pessoais.', desc: 'Mantenha sua privacidade e a dos outros membros.' },
    { n: 5, titulo: 'Proibido plágio.', desc: 'Dê os devidos créditos a fontes externas quando necessário.' },
  ]

  return (
    <div className="container conteudo-pagina">
      <main className="conteudo-principal">
        <div className="caixa-info">
          <h2 className="caixa-info-titulo">Regras do Fórum</h2>
          <ul className="caixa-info-lista">
            {regras.map((r) => (
              <li key={r.n}>
                <div>
                  <strong>{r.n}. {r.titulo}</strong>
                  <span style={{ display: 'block', fontWeight: 'normal', marginTop: '4px' }}>{r.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <aside className="barra-lateral"><Sidebar /></aside>
    </div>
  )
}
