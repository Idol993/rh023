import { Router, type Request, type Response } from 'express';
import { riskFlags, findById } from '../data/mockData.js';
import { getUserFromToken } from './auth.js';
import type { RiskFlag } from '../../shared/types.js';

const router = Router();

router.get('/warnings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, status, workerId, taskId, page = 1, pageSize = 10 } = req.query;

    let filtered = [...riskFlags];

    if (level) {
      filtered = filtered.filter((r) => r.level === level);
    }
    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (workerId) {
      filtered = filtered.filter((r) => r.workerId === workerId);
    }
    if (taskId) {
      filtered = filtered.filter((r) => r.taskId === taskId);
    }

    filtered.sort((a, b) => {
      const levelOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      if (levelOrder[a.level] !== levelOrder[b.level]) {
        return levelOrder[a.level] - levelOrder[b.level];
      }
      return new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime();
    });

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
        summary: {
          total: filtered.length,
          pending: filtered.filter((r) => r.status === 'pending').length,
          reviewing: filtered.filter((r) => r.status === 'reviewing').length,
          reviewed: filtered.filter((r) => r.status === 'reviewed').length,
          cleared: filtered.filter((r) => r.status === 'cleared').length,
          high: filtered.filter((r) => r.level === 'high').length,
          medium: filtered.filter((r) => r.level === 'medium').length,
          low: filtered.filter((r) => r.level === 'low').length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取风控预警列表失败',
    });
  }
});

router.post('/warnings/:id/review', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    if (user.role !== 'admin' && user.role !== 'hr' && user.role !== 'finance') {
      res.status(403).json({ success: false, message: '无权限审核风控预警' });
      return;
    }

    const { id } = req.params;
    const { action, comment } = req.body;

    if (!action || !['review', 'clear', 'pending'].includes(action)) {
      res.status(400).json({
        success: false,
        message: '审核操作无效（review/clear/pending）',
      });
      return;
    }

    const warning = findById(riskFlags, id);

    if (!warning) {
      res.status(404).json({ success: false, message: '风控预警不存在' });
      return;
    }

    if (warning.status === 'cleared') {
      res.status(400).json({ success: false, message: '预警已解除，无法再次审核' });
      return;
    }

    let newStatus: RiskFlag['status'];
    let message = '';

    switch (action) {
      case 'review':
        newStatus = 'reviewed';
        message = '预警已审核';
        break;
      case 'clear':
        newStatus = 'cleared';
        message = '预警已解除';
        break;
      case 'pending':
        newStatus = 'reviewing';
        message = '已标记为审核中';
        break;
      default:
        newStatus = warning.status;
    }

    warning.status = newStatus;
    warning.reviewerId = user.id;
    warning.reviewComment = comment || '';

    res.status(200).json({
      success: true,
      data: {
        id: warning.id,
        status: warning.status,
        reviewerId: user.id,
        reviewerName: user.name,
        reviewComment: warning.reviewComment,
      },
      message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '风控预警审核失败',
    });
  }
});

export default router;
