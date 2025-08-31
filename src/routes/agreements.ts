import { Router } from 'express';
import { auth, hasRole } from '../middleware/auth';
import { Policies } from '../policies/access';

const r = Router();

r.get('/', auth, hasRole(...Policies.Agreements.read), async (_req, res) => {
  res.json({ items: [], total: 0 });
});

r.post('/', auth, hasRole(...Policies.Agreements.create), async (_req, res) => {
  res.status(201).json({ created: true });
});

r.patch('/:id', auth, hasRole(...Policies.Agreements.update), async (_req, res) => {
  res.json({ updated: true });
});

r.delete('/:id', auth, hasRole(...Policies.Agreements.delete), async (_req, res) => {
  res.status(204).end();
});

export default r;
