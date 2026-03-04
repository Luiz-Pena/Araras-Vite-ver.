import { Link } from 'react-router-dom'

export default function TopicCard({ topico }) {
  const formatData = (str) =>
    new Date(str).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <div className="cartao-topico">
      <div className="topico-autor-avatar">
        <Link to={`/perfil/${topico.user_id}`}>
          <img
            src={topico.autor_avatar || 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png'}
            alt="Avatar"
          />
        </Link>
      </div>
      <div className="topico-detalhes">
        <h3 className="topico-titulo">
          <Link to={`/topico/${topico.id}`}>{topico.titulo}</Link>
        </h3>
        <div className="topico-info">
          Iniciado por{' '}
          <Link to={`/perfil/${topico.user_id}`} className="nome-autor">
            {topico.autor_nome}
          </Link>{' '}
          em{' '}
          <Link
            to={`/categorias?curso=${encodeURIComponent(topico.categoria_nome)}`}
            className="topico-categoria"
          >
            {topico.categoria_nome}
          </Link>
          <span className="topico-estatisticas">{topico.contagem_respostas} Respostas</span>
        </div>
      </div>
      <div className="topico-ultima-postagem">
        <span>Última resposta</span>
        <span>{formatData(topico.created_at)}</span>
      </div>
    </div>
  )
}
