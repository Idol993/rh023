import { Router, type Request, type Response } from 'express';
import { tasks, jobPosts, generateId, findById, riskFlags } from '../data/mockData.js';
import { getUserFromToken } from './auth.js';
import type { CheckIn, TaskSubmission, RiskFlag } from '../../shared/types.js';

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

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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
    let distanceKm = 0;
    let locationValid = true;

    if (job) {
      distanceKm = calculateDistance(
        job.workLocation.lat,
        job.workLocation.lng,
        location.lat,
        location.lng
      );
      const radiusKm = job.workLocation.radius / 1000;
      locationValid = distanceKm <= radiusKm;
    }

    const now = new Date();
    const timestamp = now.toISOString();

    const checkIn: CheckIn = {
      id: generateId('cin'),
      taskId: id,
      workerId: user.id,
      type: type as 'checkin' | 'checkout',
      timestamp,
      location: { lat: location.lat, lng: location.lng },
      locationValid,
      photoUrl: photoUrl || undefined,
      photoValid: !!photoUrl,
    };

    const triggeredRiskFlagIds: string[] = [];
    let locationAbnormal = false;
    let locationRiskFlagId: string | undefined;

    if (!locationValid && job) {
      const radiusKm = job.workLocation.radius / 1000;
      const riskFlag: RiskFlag = {
        id: generateId('RSK'),
        taskId: id,
        workerId: task.workerId,
        type: 'location_abnormal',
        level: 'high',
        description: `打卡位置异常，实际打卡地点与工作地点相距${distanceKm.toFixed(2)}km，超出允许范围${radiusKm.toFixed(2)}km`,
        triggeredAt: timestamp,
        status: 'pending',
      };
      riskFlags.push(riskFlag);
      if (!task.riskFlags.includes(riskFlag.id)) {
        task.riskFlags.push(riskFlag.id);
      }
      if (task.status === 'in_progress') {
        task.status = 'abnormal';
      }
      triggeredRiskFlagIds.push(riskFlag.id);
      locationAbnormal = true;
      locationRiskFlagId = riskFlag.id;
    }

    const today = now.toISOString().split('T')[0];
    const workerTodayCheckIns: CheckIn[] = [];
    for (const t of tasks) {
      if (t.workerId === user.id) {
        for (const ci of t.checkIns) {
          if (ci.timestamp.split('T')[0] === today) {
            workerTodayCheckIns.push(ci);
          }
        }
      }
    }
    workerTodayCheckIns.push(checkIn);

    let totalMinutes = 0;
    const checkinsByDay: Record<string, CheckIn[]> = {};
    for (const ci of workerTodayCheckIns) {
      const day = ci.timestamp.split('T')[0];
      if (!checkinsByDay[day]) checkinsByDay[day] = [];
      checkinsByDay[day].push(ci);
    }
    for (const day of Object.keys(checkinsByDay)) {
      const dayCheckins = [...checkinsByDay[day]].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      let lastCheckin: CheckIn | null = null;
      for (const ci of dayCheckins) {
        if (ci.type === 'checkin') {
          lastCheckin = ci;
        } else if (ci.type === 'checkout' && lastCheckin) {
          const diffMs = new Date(ci.timestamp).getTime() - new Date(lastCheckin.timestamp).getTime();
          totalMinutes += diffMs / (1000 * 60);
          lastCheckin = null;
        }
      }
    }
    const totalHours = totalMinutes / 60;
    if (totalHours > 12) {
      const existingSuspicious = riskFlags.find(
        (r) => r.type === 'suspicious_hours' && r.workerId === user.id && r.triggeredAt.split('T')[0] === today
      );
      if (!existingSuspicious) {
        const riskFlag: RiskFlag = {
          id: generateId('RSK'),
          taskId: id,
          workerId: task.workerId,
          type: 'suspicious_hours',
          level: 'high',
          description: '异常工时，当日累计工时超过12小时上限',
          triggeredAt: timestamp,
          status: 'pending',
        };
        riskFlags.push(riskFlag);
        if (!task.riskFlags.includes(riskFlag.id)) {
          task.riskFlags.push(riskFlag.id);
        }
        triggeredRiskFlagIds.push(riskFlag.id);
      }
    }

    if (photoUrl) {
      let foundDuplicate = false;
      for (const t of tasks) {
        if (t.workerId === user.id) {
          for (const ci of t.checkIns) {
            if (ci.photoUrl === photoUrl && ci.id !== checkIn.id) {
              foundDuplicate = true;
              break;
            }
          }
        }
        if (foundDuplicate) break;
      }
      if (foundDuplicate) {
        const existingDuplicate = riskFlags.find(
          (r) => r.type === 'photo_duplicate' && r.workerId === user.id && r.taskId === id
        );
        if (!existingDuplicate) {
          const riskFlag: RiskFlag = {
            id: generateId('RSK'),
            taskId: id,
            workerId: task.workerId,
            type: 'photo_duplicate',
            level: 'medium',
            description: '打卡照片重复，疑似使用历史照片进行打卡',
            triggeredAt: timestamp,
            status: 'pending',
          };
          riskFlags.push(riskFlag);
          if (!task.riskFlags.includes(riskFlag.id)) {
            task.riskFlags.push(riskFlag.id);
          }
          triggeredRiskFlagIds.push(riskFlag.id);
        }
      }
    }

    task.checkIns.push(checkIn);

    if (task.status === 'pending' && type === 'checkin') {
      task.status = 'in_progress';
    }

    res.status(201).json({
      success: true,
      data: {
        checkIn,
        locationAbnormal,
        riskFlagId: locationRiskFlagId,
        triggeredRiskFlagIds,
      },
      message: `${type === 'checkin' ? '上班' : '下班'}打卡成功${locationValid ? '' : '（打卡位置超出范围，已触发风控预警）'}${triggeredRiskFlagIds.length > 0 && locationValid ? '（已触发风控预警，请留意）' : ''}`,
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
