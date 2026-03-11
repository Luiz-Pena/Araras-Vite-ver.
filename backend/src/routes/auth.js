// src/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/connection.js';

const router = Router();

// POST /api/auth/cadastro
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha, senha2 } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Campos obrigatórios.' });
  if (senha !== senha2)          return res.status(400).json({ error: 'As senhas não coincidem.' });

  try {
    const [rows] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) return res.status(409).json({ error: 'E-mail já está em uso.' });

    const hash = await bcrypt.hash(senha, 10);
    const [result] = await db.query('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, hash]);
    const userId = result.insertId;

    await db.query('INSERT INTO perfis (user_id, nome) VALUES (?, ?)', [userId, nome]);

    req.session.userId = userId;
    res.json({ id: userId, nome });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    console.log('User found:', rows[0]);

    if (rows.length === 0) return res.status(401).json({ error: 'Usuário não encontrado.' });

    const user = rows[0];
    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(401).json({ error: 'Senha incorreta.' });

    req.session.userId = user.id;
    const [[perfil]] = await db.query('SELECT nome, avatar, role, banned_until FROM perfis WHERE user_id = ?', [user.id]);
    res.json({ id: user.id, nome: perfil?.nome, avatar: perfil?.avatar, role: perfil?.role, banned_until: perfil?.banned_until });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  if (!req.session?.userId) return res.json(null);
  const [[perfil]] = await db.query(
    'SELECT p.user_id AS id, p.nome, p.avatar, p.role, p.banned_until FROM perfis p WHERE p.user_id = ?',
    [req.session.userId]
  );
  res.json(perfil ?? null);
});

export default router;
