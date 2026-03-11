import bcrypt from 'bcryptjs';
import { initDB } from './connection.js';
import db from './connection.js';

console.log('🌱 Iniciando seed...\n');
initDB();

// ── Helpers ──────────────────────────────────────────────────────────────────
const run = (sql, params = []) => db.query(sql, params);

async function inserir(tabela, dados) {
  const colunas = Object.keys(dados).join(', ');
  const placeholders = Object.keys(dados).map(() => '?').join(', ');
  const valores = Object.values(dados);
  const [res] = await run(
    `INSERT OR IGNORE INTO ${tabela} (${colunas}) VALUES (${placeholders})`,
    valores
  );
  return res.insertId;
}

async function buscarId(tabela, campo, valor) {
  const [[row]] = await run(`SELECT id FROM ${tabela} WHERE ${campo} = ?`, [valor]);
  return row?.id ?? null;
}

// ── Usuários ─────────────────────────────────────────────────────────────────
const usuarios = [
  { nome: 'Ana Beatriz',    email: 'ana@ufu.br',     senha: '123456',  role: 'adm' },
  { nome: 'Carlos Eduardo', email: 'carlos@ufu.br',  senha: '123456',  role: 'user' },
  { nome: 'Fernanda Lima',  email: 'fernanda@ufu.br', senha: '123456',  role: 'user' },
  { nome: 'Rafael Souza',   email: 'rafael@ufu.br',  senha: '123456',  role: 'user' },
  { nome: 'Mariana Costa',  email: 'mariana@ufu.br', senha: '123456',  role: 'user' },
];

const avatares = [
  'https://i.pravatar.cc/150?img=47',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=32',
  'https://i.pravatar.cc/150?img=18',
  'https://i.pravatar.cc/150?img=25',
];

const bios = [
  'Estudante de Sistemas de Informação. Apaixonada por UX e front-end.',
  'Estudante de Agronomia. Foco em agricultura de precisão.',
  'Cursando Engenharia Florestal. Interessada em manejo e conservação.',
  'Estudante de Geologia. Explorando solos e minerais de MG.',
  'Engenharia de Agrimensura. Entusiasta de mapeamento via drones.',
];

const userIds = [];
for (let i = 0; i < usuarios.length; i++) {
  const { nome, email, senha, role } = usuarios[i];
  const hash = await bcrypt.hash(senha, 10);
  const id = await inserir('usuarios', { email, senha: hash });
  const uid = id || await buscarId('usuarios', 'email', email);
  userIds.push(uid);
  await inserir('perfis', {
    user_id: uid,
    nome,
    bio: bios[i],
    avatar: avatares[i],
    role,
  });
}

// ── Categorias ────────────────────────────────────────────────────────────────

const categorias = [
  { nome: 'Sistemas de Informação',                   
    descricao: 'Discussões sobre o curso de SI — disciplinas, projetos e dúvidas.' },
  { nome: 'Agronomia',                                
    descricao: 'Tópicos relacionados a agricultura, manejo de culturas e sustentabilidade.' },
  { nome: 'Engenharia de Agrimensura e Cartográfica', 
    descricao: 'Foco em geodésia, topografia e mapeamento.' },
  { nome: 'Geologia',                                 
    descricao: 'Tópicos sobre o estudo da Terra, minerais e o curso de Geologia.' },
  { nome: 'Engenharia Florestal',                     
    descricao: 'Discussões sobre manejo florestal, conservação e o curso de Engenharia Florestal.' },
  { nome: 'Geral',                     
    descricao: 'Assuntos gerais do campus Monte Carmelo.' },
];

const catIds = {};
for (const cat of categorias) {
  const id = await inserir('categorias', cat);
  catIds[cat.nome] = id || await buscarId('categorias', 'nome', cat.nome);
}

// ── Eventos ───────────────────────────────────────────────────────────────────
const eventos = [
  {
    nome: 'Semana da Computação 2025',
    descricao: 'Palestras, workshops e hackathon abertos a todos os cursos.',
    data_evento: '2025-05-12 08:00:00',
    local: 'Bloco 1B — Auditório Principal',
  },
  {
    nome: 'Dia de Campo - Agronomia',
    descricao: 'Demonstração prática de manejo de solos e colheita.',
    data_evento: '2025-04-15 07:30:00',
    local: 'Fazenda Experimental UFU',
  },
  {
    nome: 'Workshop de Mapeamento com Drones',
    descricao: 'Treinamento prático de fotogrametria para Agrimensura e Geologia.',
    data_evento: '2025-06-10 14:00:00',
    local: 'Campo de Futebol do Campus',
  },
];

for (const ev of eventos) {
  await inserir('eventos', ev);
}

// ── Tópicos e respostas ───────────────────────────────────────────────────────

