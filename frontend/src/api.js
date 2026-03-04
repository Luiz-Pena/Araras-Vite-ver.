// src/api.js
// Camada de acesso à API — todos os componentes usam este módulo,
// nunca fazem fetch() diretamente.

const BASE = '/api';

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro desconhecido');
  }
  return res.json();
}

// Auth
export const api = {
  auth: {
    me:       ()           => req('/auth/me'),
    login:    (data)       => req('/auth/login',   { method: 'POST', body: data }),
    cadastro: (data)       => req('/auth/cadastro', { method: 'POST', body: data }),
    logout:   ()           => req('/auth/logout',  { method: 'POST' }),
  },
  topicos: {
    listar:    ()          => req('/topicos'),
    buscar:    (id)        => req(`/topicos/${id}`),
    criar:     (data)      => req('/topicos',       { method: 'POST',   body: data }),
    deletar:   (id)        => req(`/topicos/${id}`, { method: 'DELETE' }),
    curtir:    (id, acao)  => req(`/topicos/${id}/curtir`, { method: 'POST', body: { acao } }),
    comentar:  (id, data)  => req(`/topicos/${id}/comentarios`, { method: 'POST', body: data }),
    deletarComentario: (tid, cid) =>
      req(`/topicos/${tid}/comentarios/${cid}`, { method: 'DELETE' }),
  },
  perfis: {
    buscar:  (id)    => req(`/perfis/${id}`),
    editar:  (data)  => req('/perfis',        { method: 'PUT',    body: data }),
    deletar: ()      => req('/perfis',        { method: 'DELETE' }),
    seguir:  (id, acao) => req(`/perfis/${id}/seguir`, { method: 'POST', body: { acao } }),
  },
  categorias: {
    listar:        ()     => req('/categorias'),
    topicos:       (nome) => req(`/categorias/${encodeURIComponent(nome)}/topicos`),
  },
  eventos: {
    listar:   ()     => req('/eventos'),
    recentes: ()     => req('/eventos/recentes'),
    criar:    (data) => req('/eventos', { method: 'POST', body: data }),
  },
  membros: {
    listar: () => req('/membros'),
  },
};
