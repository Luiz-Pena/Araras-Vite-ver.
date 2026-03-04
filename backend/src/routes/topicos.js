// src/routes/topicos.js
import { Router } from 'express';
import db from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/topicos  — recentes (limit 20)
router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT t.id, t.titulo, t.conteudo, t.created_at, t.midia, t.user_id,
           p.nome AS autor_nome, p.avatar AS autor_avatar,
           c.nome AS categoria_nome,
           (SELECT COUNT(*) FROM respostas WHERE topico_id = t.id) AS contagem_respostas
    FROM topicos t
    LEFT JOIN perfis p    ON t.user_id      = p.user_id
    LEFT JOIN categorias c ON t.categoria_id = c.id
    ORDER BY t.created_at DESC
    LIMIT 20
  `);
  res.json(rows);
});

// GET /api/topicos/:id — detalhe com comentários
router.get('/:id', async (req, res) => {
  const [[topico]] = await db.query(`
    SELECT t.id, t.titulo, t.conteudo, t.midia, t.created_at, t.user_id,
           p.nome AS autor_nome, p.avatar AS autor_avatar,
           (SELECT COUNT(*) FROM curtidas_topicos WHERE topico_id = t.id) AS curtidas
    FROM topicos t
    LEFT JOIN perfis p ON t.user_id = p.user_id
    WHERE t.id = ?
  `, [req.params.id]);

  if (!topico) return res.status(404).json({ error: 'Tópico não encontrado.' });

  const [comentarios] = await db.query(`
    SELECT r.id, r.conteudo, r.created_at, r.user_id, r.midia,
           p.nome AS autor_nome, p.avatar AS autor_avatar
    FROM respostas r
    LEFT JOIN perfis p ON r.user_id = p.user_id
    WHERE r.topico_id = ?
    ORDER BY r.created_at ASC
  `, [req.params.id]);

  // Se usuário logado, verifica se curtiu
  let jaCurtiu = false;
  if (req.session?.userId) {
    const [[c]] = await db.query(
      'SELECT 1 FROM curtidas_topicos WHERE user_id = ? AND topico_id = ?',
      [req.session.userId, req.params.id]
    );
    jaCurtiu = !!c;
  }

  res.json({ topico, comentarios, jaCurtiu });
});

// POST /api/topicos
router.post('/', requireAuth, async (req, res) => {
  const { titulo, conteudo, categoriaNome, midia } = req.body;
  if (!titulo || !conteudo || !categoriaNome)
    return res.status(400).json({ error: 'Campos obrigatórios.' });

  const [[cat]] = await db.query('SELECT id FROM categorias WHERE nome = ?', [categoriaNome]);
  if (!cat) return res.status(400).json({ error: 'Categoria não encontrada.' });

  const [result] = await db.query(
    'INSERT INTO topicos (titulo, conteudo, user_id, categoria_id, midia) VALUES (?, ?, ?, ?, ?)',
    [titulo, conteudo, req.session.userId, cat.id, midia || null]
  );
  res.status(201).json({ id: result.insertId });
});

// DELETE /api/topicos/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const [[t]] = await db.query('SELECT user_id FROM topicos WHERE id = ?', [req.params.id]);
  if (!t) return res.status(404).json({ error: 'Não encontrado.' });
  if (t.user_id !== req.session.userId) return res.status(403).json({ error: 'Sem permissão.' });

  const conn = await db.getConnection();
  await conn.beginTransaction();
  try {
    await conn.query('DELETE FROM curtidas_topicos WHERE topico_id = ?', [req.params.id]);
    await conn.query('DELETE FROM respostas         WHERE topico_id = ?', [req.params.id]);
    await conn.query('DELETE FROM topicos           WHERE id = ?',        [req.params.id]);
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: 'Erro ao deletar.' });
  } finally {
    conn.release();
  }
});

// POST /api/topicos/:id/curtir
router.post('/:id/curtir', requireAuth, async (req, res) => {
  const { acao } = req.body; // 'curtir' | 'descurtir'
  if (acao === 'curtir') {
    await db.query(
      'INSERT IGNORE INTO curtidas_topicos (user_id, topico_id) VALUES (?, ?)',
      [req.session.userId, req.params.id]
    );
  } else {
    await db.query(
      'DELETE FROM curtidas_topicos WHERE user_id = ? AND topico_id = ?',
      [req.session.userId, req.params.id]
    );
  }
  const [[{ total }]] = await db.query(
    'SELECT COUNT(*) AS total FROM curtidas_topicos WHERE topico_id = ?',
    [req.params.id]
  );
  res.json({ curtidas: total, jaCurtiu: acao === 'curtir' });
});

// POST /api/topicos/:id/comentarios
router.post('/:id/comentarios', requireAuth, async (req, res) => {
  const { conteudo, midia } = req.body;
  if (!conteudo) return res.status(400).json({ error: 'Conteúdo obrigatório.' });

  const [result] = await db.query(
    'INSERT INTO respostas (conteudo, user_id, topico_id, midia) VALUES (?, ?, ?, ?)',
    [conteudo, req.session.userId, req.params.id, midia || null]
  );
  res.status(201).json({ id: result.insertId });
});

// DELETE /api/topicos/:id/comentarios/:cid
router.delete('/:id/comentarios/:cid', requireAuth, async (req, res) => {
  const [[r]] = await db.query('SELECT user_id FROM respostas WHERE id = ?', [req.params.cid]);
  if (!r) return res.status(404).json({ error: 'Não encontrado.' });
  if (r.user_id !== req.session.userId) return res.status(403).json({ error: 'Sem permissão.' });

  await db.query('DELETE FROM respostas WHERE id = ?', [req.params.cid]);
  res.json({ ok: true });
});

export default router;
