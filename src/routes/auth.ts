import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { auth } from '../middleware/auth';

const r = Router();

// Схеми вхідних даних
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'manager', 'employer', 'jobseeker']).optional().default('manager'),
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

// POST /api/auth/register
r.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  const { email, password, role } = parsed.data;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, role });

  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return res.status(201).json({
    user: { _id: user.id, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

// POST /api/auth/login
r.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return res.json({
    user: { _id: user.id, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

// POST /api/auth/refresh
r.post('/refresh', async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });

  try {
    const payload = verifyRefreshToken(parsed.data.refreshToken);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    const newAccess = signAccessToken({ sub: user.id, role: user.role });
    const newRefresh = signRefreshToken({ sub: user.id, role: user.role });
    return res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// GET /api/auth/me (приклад захищеного)
r.get('/me', auth, async (req, res) => {
  const userId = (req as any).user?.sub as string;
  const user = await User.findById(userId).select('_id email role createdAt updatedAt');
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user });
});

export default r;
