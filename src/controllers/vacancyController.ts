import { Request, Response } from 'express';
import { Vacancy } from '../models/Vacancy';
import { createVacancySchema, updateVacancySchema, listVacancyQuery } from '../validators/vacancy';

export async function listVacancies(req: Request, res: Response) {
  const parsed = listVacancyQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });

  const { page = 1, limit = 10, q, status, employerId } = parsed.data;
  const filter: any = {};
  if (q) filter.$text = { $search: q };
  if (status) filter.status = status;
  if (employerId) filter.employerId = employerId;

  const [items, total] = await Promise.all([
    Vacancy.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Vacancy.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
}

export async function getVacancy(req: Request, res: Response) {
  const doc = await Vacancy.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json({ item: doc });
}

export async function createVacancy(req: Request, res: Response) {
  const parsed = createVacancySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  const created = await Vacancy.create(parsed.data);
  res.status(201).json({ item: created });
}

export async function updateVacancy(req: Request, res: Response) {
  const parsed = updateVacancySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  const updated = await Vacancy.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ item: updated });
}

export async function deleteVacancy(req: Request, res: Response) {
  const deleted = await Vacancy.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
}
