import { Request, Response } from 'express';
import { ActivityType } from '../models/ActivityType';
import {
  listActivityTypeQuery,
  createActivityTypeSchema,
  updateActivityTypeSchema,
} from '../validators/activityType';

/** GET /api/activity-types */
export async function listActivityTypes(req: Request, res: Response) {
  const parsed = listActivityTypeQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
  }
  const { page = 1, limit = 20, q } = parsed.data;

  const filter: any = {};
  if (q?.trim()) {
    const rx = { $regex: q.trim(), $options: 'i' };
    filter.$or = [{ name: rx }, { code: rx }];
  }

  const [items, total] = await Promise.all([
    ActivityType.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ActivityType.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
}

/** GET /api/activity-types/:id */
export async function getActivityType(req: Request, res: Response) {
  const item = await ActivityType.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ item });
}

/** POST /api/activity-types */
export async function createActivityType(req: Request, res: Response) {
  const parsed = createActivityTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
  }
  const created = await ActivityType.create(parsed.data);
  res.status(201).json({ item: created });
}

/** PATCH /api/activity-types/:id */
export async function updateActivityType(req: Request, res: Response) {
  const parsed = updateActivityTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
  }
  const updated = await ActivityType.findByIdAndUpdate(
    req.params.id,
    parsed.data,
    { new: true, runValidators: true }
  ).lean();

  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ item: updated });
}

/** DELETE /api/activity-types/:id */
export async function deleteActivityType(req: Request, res: Response) {
  const deleted = await ActivityType.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
}
