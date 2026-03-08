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

router.post('/', async (req, res) => {
  const { nome, descricao } = req.body;
  if (!nome) return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });

  try {
    const [result] = await db.query('INSERT INTO categorias (nome, descricao) VALUES (?, ?)', [nome, descricao]);
    res.status(201).json({ id: result.insertId, nome, descricao });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Já existe uma categoria com esse nome.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM categorias WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }
    const [respostas] = await db.query('SELECT id FROM topicos WHERE categoria_id = ?', [id]);
    const topicoIds = respostas.map(r => r.id);
    if (topicoIds.length > 0) {
      await db.query('DELETE FROM respostas WHERE topico_id IN (?)', [topicoIds]);
      await db.query('DELETE FROM topicos WHERE id IN (?)', [topicoIds]);
    }
    res.json({ message: 'Categoria deletada com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar categoria.' });
  }
});

export default router;
