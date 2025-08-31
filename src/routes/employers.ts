import { Router } from 'express';
import { auth, hasRole } from '../middleware/auth';
import { Policies } from '../policies/access';
import { listEmployers, getEmployer, createEmployer, updateEmployer, deleteEmployer } from '../controllers/employerController';

const r = Router();

r.get('/', auth, hasRole(...Policies.Employers.read), listEmployers);
r.get('/:id', auth, hasRole(...Policies.Employers.read), getEmployer);
r.post('/', auth, hasRole(...Policies.Employers.create), createEmployer);
r.patch('/:id', auth, hasRole(...Policies.Employers.update), updateEmployer);
r.delete('/:id', auth, hasRole(...Policies.Employers.delete), deleteEmployer);

export default r;
