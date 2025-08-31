import { Router } from 'express';
import { auth, hasRole } from '../middleware/auth';
import { Policies } from '../policies/access';

const r = Router();

// GET /api/activity-types — читають усі ролі з Policies
r.get('/', auth, hasRole(...Policies.ActivityTypes.read), async (_req, res) => {
  // TODO: реальна вибірка з БД
  res.json({ items: [], total: 0 });
});

// POST — admin/manager
r.post('/', auth, hasRole(...Policies.ActivityTypes.create), async (req, res) => {
  res.status(201).json({ created: true });
});

// PATCH — admin/manager
r.patch('/:id', auth, hasRole(...Policies.ActivityTypes.update), async (req, res) => {
  res.json({ updated: true });
});

// DELETE — тільки admin
r.delete('/:id', auth, hasRole(...Policies.ActivityTypes.delete), async (req, res) => {
  res.status(204).end();
});

export default r;
