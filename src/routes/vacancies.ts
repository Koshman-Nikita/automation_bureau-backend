import { Router } from 'express';
import { auth, hasRole } from '../middleware/auth';
import { Policies } from '../policies/access';

const r = Router();

// читати можуть усі (в т.ч. jobseeker)
r.get('/', auth, hasRole(...Policies.Vacancies.read), async (_req, res) => {
  res.json({ items: [], total: 0 });
});

// створювати може employer/manager/admin
r.post('/', auth, hasRole(...Policies.Vacancies.create), async (_req, res) => {
  res.status(201).json({ created: true });
});

// оновлювати — employer/manager/admin
r.patch('/:id', auth, hasRole(...Policies.Vacancies.update), async (_req, res) => {
  res.json({ updated: true });
});

// видаляти — manager/admin
r.delete('/:id', auth, hasRole(...Policies.Vacancies.delete), async (_req, res) => {
  res.status(204).end();
});

export default r;
