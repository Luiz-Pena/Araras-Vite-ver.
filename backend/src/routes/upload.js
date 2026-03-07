import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/upload
router.post('/', requireAuth, upload.single('arquivo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;