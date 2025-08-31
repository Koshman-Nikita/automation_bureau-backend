import { Request, Response } from 'express';
import { Jobseeker } from '../models/Jobseeker';
import { createJobseekerSchema, updateJobseekerSchema, listJobseekerQuery } from '../validators/jobseeker';

export async function listJobseekers(req: Request, res: Response) {
  const parsed = listJobseekerQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
  const { page = 1, limit = 10, q, status } = parsed.data;

  const filter: any = {};
  if (q) filter.$text = { $search: q };
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    Jobseeker.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Jobseeker.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
}

export async function getJobseeker(req: Request, res: Response) {
  const doc = await Jobseeker.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json({ item: doc });
}

export async function createJobseeker(req: Request, res: Response) {
  const parsed = createJobseekerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  const created = await Jobseeker.create(parsed.data);
  res.status(201).json({ item: created });
}

export async function updateJobseeker(req: Request, res: Response) {
  const parsed = updateJobseekerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  const updated = await Jobseeker.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ item: updated });
}

export async function deleteJobseeker(req: Request, res: Response) {
  const deleted = await Jobseeker.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
}
