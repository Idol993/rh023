import { Router, type Request, type Response } from 'express';
import {
  jobPosts,
  matchResults,
  users,
  generateId,
  findById,
} from '../data/mockData.js';
import { getUserFromToken } from './auth.js';
import type { JobPost, MatchResult } from '../../shared/types.js';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const {
      companyId,
      title,
      type,
      content,
      startDate,
      endDate,
      hourlyRate,
      pieceRate,
      workLocation,
      skills,
      requirements,
      acceptanceCriteria,
    } = req.body;

    if (!companyId || !title || !type || !content || !startDate || !endDate) {
      res
        .status(400)
        .json({ success: false, message: '缺少必要的需求信息' });
      return;
    }

    if (type === 'hourly' && !hourlyRate) {
      res.status(400).json({ success: false, message: '计时制需提供时薪' });
      return;
    }
    if (type === 'piecework' && !pieceRate) {
      res.status(400).json({ success: false, message: '计件制需提供计件单价' });
      return;
    }

    const newJob: JobPost = {
      id: generateId('job'),
      companyId,
      title,
      type: type as 'hourly' | 'piecework',
      content,
      startDate,
      endDate,
      hourlyRate: type === 'hourly' ? hourlyRate : undefined,
      pieceRate: type === 'piecework' ? pieceRate : undefined,
      workLocation: workLocation || {
        lat: 31.2304,
        lng: 121.4737,
        address: '上海市',
        radius: 500,
      },
      skills: skills || [],
      requirements: requirements || [],
      acceptanceCriteria: acceptanceCriteria || [],
      status: 'published',
      createdAt: new Date().toISOString(),
    };

    jobPosts.unshift(newJob);

    res.status(201).json({
      success: true,
      data: newJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '发布需求失败',
    });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId, status, type, page = 1, pageSize = 10 } = req.query;

    let filtered = [...jobPosts];

    if (companyId) {
      filtered = filtered.filter((j) => j.companyId === companyId);
    }
    if (status) {
      filtered = filtered.filter((j) => j.status === status);
    }
    if (type) {
      filtered = filtered.filter((j) => j.type === type);
    }

    const pageNum = parseInt(String(page), 10);
    const sizeNum = parseInt(String(pageSize), 10);
    const start = (pageNum - 1) * sizeNum;
    const end = start + sizeNum;
    const paginated = filtered.slice(start, end);

    res.status(200).json({
      success: true,
      data: {
        list: paginated,
        total: filtered.length,
        page: pageNum,
        pageSize: sizeNum,
        totalPages: Math.ceil(filtered.length / sizeNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取需求列表失败',
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = findById(jobPosts, id);

    if (!job) {
      res.status(404).json({ success: false, message: '需求不存在' });
      return;
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取需求详情失败',
    });
  }
});

router.get('/:id/match', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = findById(jobPosts, id);

    if (!job) {
      res.status(404).json({ success: false, message: '需求不存在' });
      return;
    }

    const matches = matchResults
      .filter((m) => m.jobId === id)
      .map((m) => {
        const worker = findById(users, m.workerId);
        const { password: _p, ...workerWithoutPassword } = worker || ({} as any);
        return {
          ...m,
          worker: worker ? workerWithoutPassword : undefined,
        } as MatchResult;
      })
      .sort((a, b) => b.totalScore - a.totalScore);

    res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取匹配候选人失败',
    });
  }
});

router.post('/:id/apply', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    if (user.role !== 'worker') {
      res.status(403).json({ success: false, message: '只有灵活用工者可以接单' });
      return;
    }

    const { id } = req.params;
    const job = findById(jobPosts, id);

    if (!job) {
      res.status(404).json({ success: false, message: '需求不存在' });
      return;
    }

    if (job.status === 'completed') {
      res.status(400).json({ success: false, message: '该需求已完成，无法接单' });
      return;
    }

    const existingMatch = matchResults.find(
      (m) => m.jobId === id && m.workerId === user.id,
    );

    if (existingMatch) {
      if (existingMatch.status === 'accepted') {
        res.status(400).json({ success: false, message: '您已接受该需求' });
        return;
      }
      existingMatch.status = 'accepted';
      res.status(200).json({
        success: true,
        data: existingMatch,
        message: '接单成功',
      });
      return;
    }

    const newMatch: MatchResult = {
      id: generateId('mtc'),
      jobId: id,
      workerId: user.id,
      skillMatchScore: 80,
      distanceKm: 5,
      ratingScore: Math.round(user.rating * 20),
      acceptRateScore: Math.round(user.acceptRate * 100),
      totalScore: 85,
      status: 'accepted',
    };

    matchResults.push(newMatch);

    if (job.status === 'published' || job.status === 'matched') {
      job.status = 'in_progress';
    }

    res.status(201).json({
      success: true,
      data: newMatch,
      message: '接单成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '接单失败',
    });
  }
});

export default router;
