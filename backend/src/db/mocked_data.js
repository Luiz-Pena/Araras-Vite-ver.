// src/db/seed.js
// Popula o banco com dados de exemplo para desenvolvimento.
// Uso: node src/db/seed.js

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
console.log('👤 Criando usuários...');

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
  'Engenharia de Computação, 4º período. Fã de algoritmos e café.',
  'Cursando Administração. Gosto de gestão de projetos e inovação.',
  'Ciência da Computação. Sempre aprendendo algo novo sobre back-end.',
  'Biomedicina + tecnologia. Pesquisando sobre saúde digital.',
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

console.log(`   ✔ ${userIds.length} usuários criados\n`);

// ── Categorias ────────────────────────────────────────────────────────────────
console.log('📂 Criando categorias...');

const categorias = [
  { nome: 'Sistemas de Informação',    descricao: 'Discussões sobre o curso de SI — disciplinas, projetos e dúvidas.' },
  { nome: 'Engenharia de Computação',  descricao: 'Tópicos sobre o curso de EC — hardware, software e muito mais.' },
  { nome: 'Administração',             descricao: 'Assuntos do curso de Administração e gestão empresarial.' },
  { nome: 'Ciência da Computação',     descricao: 'Algoritmos, estruturas de dados, teoria da computação e mais.' },
  { nome: 'Geral',                     descricao: 'Assuntos gerais da faculdade — eventos, avisos e conversa.' },
];

const catIds = {};
for (const cat of categorias) {
  const id = await inserir('categorias', cat);
  catIds[cat.nome] = id || await buscarId('categorias', 'nome', cat.nome);
}
console.log(`   ✔ ${categorias.length} categorias criadas\n`);

// ── Eventos ───────────────────────────────────────────────────────────────────
console.log('📅 Criando eventos...');

const eventos = [
  {
    nome: 'Semana da Computação 2025',
    descricao: 'Palestras, workshops e hackathon abertos a todos os cursos.',
    data_evento: '2025-05-12 08:00:00',
    local: 'Bloco 1B — Auditório Principal',
  },
  {
    nome: 'Feira de Estágios UFU MC',
    descricao: 'Empresas da região apresentam oportunidades de estágio e emprego.',
    data_evento: '2025-06-03 14:00:00',
    local: 'Hall de Entrada — Campus Monte Carmelo',
  },
  {
    nome: 'Workshop de React e Node.js',
    descricao: 'Hands-on de desenvolvimento web moderno com React e Node. Vagas limitadas.',
    data_evento: '2025-04-22 19:00:00',
    local: 'Laboratório de Informática 2',
  },
];

for (const ev of eventos) {
  await inserir('eventos', ev);
}
console.log(`   ✔ ${eventos.length} eventos criados\n`);

// ── Tópicos e respostas ───────────────────────────────────────────────────────
console.log('💬 Criando tópicos e comentários...');

