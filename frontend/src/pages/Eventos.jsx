// src/pages/Eventos.jsx
import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

export default function Eventos() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [form, setForm] = useState({ nome: '', descricao: '', dataEvento: '', local: '' });
  const [erro, setErro] = useState('');
  const modalRef = useRef();

  const carregar = () => api.eventos.listar().then(setEventos);
  useEffect(() => { carregar(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await api.eventos.criar(form);
      window.bootstrap?.Modal?.getInstance(modalRef.current)?.hide();
      setForm({ nome: '', descricao: '', dataEvento: '', local: '' });
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  };

  const deletarEvento = async (id) => {
    if (!confirm('Deseja realmente excluir este evento?')) return;
    try {
      await api.eventos.deletar(id);
      carregar();
    } catch (err) {
      alert('Erro ao deletar evento: ' + err.message);
    }
  }

  return (
    <div className="container py-4 d-flex gap-4">
      <main style={{ flex: 3 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Próximos Eventos</h4>
          {user?.role === 'adm' && (
            <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalEvento">
              Criar Evento
            </button>
          )}
        </div>
        <div className="card">
          <ul className="list-group list-group-flush">
            {eventos.length === 0 && (
              <li className="list-group-item text-muted">Nenhum evento cadastrado.</li>
            )}
            {eventos.map((e) => (
              <li key={e.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center position-relative">
                  <strong>{e.nome}</strong>
                  <div className="gap-2 d-flex align-items-center">
                    <span className="text-muted small">{e.data_formatada}</span>
                    {user?.role === 'adm' && (
                      <button 
                        className="btn btn-sm btn-outline-danger border-0 position-relative top-0 end-0" 
                        onClick={() => deletarEvento(e.id)}>
                          ✕
                      </button>
                    )}
                  </div>

                </div>
                <p className="mb-0 small">{e.descricao}</p>
                {e.local && <small className="text-muted">Local: {e.local}</small>}
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Sidebar />

      {/* Modal */}
      <div className="modal fade" id="modalEvento" tabIndex="-1" ref={modalRef}>
        <div className="modal-dialog">
          <form className="modal-content" onSubmit={submit}>
            <div className="modal-header">
              <h5 className="modal-title">Criar Novo Evento</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              {erro && <div className="alert alert-danger">{erro}</div>}
              <div className="mb-3">
                <label className="form-label">Título</label>
                <input className="form-control" required value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Data e Hora (dd/mm/aaaa hh:mm)</label>
                <input className="form-control" placeholder="Ex: 15/06/2025 19:00" required value={form.dataEvento}
                  onChange={(e) => setForm({ ...form, dataEvento: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Descrição</label>
                <textarea className="form-control" rows={3} required value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Local (opcional)</label>
                <input className="form-control" value={form.local}
                  onChange={(e) => setForm({ ...form, local: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">Publicar Evento</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
