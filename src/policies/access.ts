import { Role } from '../types/roles';

/**
 * Базові політики по сутностях.
 * Можна розширювати прапорцями (create/read/update/delete) або функціями.
 */
export const Policies = {
  ActivityTypes: {
    create: ['admin', 'manager'] as Role[],
    update: ['admin', 'manager'] as Role[],
    delete: ['admin'] as Role[],
    read:   ['admin', 'manager', 'employer', 'jobseeker'] as Role[],
  },
  Employers: {
    read:   ['admin', 'manager', 'employer'] as Role[],
    create: ['admin', 'manager'] as Role[],
    update: ['admin', 'manager'] as Role[],
    delete: ['admin'] as Role[],
  },
  Jobseekers: {
    read:   ['admin', 'manager'] as Role[],
    create: ['admin', 'manager'] as Role[],
    update: ['admin', 'manager'] as Role[],
    delete: ['admin'] as Role[],
  },
  Vacancies: {
    read:   ['admin', 'manager', 'employer', 'jobseeker'] as Role[],
    create: ['admin', 'manager', 'employer'] as Role[],
    update: ['admin', 'manager', 'employer'] as Role[],
    delete: ['admin', 'manager'] as Role[],
  },
  Agreements: {
    read:   ['admin', 'manager'] as Role[],
    create: ['admin', 'manager'] as Role[],
    update: ['admin', 'manager'] as Role[],
    delete: ['admin'] as Role[],
  },
} as const;
