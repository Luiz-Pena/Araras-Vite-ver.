// src/components/NovoTopicoModal.jsx
import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

export default function NovoTopicoModal({ onCriado }) {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ titulo: '', conteudo: '', categoriaNome: '', midia: '' });
  const [erro, setErro] = useState('');
  const modalRef = useRef();

  useEffect(() => {
    api.categorias.listar().then((cs) => {
      setCategorias(cs);
      if (cs.length > 0) setForm((f) => ({ ...f, categoriaNome: cs[0].nome }));
    });
  }, []);

  const fechar = () => {
    const inst = window.bootstrap?.Modal?.getInstance(modalRef.current);
    inst?.hide();
  };

  const submit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await api.topicos.criar(form);
      fechar();
      onCriado?.();
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <div className="modal fade" id="modalNovoTopico" tabIndex="-1" ref={modalRef}>
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={submit}>
          <div className="modal-header">
            <h5 className="modal-title">Criar Novo Tópico</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body">
            {erro && <div className="alert alert-danger">{erro}</div>}
            <div className="mb-3">
              <label className="form-label">Título</label>
              <input className="form-control" required value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Categoria</label>
              <select className="form-select" required value={form.categoriaNome}
                onChange={(e) => setForm({ ...form, categoriaNome: e.target.value })}>
                {categorias.map((c) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Conteúdo</label>
              <textarea className="form-control" rows={3} required value={form.conteudo}
                onChange={(e) => setForm({ ...form, conteudo: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Mídia (URL opcional)</label>
              <input type="url" className="form-control" value={form.midia}
                onChange={(e) => setForm({ ...form, midia: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">Publicar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