const topicos = [
  {
    titulo: 'Dicas para a prova de Cálculo I',
    conteudo: 'Galera, alguém tem alguma dica boa para estudar Cálculo I? Tô travado em limites e derivadas. Algum material recomendado?',
    user_id: userIds[0],
    cat: 'Sistemas de Informação',
    respostas: [
      { user_id: userIds[1], conteudo: 'Recomendo muito o canal do Professor Ferreto no YouTube. Ele explica limites de um jeito bem intuitivo.' },
      { user_id: userIds[3], conteudo: 'Além disso, o livro do Stewart tem muitos exercícios resolvidos. Vale a pena pegar na biblioteca.' },
      { user_id: userIds[0], conteudo: 'Valeu pessoal! Vou dar uma olhada nesses materiais.' },
    ],
  },
  {
    titulo: 'Grupo de estudos para Estruturas de Dados',
    conteudo: 'Quem topa formar um grupo de estudos para ED? Pensei em nos reunir às quartas à tarde no lab. Me chama no WhatsApp ou responde aqui.',
    user_id: userIds[3],
    cat: 'Ciência da Computação',
    respostas: [
      { user_id: userIds[1], conteudo: 'Eu topo! Quarta à tarde cai bem pra mim também.' },
      { user_id: userIds[4], conteudo: 'Posso participar online? Tenho aula prática antes.' },
      { user_id: userIds[3], conteudo: 'Claro Mariana, a gente pode usar o Discord para incluir quem não consegue ir presencialmente.' },
    ],
  },
  {
    titulo: 'Alguém fez estágio na área de TI em Monte Carmelo?',
    conteudo: 'Estou procurando estágio e não sei muito bem quais empresas da região contratam para a área. Alguma experiência para compartilhar?',
    user_id: userIds[2],
    cat: 'Geral',
    respostas: [
      { user_id: userIds[0], conteudo: 'Tem a feira de estágios no próximo mês, aproveita para ir lá e já deixar currículo.' },
      { user_id: userIds[3], conteudo: 'Eu estagiei em Uberlândia, mas fazia tudo remoto. Vale considerar essa opção.' },
    ],
  },
  {
    titulo: 'Qual IDE vocês usam para Java?',
    conteudo: 'Tô começando POO em Java e fiquei na dúvida: IntelliJ, Eclipse ou NetBeans? O que vocês recomendam e por quê?',
    user_id: userIds[1],
    cat: 'Engenharia de Computação',
    respostas: [
      { user_id: userIds[3], conteudo: 'IntelliJ sem dúvida. A versão Community é gratuita e o autocomplete é muito superior.' },
      { user_id: userIds[0], conteudo: 'Concordo com o Rafael. IntelliJ tem uma curva de aprendizado pequena e vale muito a pena.' },
      { user_id: userIds[2], conteudo: 'Eu uso VSCode com extensão Java. Mais leve e já conheço o editor.' },
      { user_id: userIds[1], conteudo: 'Obrigado galera! Vou instalar o IntelliJ então.' },
    ],
  },
  {
    titulo: 'Dúvida sobre TCC — tema na área de gestão e tecnologia',
    conteudo: 'Estou no último ano de Administração e quero fazer meu TCC conectando gestão com transformação digital. Alguém tem sugestões de temas ou professores orientadores?',
    user_id: userIds[2],
    cat: 'Administração',
    respostas: [
      { user_id: userIds[4], conteudo: 'Transformação digital em pequenas empresas do interior é um tema bem relevante e com poucos estudos na região.' },
      { user_id: userIds[0], conteudo: 'Outra ideia: uso de ferramentas de BI em micro e pequenas empresas. Tem bastante literatura e é bem aplicável.' },
    ],
  },
  {
    titulo: 'Restaurante universitário — horários 2025',
    conteudo: 'Alguém sabe os horários atualizados do RU para este semestre? O site da UFU tá desatualizado.',
    user_id: userIds[4],
    cat: 'Geral',
    respostas: [
      { user_id: userIds[2], conteudo: 'Pelo que vi no mural: almoço das 11h às 13h30, jantar das 17h30 às 19h. Mas confirma lá na secretaria.' },
    ],
  },
];

for (const t of topicos) {
  const catId = catIds[t.cat];
  const [res] = await run(
    'INSERT OR IGNORE INTO topicos (titulo, conteudo, user_id, categoria_id) VALUES (?, ?, ?, ?)',
    [t.titulo, t.conteudo, t.user_id, catId]
  );
  const topicoId = res.insertId || (
    await run('SELECT id FROM topicos WHERE titulo = ?', [t.titulo])
  ).then(([[rows]]) => rows[0]?.id);

  const tid = res.insertId
    ? res.insertId
    : (await run('SELECT id FROM topicos WHERE titulo = ?', [t.titulo]))[0][0]?.id;

  for (const r of t.respostas) {
    await inserir('respostas', {
      conteudo: r.conteudo,
      user_id: r.user_id,
      topico_id: tid,
    });
  }
}
console.log(`   ✔ ${topicos.length} tópicos criados com respostas\n`);

// ── Curtidas ──────────────────────────────────────────────────────────────────
console.log('❤️  Adicionando curtidas...');

const [todosTopicos] = await run('SELECT id FROM topicos');
let curtidas = 0;
for (const t of todosTopicos) {
  // Cada tópico recebe curtidas de usuários aleatórios
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
console.log(`   ✔ ${curtidas} curtidas adicionadas\n`);

// ── Seguindo ──────────────────────────────────────────────────────────────────
console.log('👥 Configurando relações de seguir...');

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
console.log(`   ✔ ${pares.length} relações criadas\n`);

// ── Resumo ────────────────────────────────────────────────────────────────────
console.log('─'.repeat(45));
console.log('✅ Seed concluído! Dados de acesso:');
console.log('─'.repeat(45));
usuarios.forEach((u) => {
  console.log(`  📧 ${u.email.padEnd(22)} 🔑 ${u.senha}`);
});
console.log('─'.repeat(45));
console.log('\nRode o servidor e acesse http://localhost:5173\n');
