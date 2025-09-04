// src/routes/activityTypes.ts
import { Router } from 'express';
import { auth, hasRole } from '../middleware/auth';
import {
  listActivityTypes,
  getActivityType,
  createActivityType,
  updateActivityType,
  deleteActivityType,
} from '../controllers/activityTypeController';

const r = Router();

r.get('/', auth, listActivityTypes);
r.get('/:id', auth, getActivityType);

r.post('/', auth, hasRole('admin', 'manager'), createActivityType);
r.patch('/:id', auth, hasRole('admin', 'manager'), updateActivityType);
r.delete('/:id', auth, hasRole('admin', 'manager'), deleteActivityType);

export default r;
