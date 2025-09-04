import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User, { UserDoc } from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { auth } from '../middleware/auth';

const r = Router();

/**
 * POST /api/auth/register
 */
r.post('/register', async (req, res) => {
  try {
    const { email, password, role } = (req.body ?? {}) as { email?: string; password?: string; role?: string };
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const exists = await User.exists({ email });
    if (exists) return res.status(409).json({ error: 'Email in use' });

    const user: UserDoc = await User.create({ email, password, role: (role as any) || 'manager' });

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);

    return res.status(201).json({
      user: { _id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (e) {
    console.error('Register error:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/auth/login
 */
r.post('/login', async (req, res) => {
  try {
    const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);

    return res.json({
      user: { _id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/auth/refresh
 */
r.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = (req.body ?? {}) as { refreshToken?: string };
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

    const { sub, role } = verifyRefreshToken(refreshToken);
    const user = await User.findById(sub).lean();
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    const accessToken = signAccessToken(sub, role);
    const newRefresh = signRefreshToken(sub, role);
    return res.json({ accessToken, refreshToken: newRefresh });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * GET /api/auth/me
 */
r.get('/me', auth, async (req, res) => {
  const userId = (req as any).user?.sub as string | undefined;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await User.findById(userId).select('_id email role createdAt updatedAt').lean();
  if (!user) return res.status(404).json({ error: 'Not found' });

  return res.json({ user });
});

export default r;
