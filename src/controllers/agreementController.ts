import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Agreement } from '../models/Agreement';
import { Vacancy } from '../models/Vacancy';
import { Jobseeker } from '../models/Jobseeker';
import {
  listAgreementQuery,
  createAgreementSchema,
  updateAgreementSchema,
} from '../validators/agreement';

// безпечне приведення до string | undefined
function toStrId(v: Types.ObjectId | string | null | undefined): string | undefined {
  if (v == null) return undefined; // ловить і null, і undefined
  return typeof v === 'string' ? v : (v as any)?.toString?.();
}

async function closeVacancyAndMarkJobseeker(opts: {
  vacancyId?: Types.ObjectId | string | null;
  jobseekerId: Types.ObjectId | string;
}) {
  const vId = toStrId(opts.vacancyId);
  const jsId = toStrId(opts.jobseekerId);

  try {
    if (vId) {
      await Vacancy.findByIdAndUpdate(vId, { $set: { status: 'closed' } }, { new: false });
      console.log('[Agreement ctrl] vacancy closed:', vId);
    }
    if (jsId) {
      await Jobseeker.findByIdAndUpdate(jsId, { $set: { status: 'employed' } }, { new: false });
      console.log('[Agreement ctrl] jobseeker employed:', jsId);
    }
  } catch (e) {
    console.error('[Agreement ctrl] side effects error:', e);
  }
}

/** GET /api/agreements */
export async function listAgreements(req: Request, res: Response) {
  const parsed = listAgreementQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
  }

  const { page = 1, limit = 10, vacancyId, jobseekerId, dateFrom, dateTo } = parsed.data;
  const filter: any = {};
  if (vacancyId) filter.vacancyId = vacancyId;
  if (jobseekerId) filter.jobseekerId = jobseekerId;
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = dateFrom;
    if (dateTo) filter.date.$lte = dateTo;
  }

  const [items, total] = await Promise.all([
    Agreement.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
    Agreement.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
}

/** GET /api/agreements/:id */
export async function getAgreement(req: Request, res: Response) {
  const doc = await Agreement.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json({ item: doc });
}

/** POST /api/agreements */
export async function createAgreement(req: Request, res: Response) {
  console.log('[Agreement create] raw body:', req.body);

  const parsed = createAgreementSchema.safeParse(req.body);
  if (!parsed.success) {
    console.log('[Agreement create] zod error:', parsed.error.issues);
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
  }

  const created = await Agreement.create(parsed.data);
  console.log('[Agreement create] created:', created?._id?.toString());

  // побічні дії (дублюємо хуки)
  await closeVacancyAndMarkJobseeker({
    vacancyId: created.vacancyId ?? null,
    jobseekerId: created.jobseekerId,
  });

  res.status(201).json({ item: created });
}

/** PATCH /api/agreements/:id */
export async function updateAgreement(req: Request, res: Response) {
  console.log('[Agreement update] raw body:', req.body);

  const parsed = updateAgreementSchema.safeParse(req.body);
  if (!parsed.success) {
    console.log('[Agreement update] zod error:', parsed.error.issues);
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
  }

  const updated = await Agreement.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });

  console.log('[Agreement update] updated:', updated?._id?.toString());

  await closeVacancyAndMarkJobseeker({
    vacancyId: updated.vacancyId ?? null,
    jobseekerId: updated.jobseekerId,
  });

  res.json({ item: updated });
}

/** DELETE /api/agreements/:id */
export async function deleteAgreement(req: Request, res: Response) {
  const deleted = await Agreement.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
}
