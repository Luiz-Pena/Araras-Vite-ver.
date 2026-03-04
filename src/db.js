// db.js — Simulates the MySQL database in memory (localStorage-backed)
// Mirrors tables: usuarios, perfis, topicos, respostas, categorias, eventos, seguir, curtidas_topicos

function load(key, fallback) {
  try {
    const raw = localStorage.getItem('araras_' + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, data) {
  localStorage.setItem('araras_' + key, JSON.stringify(data))
}

function nextId(arr) {
  return arr.length === 0 ? 1 : Math.max(...arr.map((r) => r.id)) + 1
}

// ── Seed inicial ──────────────────────────────────────────────────────────────
function seed() {
  if (load('seeded', false)) return

  const cats = [
    { id: 1, nome: 'Ciência da Computação', descricao: 'Tópicos de CC' },
    { id: 2, nome: 'Engenharia Civil', descricao: 'Tópicos de Engenharia' },
    { id: 3, nome: 'Administração', descricao: 'Tópicos de Adm' },
    { id: 4, nome: 'Medicina', descricao: 'Tópicos de Medicina' },
    { id: 5, nome: 'Direito', descricao: 'Tópicos de Direito' },
  ]
  save('categorias', cats)

  const eventos = [
    {
      id: 1,
      nome: 'Semana Acadêmica',
      descricao: 'Palestras e workshops',
      data_evento: '2025-09-15T09:00',
      local: 'Bloco A',
    },
    {
      id: 2,
      nome: 'Feira de Profissões',
      descricao: 'Conheça os cursos da UFU',
      data_evento: '2025-10-10T14:00',
      local: 'Pátio Central',
    },
  ]
  save('eventos', eventos)

  // Demo user
  const usuarios = [{ id: 1, email: 'demo@araras.com', senha: 'demo123' }]
  save('usuarios', usuarios)

  const perfis = [
    {
      id: 1,
      user_id: 1,
      nome: 'Demo User',
      bio: 'Usuário de demonstração do Fórum Araras.',
      avatar: 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png',
      created_at: new Date().toISOString(),
    },
  ]
  save('perfis', perfis)

  const topicos = [
    {
      id: 1,
      titulo: 'Bem-vindo ao Fórum Araras!',
      conteudo:
        'Este é o fórum oficial dos estudantes da UFU Monte Carmelo. Sinta-se à vontade para criar tópicos e participar das discussões.',
      user_id: 1,
      categoria_id: 1,
      created_at: new Date().toISOString(),
      midia: '',
    },
  ]
  save('topicos', topicos)

  save('respostas', [])
  save('seguir', [])
  save('curtidas_topicos', [])
  save('seeded', true)
}

seed()

// ── API ───────────────────────────────────────────────────────────────────────
export const db = {
  // Usuarios
  getUsuarios: () => load('usuarios', []),
  addUsuario(email, senha) {
    const lista = this.getUsuarios()
    if (lista.find((u) => u.email === email)) return null
    const u = { id: nextId(lista), email, senha }
    lista.push(u)
    save('usuarios', lista)
    return u
  },
  loginUsuario(email, senha) {
    return this.getUsuarios().find((u) => u.email === email && u.senha === senha) || null
  },

  // Perfis
  getPerfis: () => load('perfis', []),
  getPerfil(user_id) {
    return this.getPerfis().find((p) => p.user_id === user_id) || null
  },
  addPerfil(user_id, nome) {
    const lista = this.getPerfis()
    const p = {
      id: nextId(lista),
      user_id,
      nome,
      bio: '',
      avatar: 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png',
      created_at: new Date().toISOString(),
    }
    lista.push(p)
    save('perfis', lista)
    return p
  },
  updatePerfil(user_id, { nome, bio, avatar }) {
    const lista = this.getPerfis()
    const idx = lista.findIndex((p) => p.user_id === user_id)
    if (idx === -1) return false
    lista[idx] = { ...lista[idx], nome, bio, avatar }
    save('perfis', lista)
    return true
  },
  deletePerfil(user_id) {
    save('perfis', this.getPerfis().filter((p) => p.user_id !== user_id))
  },

  // Categorias
  getCategorias: () => load('categorias', []),

  // Eventos
  getEventos: () => load('eventos', []),
  addEvento({ nome, descricao, data_evento, local }) {
    const lista = this.getEventos()
    const e = { id: nextId(lista), nome, descricao, data_evento, local }
    lista.push(e)
    save('eventos', lista)
    return e
  },

  // Topicos
  getTopicos: () => load('topicos', []),
  getTopico(id) {
    return this.getTopicos().find((t) => t.id === id) || null
  },
  addTopico({ titulo, conteudo, user_id, categoria_id, midia }) {
    const lista = this.getTopicos()
    const t = {
      id: nextId(lista),
      titulo,
      conteudo,
      user_id,
      categoria_id,
      created_at: new Date().toISOString(),
      midia: midia || '',
    }
    lista.push(t)
    save('topicos', lista)
    return t
  },
  deleteTopico(id, user_id) {
    const lista = this.getTopicos()
    const t = lista.find((t) => t.id === id)
    if (!t || t.user_id !== user_id) return false
    save('topicos', lista.filter((t) => t.id !== id))
    // cascade respostas e curtidas
    save('respostas', this.getRespostas().filter((r) => r.topico_id !== id))
    save('curtidas_topicos', this.getCurtidas().filter((c) => c.topico_id !== id))
    return true
  },

  // Respostas
  getRespostas: () => load('respostas', []),
  getRespostasByTopico(topico_id) {
    return this.getRespostas().filter((r) => r.topico_id === topico_id)
  },
  addResposta({ conteudo, user_id, topico_id, midia }) {
    const lista = this.getRespostas()
    const r = {
      id: nextId(lista),
      conteudo,
      user_id,
      topico_id,
      created_at: new Date().toISOString(),
      midia: midia || '',
    }
    lista.push(r)
    save('respostas', lista)
    return r
  },
  deleteResposta(id, user_id) {
    const lista = this.getRespostas()
    const r = lista.find((r) => r.id === id)
    if (!r || r.user_id !== user_id) return false
    save('respostas', lista.filter((r) => r.id !== id))
    return true
  },

  // Curtidas
  getCurtidas: () => load('curtidas_topicos', []),
  curtir(user_id, topico_id) {
    const lista = this.getCurtidas()
    if (lista.find((c) => c.user_id === user_id && c.topico_id === topico_id)) return
    lista.push({ id: nextId(lista), user_id, topico_id, created_at: new Date().toISOString() })
    save('curtidas_topicos', lista)
  },
  descurtir(user_id, topico_id) {
    save('curtidas_topicos', this.getCurtidas().filter(
      (c) => !(c.user_id === user_id && c.topico_id === topico_id)
    ))
  },
  jaCurtiu(user_id, topico_id) {
    return !!this.getCurtidas().find((c) => c.user_id === user_id && c.topico_id === topico_id)
  },
  contarCurtidas(topico_id) {
    return this.getCurtidas().filter((c) => c.topico_id === topico_id).length
  },

  // Seguir
  getSeguir: () => load('seguir', []),
  seguir(seguidor_id, seguindo_id) {
    const lista = this.getSeguir()
    if (lista.find((s) => s.seguidor_id === seguidor_id && s.seguindo_id === seguindo_id)) return
    lista.push({ id: nextId(lista), seguidor_id, seguindo_id })
    save('seguir', lista)
  },
  deixarDeSeguir(seguidor_id, seguindo_id) {
    save('seguir', this.getSeguir().filter(
      (s) => !(s.seguidor_id === seguidor_id && s.seguindo_id === seguindo_id)
    ))
  },
  jaSeguindo(seguidor_id, seguindo_id) {
    return !!this.getSeguir().find((s) => s.seguidor_id === seguidor_id && s.seguindo_id === seguindo_id)
  },
  contarSeguidores: (user_id) => load('seguir', []).filter((s) => s.seguindo_id === user_id).length,
  contarSeguindo: (user_id) => load('seguir', []).filter((s) => s.seguidor_id === user_id).length,

  // Helpers compostos
  getTopicoComAutor(id) {
    const t = this.getTopico(id)
    if (!t) return null
    const p = this.getPerfil(t.user_id)
    const cat = this.getCategorias().find((c) => c.id === t.categoria_id)
    return {
      ...t,
      autor_nome: p?.nome || 'Usuário Removido',
      autor_avatar: p?.avatar || 'https://cdn-icons-png.flaticon.com/512/3736/3736502.png',
      categoria_nome: cat?.nome || '',
      contagem_respostas: this.getRespostas().filter((r) => r.topico_id === t.id).length,
    }
  },
  getTopicosRecentes(limit = 10) {
    return this.getTopicos()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
      .map((t) => this.getTopicoComAutor(t.id))
  },
  getTopicosPorCategoria(categoria_id) {
    return this.getTopicos()
      .filter((t) => t.categoria_id === categoria_id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((t) => this.getTopicoComAutor(t.id))
  },
  getMembros() {
    return this.getPerfis().map((p) => ({
      ...p,
      contagem_topicos: this.getTopicos().filter((t) => t.user_id === p.user_id).length,
    }))
  },
  deleteUsuario(user_id) {
    // cascade
    save('respostas', this.getRespostas().filter((r) => r.user_id !== user_id))
    save('topicos', this.getTopicos().filter((t) => t.user_id !== user_id))
    save('seguir', this.getSeguir().filter((s) => s.seguidor_id !== user_id && s.seguindo_id !== user_id))
    this.deletePerfil(user_id)
    save('usuarios', this.getUsuarios().filter((u) => u.id !== user_id))
  },
}
