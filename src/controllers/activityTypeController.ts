// src/controllers/activityTypeController.ts
import { Request, Response } from 'express';
import ActivityType from '../models/ActivityType';

export async function listActivityTypes(req: Request, res: Response) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  const q = String(req.query.q || '').trim();

  const filter: any = {};
  if (q) filter.name = { $regex: q, $options: 'i' };

  const [items, total] = await Promise.all([
    ActivityType.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ActivityType.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
}

export async function getActivityType(req: Request, res: Response) {
  const doc = await ActivityType.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json({ item: doc });
}

export async function createActivityType(req: Request, res: Response) {
  const { name, isActive = true } = req.body || {};
  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: 'name is required (min 2 chars)' });
  }
  const doc = await ActivityType.create({ name: String(name).trim(), isActive });
  res.status(201).json({ item: doc });
}

export async function updateActivityType(req: Request, res: Response) {
  const { name, isActive } = req.body || {};
  const doc = await ActivityType.findByIdAndUpdate(
    req.params.id,
    { $set: { ...(name != null ? { name: String(name).trim() } : {}), ...(isActive != null ? { isActive: !!isActive } : {}) } },
    { new: true }
  ).lean();
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json({ item: doc });
}

export async function deleteActivityType(req: Request, res: Response) {
  const ok = await ActivityType.findByIdAndDelete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ deleted: true });
}
