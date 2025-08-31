import { Request, Response } from 'express';
import { Jobseeker } from '../models/Jobseeker';
import { Vacancy } from '../models/Vacancy';
import { Employer } from '../models/Employer';
import { matchQuery } from '../validators/match';

/**
 * логіка скорингу (для обох напрямків однакова):
 *  - 2 бали за кожен збіг навички
 *  - +1 якщо бажана зарплата входить у діапазон
 *  - +1 якщо міста збігаються
 */

// вакансії для шукача
export async function vacanciesForJobseeker(req: Request, res: Response) {
  const q = matchQuery.parse(req.query);
  const js = await Jobseeker.findById(req.params.id).lean();
  if (!js) return res.status(404).json({ error: 'Jobseeker not found' });

  const items = await Vacancy.aggregate([
    { $match: { status: 'open' } },
    {
      $lookup: {
        from: 'employers',
        localField: 'employerId',
        foreignField: '_id',
        as: 'employer',
        pipeline: [{ $project: { _id: 1, name: 1, city: 1 } }],
      },
    },
    { $unwind: '$employer' },
    {
      $addFields: {
        skillMatches: { $size: { $setIntersection: ['$skills', js.skills ?? []] } },
        salaryScore: {
          $cond: [
            {
              $and: [
                { $ifNull: ['$salaryMin', false] },
                { $ifNull: ['$salaryMax', false] },
                { $ifNull: [js.salaryDesired, false] },
                { $gte: [js.salaryDesired, '$salaryMin'] },
                { $lte: [js.salaryDesired, '$salaryMax'] },
              ],
            },
            1, 0,
          ],
        },
        cityScore: { $cond: [{ $eq: ['$employer.city', js.city ?? null] }, 1, 0] },
      },
    },
    { $addFields: { score: { $add: [{ $multiply: ['$skillMatches', 2] }, '$salaryScore', '$cityScore'] } } },
    { $match: { score: { $gte: q.minScore ?? 1 } } },
    { $sort: { score: -1, createdAt: -1 } },
    { $limit: q.limit ?? 10 },
    {
      $project: {
        _id: 1, title: 1, skills: 1, salaryMin: 1, salaryMax: 1, status: 1, employer: 1,
        score: 1, skillMatches: 1, salaryScore: 1, cityScore: 1,
      },
    },
  ]);

  res.json({ items, for: { jobseekerId: js._id, city: js.city, skills: js.skills, salaryDesired: js.salaryDesired } });
}

// кандидати для вакансії
export async function jobseekersForVacancy(req: Request, res: Response) {
  const q = matchQuery.parse(req.query);
  const vac = await Vacancy.findById(req.params.id).lean();
  if (!vac) return res.status(404).json({ error: 'Vacancy not found' });

  const employer = await Employer.findById(vac.employerId).lean();

  const items = await Jobseeker.aggregate([
    { $match: { status: 'active' } },
    {
      $addFields: {
        skillMatches: { $size: { $setIntersection: ['$skills', vac.skills ?? []] } },
        salaryScore: {
          $cond: [
            {
              $and: [
                { $ifNull: [vac.salaryMin, false] },
                { $ifNull: [vac.salaryMax, false] },
                { $ifNull: ['$salaryDesired', false] },
                { $gte: ['$salaryDesired', vac.salaryMin ?? 0] },
                { $lte: ['$salaryDesired', vac.salaryMax ?? Number.MAX_SAFE_INTEGER] },
              ],
            },
            1, 0,
          ],
        },
        cityScore: { $cond: [{ $eq: ['$city', employer?.city ?? null] }, 1, 0] },
      },
    },
    { $addFields: { score: { $add: [{ $multiply: ['$skillMatches', 2] }, '$salaryScore', '$cityScore'] } } },
    { $match: { score: { $gte: q.minScore ?? 1 } } },
    { $sort: { score: -1, createdAt: -1 } },
    { $limit: q.limit ?? 10 },
    { $project: { _id: 1, fullName: 1, skills: 1, city: 1, salaryDesired: 1, status: 1, score: 1, skillMatches: 1, salaryScore: 1, cityScore: 1 } },
  ]);

  res.json({
    items,
    for: {
      vacancyId: vac._id, title: vac.title, vacancySkills: vac.skills ?? [],
      employerCity: employer?.city, salaryMin: vac.salaryMin, salaryMax: vac.salaryMax,
    },
  });
}
