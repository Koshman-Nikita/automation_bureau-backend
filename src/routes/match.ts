import { Router } from 'express';
import { auth, hasRole } from '../middleware/auth';
import { Policies } from '../policies/access';
import {
  vacanciesForJobseeker,
  jobseekersForVacancy,
} from '../controllers/matchController';

const r = Router();

r.get(
  '/for-jobseeker/:id',
  auth,
  hasRole(...Policies.Vacancies.read),
  vacanciesForJobseeker
);

r.get(
  '/for-vacancy/:id',
  auth,
  hasRole(...Policies.Jobseekers.read),
  jobseekersForVacancy
);

export default r;
