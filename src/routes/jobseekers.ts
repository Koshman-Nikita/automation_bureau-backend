import { Router } from 'express';
import { auth, hasRole } from '../middleware/auth';
import { Policies } from '../policies/access';
import { listJobseekers, getJobseeker, createJobseeker, updateJobseeker, deleteJobseeker } from '../controllers/jobseekerController';

const r = Router();

r.get('/', auth, hasRole(...Policies.Jobseekers.read), listJobseekers);
r.get('/:id', auth, hasRole(...Policies.Jobseekers.read), getJobseeker);
r.post('/', auth, hasRole(...Policies.Jobseekers.create), createJobseeker);
r.patch('/:id', auth, hasRole(...Policies.Jobseekers.update), updateJobseeker);
r.delete('/:id', auth, hasRole(...Policies.Jobseekers.delete), deleteJobseeker);

export default r;
