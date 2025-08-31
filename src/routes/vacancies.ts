import { Router } from 'express';
import { auth, hasRole } from '../middleware/auth';
import { Policies } from '../policies/access';
import { listVacancies, getVacancy, createVacancy, updateVacancy, deleteVacancy } from '../controllers/vacancyController';

const r = Router();

r.get('/', auth, hasRole(...Policies.Vacancies.read), listVacancies);
r.get('/:id', auth, hasRole(...Policies.Vacancies.read), getVacancy);
r.post('/', auth, hasRole(...Policies.Vacancies.create), createVacancy);
r.patch('/:id', auth, hasRole(...Policies.Vacancies.update), updateVacancy);
r.delete('/:id', auth, hasRole(...Policies.Vacancies.delete), deleteVacancy);

export default r;
