import { Request, Response } from 'express';
import Employer from '../models/Employer';
import {
  listEmployerQuery,
  createEmployerSchema,
  updateEmployerSchema,
} from '../validators/employer';

/** GET /api/employers */
export async function listEmployers(req: Request, res: Response) {
  const parsed = listEmployerQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
  }
  const { page = 1, limit = 20, q } = parsed.data;

  const filter: any = {};
  if (q?.trim()) {
    const rx = { $regex: q.trim(), $options: 'i' };
    filter.$or = [
      { name: rx },
      { activityType: rx },
      { address: rx },
      { phone: rx },
    ];
  }

  const [items, total] = await Promise.all([
    Employer.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Employer.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
}

/** GET /api/employers/:id */
export async function getEmployer(req: Request, res: Response) {
  const item = await Employer.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ item });
}

/** POST /api/employers */
export async function createEmployer(req: Request, res: Response) {
  const parsed = createEmployerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
  }
  const created = await Employer.create(parsed.data);
  res.status(201).json({ item: created });
}

/** PATCH /api/employers/:id */
export async function updateEmployer(req: Request, res: Response) {
  const parsed = updateEmployerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
  }
  const updated = await Employer.findByIdAndUpdate(
    req.params.id,
    parsed.data,
    { new: true, runValidators: true }
  ).lean();

  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ item: updated });
}

/** DELETE /api/employers/:id */
export async function deleteEmployer(req: Request, res: Response) {
  const deleted = await Employer.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
}
