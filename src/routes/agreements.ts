import { Router } from 'express';
import { auth, hasRole } from '../middleware/auth';
import { Policies } from '../policies/access';
import { listAgreements, getAgreement, createAgreement, updateAgreement, deleteAgreement } from '../controllers/agreementController';

const r = Router();

r.get('/', auth, hasRole(...Policies.Agreements.read), listAgreements);
r.get('/:id', auth, hasRole(...Policies.Agreements.read), getAgreement);
r.post('/', auth, hasRole(...Policies.Agreements.create), createAgreement);
r.patch('/:id', auth, hasRole(...Policies.Agreements.update), updateAgreement);
r.delete('/:id', auth, hasRole(...Policies.Agreements.delete), deleteAgreement);

export default r;
