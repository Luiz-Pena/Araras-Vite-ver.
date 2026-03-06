// src/routes/perfis.js
import { Router } from 'express';
import db from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/perfis/:id
router.get('/:id', async (req, res) => {
  const [[perfil]] = await db.query(`
    SELECT p.user_id AS id, p.nome, p.bio, p.avatar, p.created_at, p.role,
      (SELECT COUNT(*) FROM seguir WHERE seguindo_id = p.user_id) AS seguidores,
      (SELECT COUNT(*) FROM seguir WHERE seguidor_id = p.user_id) AS seguindo
    FROM perfis p WHERE p.user_id = ?
  `, [req.params.id]);
  if (!perfil) return res.status(404).json({ error: 'Perfil não encontrado.' });

  const [topicos] = await db.query(`
    SELECT t.id, t.titulo, t.conteudo, t.created_at, t.midia,
           p.avatar AS autor_avatar, p.nome AS autor_nome, p.role,
           (SELECT COUNT(*) FROM curtidas_topicos WHERE topico_id = t.id) AS curtidas,
           (SELECT COUNT(*) FROM respostas          WHERE topico_id = t.id) AS comentarios
    FROM topicos t
    LEFT JOIN perfis p ON t.user_id = p.user_id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
  `, [req.params.id]);

  // Se usuário logado, verifica se segue
  let jaSegue = false;
  if (req.session?.userId && req.session.userId !== Number(req.params.id)) {
    const [[s]] = await db.query(
      'SELECT 1 FROM seguir WHERE seguidor_id = ? AND seguindo_id = ?',
      [req.session.userId, req.params.id]
    );
    jaSegue = !!s;
  }

  res.json({ perfil, topicos, jaSegue });
});

// PUT /api/perfis  — editar perfil do usuário logado
router.put('/', requireAuth, async (req, res) => {
  const { nome, bio, avatar } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome é obrigatório.' });

  await db.query(
    'UPDATE perfis SET nome = ?, bio = ?, avatar = ? WHERE user_id = ?',
    [nome, bio || null, avatar || null, req.session.userId]
  );
  res.json({ ok: true });
});

router.put('/:id/ban', requireAuth, async (req, res) => {
  const { id } = req.params;
  const [[usuario]] = await db.query('SELECT role FROM perfis WHERE user_id = ?', [id]);
  if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });
  if (usuario.role === 'admin') return res.status(403).json({ error: 'Não pode banir outro admin.' });

  await db.query('UPDATE perfis SET banned_until = datetime("now", "+7 days") WHERE user_id = ?', [id]);
  res.json({ ok: true });
});

// DELETE /api/perfis  — excluir conta do usuário logado
router.delete('/', requireAuth, async (req, res) => {
  const uid = req.session.userId;
  const conn = await db.getConnection();
  await conn.beginTransaction();
  try {
    await conn.query('DELETE FROM respostas  WHERE user_id = ?',    [uid]);
    await conn.query('DELETE FROM topicos    WHERE user_id = ?',    [uid]);
    await conn.query('DELETE FROM seguir     WHERE seguindo_id = ?', [uid]);
    await conn.query('DELETE FROM seguir     WHERE seguidor_id = ?', [uid]);
    await conn.query('DELETE FROM perfis     WHERE user_id = ?',    [uid]);
    await conn.query('DELETE FROM usuarios   WHERE id = ?',         [uid]);
    await conn.commit();
    req.session.destroy(() => res.json({ ok: true }));
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: 'Erro ao excluir conta.' });
  } finally {
    conn.release();
  }
});

// POST /api/perfis/:id/seguir
router.post('/:id/seguir', requireAuth, async (req, res) => {
  const { acao } = req.body; // 'seguir' | 'deixar_de_seguir'
  const seguindoId = Number(req.params.id);
  if (req.session.userId === seguindoId) return res.status(400).json({ error: 'Não pode seguir a si mesmo.' });

  if (acao === 'seguir') {
    await db.query('INSERT OR IGNORE INTO seguir (seguidor_id, seguindo_id) VALUES (?, ?)', [req.session.userId, seguindoId]);
  } else {
    await db.query('DELETE FROM seguir WHERE seguidor_id = ? AND seguindo_id = ?', [req.session.userId, seguindoId]);
  }
  res.json({ jaSegue: acao === 'seguir' });
});


export default router;


