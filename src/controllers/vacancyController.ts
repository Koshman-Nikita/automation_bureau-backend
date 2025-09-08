import { Request, Response } from 'express';
import Vacancy, { IVacancy } from '../models/Vacancy';

function extractPayload(body: any): Partial<IVacancy> {
  const skills: string[] = Array.isArray(body?.skills)
    ? body.skills.map((s: any) => String(s).trim()).filter(Boolean)
    : [];

  const payload: Partial<IVacancy> = {
    title: typeof body?.title === 'string' ? body.title.trim() : undefined,
    position: typeof body?.position === 'string' ? body.position.trim() : undefined,
    employerId: body?.employerId,
    activityType: body?.activityType ? String(body.activityType).trim() : undefined,
    salary:
      body?.salary === null || body?.salary === undefined
        ? null
        : Number(body.salary),
    status: body?.status === 'closed' ? 'closed' : 'open',
    skills,
  };

  Object.keys(payload).forEach(
    (k) => (payload as any)[k] === undefined && delete (payload as any)[k]
  );
  return payload;
}

/** GET /api/vacancies */
export async function listVacancies(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
  const q = String(req.query.q || '').trim();

  const filter: any = {};
  if (q) {
    const rx = { $regex: q, $options: 'i' };
    filter.$or = [
      { title: rx },
      { position: rx },
      { activityType: rx },
      { skills: { $elemMatch: rx } },
    ];
  }

  const [items, total] = await Promise.all([
    Vacancy.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('_id title position employerId activityType skills salary status createdAt updatedAt')
      .lean({ getters: true }),
    Vacancy.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
}

/** GET /api/vacancies/:id */
export async function getVacancy(req: Request, res: Response) {
  const item = await Vacancy.findById(req.params.id)
    .select('_id title position employerId activityType skills salary status createdAt updatedAt')
    .lean({ getters: true });

  if (!item) return res.status(404).json({ error: 'Vacancy not found' });
  res.json({ item });
}

/** POST /api/vacancies */
export async function createVacancy(req: Request, res: Response) {
  const payload = extractPayload(req.body);
  try {
    const created = await Vacancy.create(payload);
    const item = (await Vacancy.findById(created._id)
      .select('_id title position employerId activityType skills salary status createdAt updatedAt')
      .lean({ getters: true }))!;
    res.status(201).json({ item });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Create failed' });
  }
}

/** PATCH /api/vacancies/:id */
export async function updateVacancy(req: Request, res: Response) {
  const payload = extractPayload(req.body);
  try {
    const updated = await Vacancy.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    )
      .select('_id title position employerId activityType skills salary status createdAt updatedAt')
      .lean({ getters: true });

    if (!updated) return res.status(404).json({ error: 'Vacancy not found' });
    res.json({ item: updated });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Update failed' });
  }
}

/** DELETE /api/vacancies/:id */
export async function deleteVacancy(req: Request, res: Response) {
  const deleted = await Vacancy.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Vacancy not found' });
  res.json({ ok: true });
}
