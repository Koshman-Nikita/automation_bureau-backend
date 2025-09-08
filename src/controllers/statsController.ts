import { Request, Response } from 'express';
import { Vacancy } from '../models/Vacancy';
import { Jobseeker } from '../models/Jobseeker';
import { Agreement } from '../models/Agreement';
import { Employer } from '../models/Employer';

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n)
  return d;
}

/** GET /api/stats/overview */
export async function overviewStats(req: Request, res: Response) {
  try {
    const from7  = daysAgo(7);
    const from30 = daysAgo(30);

    const [
      vacanciesOpen,
      vacanciesClosed,
      jobseekersSearching,
      jobseekersEmployed,
      agreements7d,
      agreements30d,
      recent
    ] = await Promise.all([
      Vacancy.countDocuments({ status: 'open' }),
      Vacancy.countDocuments({ status: 'closed' }),
      Jobseeker.countDocuments({ status: 'searching' }),
      Jobseeker.countDocuments({ status: 'employed' }),
      Agreement.countDocuments({ createdAt: { $gte: from7 } }),
      Agreement.countDocuments({ createdAt: { $gte: from30 } }),
      Agreement.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'employers',
            localField: 'employerId',
            foreignField: '_id',
            as: 'employer',
            pipeline: [{ $project: { _id: 1, name: 1 } }]
          }
        },
        { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'vacancies',
            localField: 'vacancyId',
            foreignField: '_id',
            as: 'vacancy',
            pipeline: [{ $project: { _id: 1, title: 1 } }]
          }
        },
        { $unwind: { path: '$vacancy', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'jobseekers',
            localField: 'jobseekerId',
            foreignField: '_id',
            as: 'jobseeker',
            pipeline: [{ $project: { _id: 1, fullName: 1 } }]
          }
        },
        { $unwind: { path: '$jobseeker', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            date: '$createdAt',
            employerName: '$employer.name',
            vacancyTitle: '$vacancy.title',
            jobseekerName: '$jobseeker.fullName'
          }
        }
      ])
    ]);

    res.json({
      vacanciesOpen,
      vacanciesClosed,
      jobseekersSearching,
      jobseekersEmployed,
      agreements7d,
      agreements30d,
      recent
    });
  } catch (e) {
    console.error('[stats.overview] error:', e);
    res.status(500).json({ error: 'Failed to build stats' });
  }
}
