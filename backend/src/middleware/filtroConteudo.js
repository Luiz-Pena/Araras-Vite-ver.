import { PALAVRAS_PROIBIDAS } from "./palavrasProibidas.js";

export function verificarTexto(req, res, next) {
  const { titulo, conteudo } = req.body;
  const textoParaValidar = `${titulo || ''} ${conteudo || ''}`.toLowerCase();

  const temOfensa = PALAVRAS_PROIBIDAS.some(palavra => {
    const regex = new RegExp(`\\b${palavra}\\b`, 'i');
    return regex.test(textoParaValidar);
  });

  if (temOfensa) {
    return res.status(400).json({ error: 'Seu conteúdo foi barrado pelo filtro de moderação automática.' });
  }
  
  next();
}