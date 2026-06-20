import { Router, type Request, type Response } from 'express';
import { disputes, tasks, generateId, findById } from '../data/mockData.js';
import { getUserFromToken } from './auth.js';
import type { Dispute } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, initiatorId, taskId, type, page = 1, pageSize = 10 } = req.query;

    let filtered = [...disputes];

    if (status) {
      filtered = filtered.filter((d) => d.status === status);
    }
    if (initiatorId) {
      filtered = filtered.filter((d) => d.initiatorId === initiatorId);
    }
    if (taskId) {
      filtered = filtered.filter((d) => d.taskId === taskId);
    }
    if (type) {
      filtered = filtered.filter((d) => d.type === type);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
          pending: filtered.filter((d) => d.status === 'pending').length,
          reviewing: filtered.filter((d) => d.status === 'reviewing').length,
          resolved: filtered.filter((d) => d.status === 'resolved').length,
          closed: filtered.filter((d) => d.status === 'closed').length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取争议列表失败',
    });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const { taskId, type, description, evidence } = req.body;

    if (!taskId || !type || !description) {
      res.status(400).json({
        success: false,
        message: '任务ID、争议类型、争议描述不能为空',
      });
      return;
    }

    const task = findById(tasks, taskId);
    if (!task) {
      res.status(404).json({ success: false, message: '任务不存在' });
      return;
    }

    if (user.role === 'worker' && task.workerId !== user.id) {
      res.status(403).json({ success: false, message: '无权限对该任务发起争议' });
      return;
    }

    const existingDispute = disputes.find(
      (d) => d.taskId === taskId && d.initiatorId === user.id && (d.status === 'pending' || d.status === 'reviewing'),
    );
    if (existingDispute) {
      res.status(400).json({
        success: false,
        message: '该任务已存在进行中的争议，请等待处理结果',
      });
      return;
    }

    const dispute: Dispute = {
      id: generateId('dsp'),
      initiatorId: user.id,
      taskId,
      type,
      description,
      evidence: evidence || [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    disputes.unshift(dispute);

    res.status(201).json({
      success: true,
      data: dispute,
      message: '争议申请已提交，平台将尽快处理',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '发起争议失败',
    });
  }
});

router.post('/:id/resolve', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ success: false, message: '无权限进行平台仲裁' });
      return;
    }

    const { id } = req.params;
    const { resolution, close = true } = req.body;

    if (!resolution) {
      res.status(400).json({
        success: false,
        message: '请填写仲裁处理结果',
      });
      return;
    }

    const dispute = findById(disputes, id);

    if (!dispute) {
      res.status(404).json({ success: false, message: '争议不存在' });
      return;
    }

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      res.status(400).json({
        success: false,
        message: '该争议已处理完成',
      });
      return;
    }

    dispute.resolution = resolution;
    dispute.resolvedAt = new Date().toISOString();
    dispute.status = close ? 'resolved' : 'reviewing';

    res.status(200).json({
      success: true,
      data: {
        id: dispute.id,
        status: dispute.status,
        resolution: dispute.resolution,
        resolvedAt: dispute.resolvedAt,
        arbiterId: user.id,
        arbiterName: user.name,
      },
      message: `争议${close ? '已处理完成' : '处理中，等待确认'}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '争议仲裁处理失败',
    });
  }
});

export default router;
