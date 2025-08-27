import { Router } from 'express';
const r = Router();

r.get('/', (_req, res) => res.json({ items: [], total: 0 }));
r.get('/:id', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

export default r;
