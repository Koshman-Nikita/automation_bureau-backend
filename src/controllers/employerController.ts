import { Request, Response } from 'express';
import { Employer } from '../models/Employer';
import { createEmployerSchema, updateEmployerSchema, listEmployerQuery } from '../validators/employer';

export async function listEmployers(req: Request, res: Response) {
  const parsed = listEmployerQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
  const { page = 1, limit = 10, q } = parsed.data;

  const filter: any = {};
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    Employer.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Employer.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
}

export async function getEmployer(req: Request, res: Response) {
  const { id } = req.params;
  const doc = await Employer.findById(id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json({ item: doc });
}

export async function createEmployer(req: Request, res: Response) {
  const parsed = createEmployerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  const exists = await Employer.findOne({ name: parsed.data.name });
  if (exists) return res.status(409).json({ error: 'Employer with this name already exists' });

  const created = await Employer.create(parsed.data);
  res.status(201).json({ item: created });
}

export async function updateEmployer(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = updateEmployerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  const updated = await Employer.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ item: updated });
}

export async function deleteEmployer(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await Employer.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
}
