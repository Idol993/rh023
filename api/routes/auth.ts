import { Router, type Request, type Response } from 'express';
import { users, findById } from '../data/mockData.js';
import type { User } from '../../shared/types.js';

const router = Router();

const generateToken = (userId: string): string => {
  return Buffer.from(`${userId}:${Date.now()}:mock-secret`).toString('base64');
};

const parseToken = (token: string): string | null => {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const parts = decoded.split(':');
    return parts[0] || null;
  } catch {
    return null;
  }
};

export const getUserFromToken = (req: Request): User | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  const userId = parseToken(token);
  if (!userId) return null;
  return findById(users, userId) || null;
};

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: '用户名和密码不能为空',
      });
      return;
    }

    const user = users.find(
      (u) => u.username === username && u.password === password,
    );

    if (!user) {
      res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
      return;
    }

    const token = generateToken(user.id);
    const { password: _p, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '登录失败',
    });
  }
});

router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      res.status(401).json({
        success: false,
        message: '未授权或Token无效',
      });
      return;
    }

    const { password: _p, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取用户信息失败',
    });
  }
});

export default router;
