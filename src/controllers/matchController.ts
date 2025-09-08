import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Jobseeker } from '../models/Jobseeker';
import { Vacancy } from '../models/Vacancy';
import Employer from '../models/Employer';
import { matchQuery } from '../validators/match';

function toTokens(s?: string | null): string[] {
  if (!s) return [];
  return String(s)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(' ')
    .map(t => t.trim())
    .filter(Boolean);
}

function normArray(arr?: string[] | null): string[] {
  if (!arr) return [];
  return arr.map(s => String(s).toLowerCase().trim()).filter(Boolean);
}

// Jaccard similarity: |A∩B| / |A∪B|
function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  const uni = new Set([...a, ...b]).size;
  return inter / (uni || 1);
}

/**
 * Асиметричний скор зарплати:
 *  - якщо desired <= offered: лінійно 0..1 (чим ближче — тим більше, максимум 1)
 *  - якщо desired > offered: лінійно 0..0.6 (штраф, чим більше перевищення — тим менше)
 */
function salaryAsymmetricScore(desired?: number | null, offered?: number | null): number {
  if (!desired || !offered || desired <= 0 || offered <= 0) return 0;
  if (desired <= offered) {
    // близькість: 1 - (offered - desired) / offered
    const closeness = 1 - Math.max(0, (offered - desired) / offered);
    return Math.max(0, Math.min(1, closeness));
  } else {
    // бажана вище: 0.6 * (1 - (desired - offered)/(desired))  => у межах (0..0.6]
    const ratio = 1 - Math.max(0, (desired - offered) / desired);
    return Math.max(0, Math.min(0.6, 0.6 * ratio));
  }
}

/**
 * Перевірка міста: js.city входить у employer.address (без регістру) => 1, інакше 0
 */
function citySubstringScore(jsCity?: string | null, employerAddress?: string | null): number {
  if (!jsCity || !employerAddress) return 0;
  const c = jsCity.toLowerCase().trim();
  const addr = employerAddress.toLowerCase();
  return addr.includes(c) ? 1 : 0;
}

/** ----------------- Скоpинг: вакансія для пошукача ----------------- */
function scoreVacancyForJobseeker(opts: {
  js: {
    qualification?: string | null;
    activityTypes?: string[] | null;
    city?: string | null;
    salaryDesired?: number | null;
  };
  vac: {
    title?: string | null;
    position?: string | null;
    activityType?: string | null;
    skills?: string[] | null;
    salary?: number | null;
  };
  employerAddr?: string | null;
}) {
  const { js, vac, employerAddr } = opts;

  // кваліфікація пошукача vs навички та позиція вакансії (токенізуємо)
  const qualTokens = toTokens(js.qualification);
  const vacSkillTokens = normArray(vac.skills ?? []);
  const posTokens = toTokens(vac.position || vac.title);
  const vacTokens = Array.from(new Set([...vacSkillTokens, ...posTokens]));

  const qualSkillScore = jaccard(qualTokens, vacTokens); // 0..1

  // activityTypes перетин із activityType вакансії (або з токенами позиції як запасний варіант)
  const jsActs = normArray(js.activityTypes ?? []);
  let activityScore = 0;
  if (vac.activityType) {
    activityScore = jsActs.includes(String(vac.activityType).toLowerCase().trim()) ? 1 : 0;
  } else if (posTokens.length) {
    activityScore = jaccard(jsActs, posTokens); // 0..1, якщо activityType не заданий
  }

  const salaryScore = salaryAsymmetricScore(js.salaryDesired ?? null, vac.salary ?? null); // 0..1 (або до 0.6)
  const cityScore = citySubstringScore(js.city ?? null, employerAddr ?? null); // 0 або 1

  // Підсумок (ваги можна підкрутити)
  const score = 2.5 * qualSkillScore + 1.5 * activityScore + 1.2 * salaryScore + 0.8 * cityScore;

  return {
    score: Number(score.toFixed(4)),
    breakDown: { qualSkillScore, activityScore, salaryScore, cityScore },
  };
}

/** ----------------- Скоpинг: пошукач для вакансії ----------------- */
function scoreJobseekerForVacancy(opts: {
  js: {
    qualification?: string | null;
    activityTypes?: string[] | null;
    city?: string | null;
    salaryDesired?: number | null;
  };
  vac: {
    title?: string | null;
    position?: string | null;
    activityType?: string | null;
    skills?: string[] | null;
    salary?: number | null;
  };
  employerAddr?: string | null;
}) {
  return scoreVacancyForJobseeker(opts);
}

