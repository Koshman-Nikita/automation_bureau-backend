import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { signAccessToken, signRefreshToken } from '../utils/jwt';

const r = Router();

// НЕ хешуємо тут – покладаємося на pre-save у моделі
r.post('/register', async (req: Request, res: Response) => {
  const { email, password, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const exists = await User.findOne({ email }).lean();
  if (exists) return res.status(409).json({ error: 'Email in use' });

  const user = await User.create({ email, password, role });

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
  const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });

  return res.status(201).json({
    user: { _id: user._id, email: user.email, role: user.role },
    accessToken, refreshToken,
  });
});

r.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
  const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });

  return res.json({
    user: { _id: user._id, email: user.email, role: user.role },
    accessToken, refreshToken,
  });
});

r.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'No token' });
  return res.status(501).json({ error: 'Not implemented' });
});

r.get('/me', auth, async (req: Request, res: Response) => {
  const userId = (req as any).user?.sub;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await User.findById(userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json({
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

export default r;
