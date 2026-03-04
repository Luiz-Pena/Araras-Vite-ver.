// src/server.js
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { initDB } from './db/connection.js';

import authRouter      from './routes/auth.js';
import topicosRouter   from './routes/topicos.js';
import perfisRouter    from './routes/perfis.js';
import categoriasRouter from './routes/categorias.js';
import eventosRouter, { membrosRouter } from './routes/eventos.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret:            process.env.SESSION_SECRET || 'araras-secret-dev',
  resave:            false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

// ── Rotas ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRouter);
app.use('/api/topicos',    topicosRouter);
app.use('/api/perfis',     perfisRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/eventos',    eventosRouter);
app.use('/api/membros',    membrosRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ── Boot ─────────────────────────────────────────────────────────────────────
await initDB();
app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
