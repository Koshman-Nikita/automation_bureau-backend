import { Router } from 'express';
import { overviewStats } from '../controllers/statsController';
import { auth, hasRole } from '../middleware/auth';
import { Policies } from '../policies/access';

const router = Router();

// Дашборд зазвичай доступний менеджеру/адміну
router.get('/overview', auth, hasRole(...Policies.Agreements.read), overviewStats);

export default router;
