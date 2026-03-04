// src/pages/Regras.jsx
import Sidebar from '../components/Sidebar';

const regras = [
  { num: 1, titulo: 'Respeite os outros membros.', desc: 'Comentários ofensivos, discriminatórios ou de cunho sexual não serão tolerados.' },
  { num: 2, titulo: 'Mantenha a organização.',     desc: 'Publique tópicos na categoria correta e evite spam.' },
  { num: 3, titulo: 'Evite postagens duplicadas.', desc: 'Use a ferramenta de busca para verificar se sua pergunta já foi respondida.' },
  { num: 4, titulo: 'Não compartilhe informações pessoais.', desc: 'Mantenha sua privacidade e a dos outros membros.' },
  { num: 5, titulo: 'Proibido plágio.',             desc: 'Dê os devidos créditos a fontes externas quando necessário.' },
];

export default function Regras() {
  return (
    <div className="container py-4 d-flex gap-4">
      <main style={{ flex: 3 }}>
        <div className="card">
          <div className="card-body">
            <h4 className="card-title border-bottom pb-2">Regras do Fórum</h4>
            <ul className="list-unstyled">
              {regras.map((r) => (
                <li key={r.num} className="mb-3">
                  <strong>{r.num}. {r.titulo}</strong>
                  <p className="mb-0 text-muted">{r.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
