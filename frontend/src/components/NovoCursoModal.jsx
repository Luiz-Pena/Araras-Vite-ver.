import React, { useState } from 'react';
import { api } from '../api';

export default function NovoCursoModal({ onClose, onCriado }) {
  const [dados, setDados] = useState({ nome: '', descricao: '' });
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.categorias.criar(dados);
      onCriado(); // Recarrega a lista lá no pai
      onClose();  // Fecha o modal
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Novo Curso</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <input 
                className="form-control mb-2"
                placeholder="Nome do curso"
                value={dados.nome}
                onChange={e => setDados({...dados, nome: e.target.value})}
                required
              />
              <textarea 
                className="form-control"
                placeholder="Descrição"
                value={dados.descricao}
                onChange={e => setDados({...dados, descricao: e.target.value})}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-success" disabled={enviando}>
                {enviando ? 'Salvando...' : 'Criar Curso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}