const topicos = [
  {
    titulo: 'Dicas para a prova de Cálculo I',
    conteudo: 'Galera, alguém tem alguma dica boa para estudar Cálculo I? Tô travado em limites e derivadas. Algum material recomendado?',
    user_id: userIds[0],
    cat: 'Sistemas de Informação',
    respostas: [
      { user_id: userIds[1], conteudo: 'Recomendo muito o canal do Professor Ferreto no YouTube. Ele explica limites de um jeito bem intuitivo.' },
      { user_id: userIds[3], conteudo: 'O livro do Stewart tem muitos exercícios resolvidos. Vale a pena pegar na biblioteca.' },
      { user_id: userIds[0], conteudo: 'Valeu pessoal! Vou dar uma olhada nesses materiais.' },
    ],
  },
  {
    titulo: 'Manejo de Pragas na Soja',
    conteudo: 'Quais os defensivos biológicos mais eficazes para a lagarta-da-soja nesta safra aqui na região?',
    user_id: userIds[1],
    cat: 'Agronomia',
    respostas: [
      { user_id: userIds[4], conteudo: 'O uso de Baculovírus tem dado resultados excelentes aqui no solo de Monte Carmelo.' },
      { user_id: userIds[1], conteudo: 'Interessante! Vou pesquisar a dosagem recomendada por hectare.' },
    ],
  },
  {
    titulo: 'Identificação de Minerais em Campo',
    conteudo: 'Dúvida rápida: como diferenciar quartzo de calcita no teste do risco durante a saída de campo amanhã?',
    user_id: userIds[3],
    cat: 'Geologia',
    respostas: [
      { user_id: userIds[0], conteudo: 'Lembre-se da escala de Mohs. O quartzo risca o vidro, a calcita não.' },
      { user_id: userIds[3], conteudo: 'Boa! E a calcita reage com ácido clorídrico diluído, né?' },
    ],
  },
  {
    titulo: 'Dúvida sobre GNSS e RTK',
    conteudo: 'Qual a precisão mínima aceitável para um levantamento planialtimétrico usando base e rover aqui no campus?',
    user_id: userIds[4],
    cat: 'Engenharia de Agrimensura e Cartográfica',
    respostas: [
      { user_id: userIds[0], conteudo: 'Trabalhando com RTK, você deve conseguir algo em torno de 2 a 5 cm se o sinal estiver bom.' },
    ],
  },
  {
    titulo: 'Melhores espécies para Reflorestamento Local',
    conteudo: 'Estou montando um projeto de recuperação de APP. Quais espécies nativas do Cerrado crescem melhor no solo de Monte Carmelo?',
    user_id: userIds[2],
    cat: 'Engenharia Florestal',
    respostas: [
      { user_id: userIds[1], conteudo: 'Ipê-amarelo e Aroeira-pimenteira se adaptam muito bem ao clima daqui.' },
    ],
  },
  {
    titulo: 'Horários do Ônibus Intercampi',
    conteudo: 'Alguém tem a tabela atualizada do ônibus que vai para Uberlândia? Preciso ir na Reitoria amanhã.',
    user_id: userIds[4],
    cat: 'Geral',
    respostas: [
      { user_id: userIds[2], conteudo: 'A tabela costuma ficar colada no mural do Bloco 1B, perto da portaria.' },
    ],
  },
];

for (const t of topicos) {
  const catId = catIds[t.cat];
  
  const [res] = await run(
    'INSERT OR IGNORE INTO topicos (titulo, conteudo, user_id, categoria_id) VALUES (?, ?, ?, ?)',
    [t.titulo, t.conteudo, t.user_id, catId]
  );

  // Recupera o ID do tópico criado ou existente
  const tid = res.insertId || (await buscarId('topicos', 'titulo', t.titulo));

  if (tid) {
    for (const r of t.respostas) {
      await inserir('respostas', {
        conteudo: r.conteudo,
        user_id: r.user_id,
        topico_id: tid,
      });
    }
  }
}

// ── Curtidas ──────────────────────────────────────────────────────────────────

const [todosTopicos] = await run('SELECT id FROM topicos');
let curtidas = 0;
for (const t of todosTopicos) {
  const quantos = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...userIds].sort(() => Math.random() - 0.5).slice(0, quantos);
  for (const uid of shuffled) {
    await run(
      'INSERT OR IGNORE INTO curtidas_topicos (user_id, topico_id) VALUES (?, ?)',
      [uid, t.id]
    );
    curtidas++;
  }
}

// ── Seguindo ──────────────────────────────────────────────────────────────────

const pares = [
  [0, 1], [0, 3], [1, 0], [1, 3], [2, 0],
  [3, 0], [3, 4], [4, 1], [4, 2],
];
for (const [a, b] of pares) {
  await run(
    'INSERT OR IGNORE INTO seguir (seguidor_id, seguindo_id) VALUES (?, ?)',
    [userIds[a], userIds[b]]
  );
}

console.log('✅ Seed finalizado com sucesso!');