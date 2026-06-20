import { Router, type Request, type Response } from 'express';
import { tasks, jobPosts, generateId, findById } from '../data/mockData.js';
import { getUserFromToken } from './auth.js';
import type { CheckIn, TaskSubmission } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, workerId, companyId, page = 1, pageSize = 10 } = req.query;

    let filtered = [...tasks];

    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (workerId) {
      filtered = filtered.filter((t) => t.workerId === workerId);
    }
    if (companyId) {
      filtered = filtered.filter((t) => {
        const job = findById(jobPosts, t.jobId);
        return job && job.companyId === companyId;
      });
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
      message: error instanceof Error ? error.message : '获取任务列表失败',
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = findById(tasks, id);

    if (!task) {
      res.status(404).json({ success: false, message: '任务不存在' });
      return;
    }

    const job = findById(jobPosts, task.jobId);

    res.status(200).json({
      success: true,
      data: {
        ...task,
        job,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取任务详情失败',
    });
  }
});

router.post('/:id/checkin', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const { id } = req.params;
    const { type, location, photoUrl } = req.body;

    if (!type || !['checkin', 'checkout'].includes(type)) {
      res.status(400).json({ success: false, message: '打卡类型无效（checkin/checkout）' });
      return;
    }
    if (!location || !location.lat || !location.lng) {
      res.status(400).json({ success: false, message: '打卡位置信息不完整' });
      return;
    }

    const task = findById(tasks, id);
    if (!task) {
      res.status(404).json({ success: false, message: '任务不存在' });
      return;
    }

    if (task.workerId !== user.id && user.role !== 'admin') {
      res.status(403).json({ success: false, message: '无权限操作此任务' });
      return;
    }

    if (task.status === 'completed') {
      res.status(400).json({ success: false, message: '任务已完成，无法打卡' });
      return;
    }

    const job = findById(jobPosts, task.jobId);
    let locationValid = false;
    if (job) {
      const R = 6371000;
      const phi1 = (job.workLocation.lat * Math.PI) / 180;
      const phi2 = (location.lat * Math.PI) / 180;
      const dphi = ((location.lat - job.workLocation.lat) * Math.PI) / 180;
      const dlambda = ((location.lng - job.workLocation.lng) * Math.PI) / 180;
      const a =
        Math.sin(dphi / 2) ** 2 +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      locationValid = distance <= job.workLocation.radius;
    } else {
      locationValid = true;
    }

    const checkIn: CheckIn = {
      id: generateId('cin'),
      taskId: id,
      workerId: user.id,
      type: type as 'checkin' | 'checkout',
      timestamp: new Date().toISOString(),
      location: { lat: location.lat, lng: location.lng },
      locationValid,
      photoUrl: photoUrl || undefined,
      photoValid: !!photoUrl,
    };

    task.checkIns.push(checkIn);

    if (task.status === 'pending' && type === 'checkin') {
      task.status = 'in_progress';
    }

    if (!locationValid) {
      const riskFlagId = generateId('rf');
      task.riskFlags.push(riskFlagId);
    }

    res.status(201).json({
      success: true,
      data: checkIn,
      message: `${type === 'checkin' ? '上班' : '下班'}打卡成功${locationValid ? '' : '（打卡位置超出范围，已标记风险）'}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '打卡失败',
    });
  }
});

router.post('/:id/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const { id } = req.params;
    const { count, images, description } = req.body;

    const task = findById(tasks, id);
    if (!task) {
      res.status(404).json({ success: false, message: '任务不存在' });
      return;
    }

    if (task.workerId !== user.id && user.role !== 'admin') {
      res.status(403).json({ success: false, message: '无权限操作此任务' });
      return;
    }

    if (task.status === 'completed') {
      res.status(400).json({ success: false, message: '任务已完成，无法提交' });
      return;
    }

    const job = findById(jobPosts, task.jobId);
    const isPiecework = job?.type === 'piecework';

    if (isPiecework && (count === undefined || count === null || count < 0)) {
      res.status(400).json({ success: false, message: '计件任务需提交有效数量' });
      return;
    }

    const submission: TaskSubmission = {
      id: generateId('sub'),
      taskId: id,
      count: isPiecework ? count : 0,
      images: images || [],
      description: description || '',
      submittedAt: new Date().toISOString(),
    };

    if (!task.submissions) {
      task.submissions = [];
    }
    task.submissions.push(submission);

    if (isPiecework && count) {
      task.pieceCount = (task.pieceCount || 0) + count;
    }

    task.status = 'pending_review';

    res.status(201).json({
      success: true,
      data: submission,
      message: '任务提交成功，等待验收',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '任务提交失败',
    });
  }
});

router.post('/:id/review', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    if (user.role === 'worker') {
      res.status(403).json({ success: false, message: '无权限进行任务验收' });
      return;
    }

    const { id } = req.params;
    const { result, comment } = req.body;

    if (!result || !['pass', 'reject'].includes(result)) {
      res.status(400).json({ success: false, message: '验收结果无效（pass/reject）' });
      return;
    }

    const task = findById(tasks, id);
    if (!task) {
      res.status(404).json({ success: false, message: '任务不存在' });
      return;
    }

    if (task.status !== 'pending_review' && task.status !== 'abnormal') {
      res.status(400).json({ success: false, message: '当前任务状态无法验收' });
      return;
    }

    task.reviewResult = result;
    task.reviewComment = comment || '';

    if (result === 'pass') {
      task.status = 'completed';
    } else {
      task.status = 'abnormal';
    }

    res.status(200).json({
      success: true,
      data: {
        taskId: id,
        result,
        comment,
        status: task.status,
      },
      message: `任务验收${result === 'pass' ? '通过' : '驳回'}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '任务验收失败',
    });
  }
});

export default router;
