// src/routes/categorias.js
import { Router } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/categorias
router.get('/', async (_req, res) => {
  const [rows] = await db.query(`
    SELECT c.id, c.nome, c.descricao,
           COUNT(t.id) AS contagem
    FROM categorias c
    LEFT JOIN topicos t ON c.id = t.categoria_id
    GROUP BY c.id, c.nome, c.descricao
    ORDER BY contagem DESC
  `);
  res.json(rows);
});

// GET /api/categorias/:nome/topicos
router.get('/:nome/topicos', async (req, res) => {
  const nome = decodeURIComponent(req.params.nome);
  const [[cat]] = await db.query('SELECT id FROM categorias WHERE nome = ?', [nome]);
  if (!cat) return res.status(404).json({ error: 'Categoria não encontrada.' });

  const [rows] = await db.query(`
    SELECT t.id, t.titulo, t.created_at, t.conteudo, t.user_id,
           p.nome AS autor_nome, p.avatar AS autor_avatar, p.role AS autor_role,
           (SELECT COUNT(*) FROM respostas WHERE topico_id = t.id) AS contagem_respostas
    FROM topicos t
    LEFT JOIN perfis p ON t.user_id = p.user_id
    WHERE t.categoria_id = ?
    ORDER BY t.created_at DESC
  `, [cat.id]);
  res.json(rows);
});

export default router;
