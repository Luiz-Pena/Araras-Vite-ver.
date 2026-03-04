// src/routes/eventos.js
import { Router } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/eventos
router.get('/', async (_req, res) => {
  const [rows] = await db.query(
    "SELECT id, nome, descricao, DATE_FORMAT(data_evento,'%d/%m/%Y %H:%i') AS data_formatada, local FROM eventos ORDER BY data_evento DESC"
  );
  res.json(rows);
});

// POST /api/eventos
router.post('/', async (req, res) => {
  const { nome, descricao, dataEvento, local } = req.body;
  if (!nome || !dataEvento) return res.status(400).json({ error: 'Nome e data são obrigatórios.' });

  // dataEvento esperado no formato "dd/MM/yyyy HH:mm" ou ISO
  let dataSQL;
  const partes = dataEvento.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/);
  if (partes) {
    dataSQL = `${partes[3]}-${partes[2]}-${partes[1]} ${partes[4]}:${partes[5]}:00`;
  } else {
    dataSQL = dataEvento; // aceita ISO diretamente
  }

  try {
    const [result] = await db.query(
      'INSERT INTO eventos (nome, descricao, data_evento, local) VALUES (?, ?, ?, ?)',
      [nome, descricao || null, dataSQL, local || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar evento.' });
  }
});

// GET /api/eventos/recentes  (últimos 3, para sidebar)
router.get('/recentes', async (_req, res) => {
  const [rows] = await db.query(
    "SELECT nome, DATE_FORMAT(data_evento,'%d/%m/%Y %H:%i') AS data_formatada FROM eventos ORDER BY data_evento DESC LIMIT 3"
  );
  res.json(rows);
});

// GET /api/membros
export const membrosRouter = Router();
membrosRouter.get('/', async (_req, res) => {
  const [rows] = await db.query(`
    SELECT p.user_id AS id, p.nome, p.avatar, p.created_at,
           COUNT(t.id) AS contagem_topicos
    FROM perfis p
    LEFT JOIN topicos t ON p.user_id = t.user_id
    GROUP BY p.user_id, p.nome, p.avatar, p.created_at
    ORDER BY p.created_at DESC
  `);
  res.json(rows);
});

export default router;
