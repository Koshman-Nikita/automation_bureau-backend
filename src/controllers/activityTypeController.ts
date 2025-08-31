import { Request, Response } from 'express';
import { ActivityType } from '../models/ActivityType';
import { createActivityTypeSchema, updateActivityTypeSchema, listQuerySchema } from '../validators/activityType';

export async function listActivityTypes(req: Request, res: Response) {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });

  const { page = 1, limit = 10, q, isActive } = parsed.data;
  const filter: any = {};
  if (typeof isActive === 'boolean') filter.isActive = isActive;
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    ActivityType.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    ActivityType.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
}

export async function getActivityType(req: Request, res: Response) {
  const { id } = req.params;
  const doc = await ActivityType.findById(id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json({ item: doc });
}

export async function createActivityType(req: Request, res: Response) {
  const parsed = createActivityTypeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  const exists = await ActivityType.findOne({ name: parsed.data.name });
  if (exists) return res.status(409).json({ error: 'ActivityType with this name already exists' });

  const created = await ActivityType.create(parsed.data);
  res.status(201).json({ item: created });
}

export async function updateActivityType(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = updateActivityTypeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  const updated = await ActivityType.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ item: updated });
}

export async function deleteActivityType(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await ActivityType.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
}
