import { Router } from 'express';
import { auth, hasRole } from '../middleware/auth';
import { Policies } from '../policies/access';
import {
  listActivityTypes,
  getActivityType,
  createActivityType,
  updateActivityType,
  deleteActivityType,
} from '../controllers/activityTypeController';

const r = Router();

// Read
r.get('/', auth, hasRole(...Policies.ActivityTypes.read), listActivityTypes);
r.get('/:id', auth, hasRole(...Policies.ActivityTypes.read), getActivityType);

// Create/Update/Delete
r.post('/', auth, hasRole(...Policies.ActivityTypes.create), createActivityType);
r.patch('/:id', auth, hasRole(...Policies.ActivityTypes.update), updateActivityType);
r.delete('/:id', auth, hasRole(...Policies.ActivityTypes.delete), deleteActivityType);

export default r;