export async function vacanciesForJobseeker(req: Request, res: Response) {
  const q = matchQuery.parse(req.query);
  const js = await Jobseeker.findById(req.params.id).lean();
  if (!js) return res.status(404).json({ error: 'Jobseeker not found' });

  const vacancies = await Vacancy.find({ status: 'open' }).sort({ createdAt: -1 }).lean();
  const employerIds = Array.from(new Set(vacancies.map(v => String(v.employerId))));
  const employers = await Employer.find({ _id: { $in: employerIds } })
    .select('_id name address')
    .lean();
  const empMap = new Map<string, { _id: Types.ObjectId; name: string; address?: string }>(
    employers.map(e => [String(e._id), e as any])
  );

  const scored = vacancies.map(v => {
    const emp = empMap.get(String(v.employerId));
    const { score, breakDown } = scoreVacancyForJobseeker({
      js: {
        qualification: (js as any).qualification,
        activityTypes: (js as any).activityTypes,
        city: (js as any).city,
        salaryDesired: (js as any).salaryDesired,
      },
      vac: {
        title: (v as any).title,
        position: (v as any).position,
        activityType: (v as any).activityType,
        skills: (v as any).skills,
        salary: (v as any).salary,
      },
      employerAddr: (emp as any)?.address ?? null,
    });

    return {
      _id: v._id,
      title: (v as any).title,
      position: (v as any).position,
      skills: (v as any).skills,
      activityType: (v as any).activityType,
      salary: (v as any).salary,
      status: (v as any).status,
      employer: emp ? { _id: emp._id, name: (emp as any).name, address: (emp as any).address } : null,
      score,
      ...breakDown,
      createdAt: (v as any).createdAt,
    };
  });

  const minScore = typeof q.minScore === 'number' ? q.minScore : 1;
  const limit = typeof q.limit === 'number' ? q.limit : 10;

  const items = scored
    .filter(x => x.score >= minScore)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : (b.createdAt as any) - (a.createdAt as any)))
    .slice(0, limit);

  res.json({
    items,
    for: {
      jobseekerId: js._id,
      city: (js as any).city,
      qualification: (js as any).qualification,
      activityTypes: (js as any).activityTypes ?? [],
      salaryDesired: (js as any).salaryDesired ?? null,
    },
  });
}

export async function jobseekersForVacancy(req: Request, res: Response) {
  const q = matchQuery.parse(req.query);
  const vac = await Vacancy.findById(req.params.id).lean();
  if (!vac) return res.status(404).json({ error: 'Vacancy not found' });

  const emp = await Employer.findById(vac.employerId).select('_id name address').lean();

  const jobseekers = await Jobseeker.find({ status: 'searching' }).sort({ createdAt: -1 }).lean();

  const scored = jobseekers.map(js => {
    const { score, breakDown } = scoreJobseekerForVacancy({
      js: {
        qualification: (js as any).qualification,
        activityTypes: (js as any).activityTypes,
        city: (js as any).city,
        salaryDesired: (js as any).salaryDesired,
      },
      vac: {
        title: (vac as any).title,
        position: (vac as any).position,
        activityType: (vac as any).activityType,
        skills: (vac as any).skills,
        salary: (vac as any).salary,
      },
      employerAddr: (emp as any)?.address ?? null,
    });

    return {
      _id: js._id,
      fullName: (js as any).fullName,
      qualification: (js as any).qualification,
      activityTypes: (js as any).activityTypes ?? [],
      city: (js as any).city,
      salaryDesired: (js as any).salaryDesired ?? null,
      status: (js as any).status,
      score,
      ...breakDown,
      createdAt: (js as any).createdAt,
    };
  });

  const minScore = typeof q.minScore === 'number' ? q.minScore : 1;
  const limit = typeof q.limit === 'number' ? q.limit : 10;

  const items = scored
    .filter(x => x.score >= minScore)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : (b.createdAt as any) - (a.createdAt as any)))
    .slice(0, limit);

  res.json({
    items,
    for: {
      vacancyId: vac._id,
      title: (vac as any).title,
      position: (vac as any).position,
      vacancySkills: (vac as any).skills ?? [],
      activityType: (vac as any).activityType ?? null,
      employerAddress: (emp as any)?.address ?? null,
      salary: (vac as any).salary ?? null,
    },
  });
}
