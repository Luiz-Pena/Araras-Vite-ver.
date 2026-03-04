// src/components/Sidebar.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Sidebar() {
  const [eventos, setEventos]     = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    api.eventos.recentes().then(setEventos).catch(console.error);
    api.categorias.listar().then(setCategorias).catch(console.error);
  }, []);

  return (
    <aside style={{ flex: 1, minWidth: 220 }}>
      {/* Eventos */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title border-bottom pb-2">Eventos da Faculdade</h6>
          <ul className="list-unstyled mb-0">
            {eventos.length === 0 && <li className="text-muted small">Nenhum evento.</li>}
            {eventos.map((e, i) => (
              <li key={i} className="mb-2">
                <strong className="d-block">{e.nome}</strong>
                <small className="text-muted">{e.data_formatada}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Categorias */}
      <div className="card">
        <div className="card-body">
          <h6 className="card-title border-bottom pb-2">Categorias</h6>
          <ul className="list-unstyled mb-0">
            {categorias.slice(0, 5).map((c) => (
              <li key={c.id} className="mb-1 d-flex justify-content-between">
                <Link to={`/categorias?curso=${encodeURIComponent(c.nome)}`} className="text-dark fw-500">
                  {c.nome}
                </Link>
                <span className="badge bg-light text-muted">{c.contagem}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
