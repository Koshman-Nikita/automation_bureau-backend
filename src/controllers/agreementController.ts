import { Request, Response } from 'express';
import { Agreement } from '../models/Agreement';
import { listAgreementQuery, createAgreementSchema, updateAgreementSchema } from '../validators/agreement';

export async function listAgreements(req: Request, res: Response) {
  const parsed = listAgreementQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });

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

export async function getAgreement(req: Request, res: Response) {
  const doc = await Agreement.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json({ item: doc });
}

export async function createAgreement(req: Request, res: Response) {
  const parsed = createAgreementSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  const created = await Agreement.create(parsed.data);
  res.status(201).json({ item: created });
}

export async function updateAgreement(req: Request, res: Response) {
  const parsed = updateAgreementSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  const updated = await Agreement.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ item: updated });
}

export async function deleteAgreement(req: Request, res: Response) {
  const deleted = await Agreement.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
}
