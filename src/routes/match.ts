// src/routes/match.ts
import { Router } from 'express';
import { auth, hasRole } from '../middleware/auth';
import type { Role } from '../types/roles';
import { vacanciesForJobseeker, jobseekersForVacancy } from '../controllers/matchController';

const r = Router();

// Хто може дивитись матчінг (можеш розширити за потреби)
const allow: Role[] = ['admin', 'manager'];

r.get('/vacancies-for-jobseeker/:id', auth, hasRole(...allow), vacanciesForJobseeker);
r.get('/jobseekers-for-vacancy/:id',   auth, hasRole(...allow), jobseekersForVacancy);

export default r;
