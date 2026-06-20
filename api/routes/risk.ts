import { Router, type Request, type Response } from 'express';
import { riskFlags, findById, users, tasks, jobPosts, settlements } from '../data/mockData.js';
import { getUserFromToken } from './auth.js';
import type { RiskFlag, CheckIn } from '../../shared/types.js';

const router = Router();

router.get('/warnings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, status, type, workerId, taskId, page = 1, pageSize = 10 } = req.query;

    let filtered = [...riskFlags];

    if (level) {
      filtered = filtered.filter((r) => r.level === level);
    }
    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (type) {
      filtered = filtered.filter((r) => r.type === type);
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

    const enrichedList = filtered.map((flag) => {
      const worker = flag.workerId ? findById(users, flag.workerId) : undefined;
      const task = flag.taskId ? findById(tasks, flag.taskId) : undefined;
      const job = task ? findById(jobPosts, task.jobId) : undefined;

      let locationInfo: {
        checkInLat?: number;
        checkInLng?: number;
        workLocationLat?: number;
        workLocationLng?: number;
        distanceKm?: number;
        radiusKm?: number;
      } | undefined;

      let relatedCheckIn: {
        timestamp?: string;
        photoUrl?: string;
        type?: string;
      } | undefined;

      if (task) {
        const flagTime = new Date(flag.triggeredAt).getTime();
        let closestCheckIn: CheckIn | undefined;
        let minDiff = Infinity;

        for (const ci of task.checkIns) {
          const ciTime = new Date(ci.timestamp).getTime();
          const diff = Math.abs(ciTime - flagTime);
          if (diff < minDiff && diff < 24 * 60 * 60 * 1000) {
            minDiff = diff;
            closestCheckIn = ci;
          }
        }

        if (flag.type === 'location_abnormal' && closestCheckIn && job) {
          const R = 6371;
          const dLat = ((closestCheckIn.location.lat - job.workLocation.lat) * Math.PI) / 180;
          const dLng = ((closestCheckIn.location.lng - job.workLocation.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((job.workLocation.lat * Math.PI) / 180) * Math.cos((closestCheckIn.location.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distanceKm = R * c;

          locationInfo = {
            checkInLat: closestCheckIn.location.lat,
            checkInLng: closestCheckIn.location.lng,
            workLocationLat: job.workLocation.lat,
            workLocationLng: job.workLocation.lng,
            distanceKm: parseFloat(distanceKm.toFixed(2)),
            radiusKm: parseFloat((job.workLocation.radius / 1000).toFixed(2)),
          };
        }

        if (closestCheckIn) {
          relatedCheckIn = {
            timestamp: closestCheckIn.timestamp,
            photoUrl: closestCheckIn.photoUrl,
            type: closestCheckIn.type,
          };
        }
      }

      const reviewer = flag.reviewerId ? findById(users, flag.reviewerId) : undefined;

      return {
        ...flag,
        workerName: worker?.name,
        workerPhone: worker?.phone,
        taskTitle: job?.title,
        taskStatus: task?.status,
        locationInfo,
        checkIn: relatedCheckIn,
        reviewerName: reviewer?.name,
      };
    });

    const pageNum = parseInt(String(page), 10);
    const sizeNum = parseInt(String(pageSize), 10);
    const start = (pageNum - 1) * sizeNum;
    const end = start + sizeNum;
    const paginated = enrichedList.slice(start, end);

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
    const { action, comment, reviewerId } = req.body;

    if (!action || !['approve', 'reject', 'clear'].includes(action)) {
      res.status(400).json({
        success: false,
        message: '审核操作无效（approve/reject/clear）',
      });
      return;
    }

    const warning = findById(riskFlags, id);

    if (!warning) {
      res.status(404).json({ success: false, message: '风控预警不存在' });
      return;
    }

    if (warning.status === 'cleared' || warning.status === 'reviewed') {
      res.status(400).json({ success: false, message: '预警已完成审核，无法再次操作' });
      return;
    }

    const task = warning.taskId ? findById(tasks, warning.taskId) : undefined;
    const reviewerIdToUse = reviewerId || user.id;
    const reviewer = findById(users, reviewerIdToUse);

    switch (action) {
      case 'clear': {
        warning.status = 'cleared';
        warning.reviewerId = reviewerIdToUse;
        warning.reviewComment = comment || '';

        let message = '风控已解除，仍有其他预警，任务保持异常';

        if (task) {
          const hasOtherActiveRisk = task.riskFlags.some((rfId) => {
            const rf = findById(riskFlags, rfId);
            return rf && rf.id !== warning.id && (rf.status === 'pending' || rf.status === 'reviewing');
          });

          if (!hasOtherActiveRisk) {
            if (task.status === 'abnormal') {
              task.status = 'in_progress';
              message = '风控已解除，任务已恢复为进行中';
            } else if (task.status === 'pending' && task.checkIns.length > 0) {
              task.status = 'in_progress';
              message = '风控已解除，任务已恢复为进行中';
            }
          }
        }

        res.status(200).json({
          success: true,
          data: {
            ...warning,
            reviewerName: reviewer?.name,
            taskStatus: task?.status,
          },
          message,
        });
        break;
      }

      case 'approve': {
        warning.status = 'reviewed';
        warning.reviewerId = reviewerIdToUse;
        warning.reviewComment = comment || '';

        let settlementSuspended = false;

        if (task) {
          if (task.status === 'pending' || task.status === 'in_progress') {
            task.status = 'abnormal';
          }

          const relatedSettlement = settlements.find((s) => s.taskId === task.id);
          if (relatedSettlement && relatedSettlement.status !== 'paid') {
            relatedSettlement.status = 'pending';
            settlementSuspended = true;
          }
        }

        res.status(200).json({
          success: true,
          data: {
            ...warning,
            reviewerName: reviewer?.name,
            taskStatus: task?.status,
            settlementSuspended,
          },
          message: settlementSuspended
            ? '已确认风险，任务保持异常状态，结算已暂停'
            : '已确认风险，任务保持异常状态',
        });
        break;
      }

      case 'reject': {
        warning.status = 'reviewing';
        warning.reviewerId = reviewerIdToUse;
        warning.reviewComment = comment || '';

        res.status(200).json({
          success: true,
          data: {
            ...warning,
            reviewerName: reviewer?.name,
          },
          message: '已转交高级审核员处理',
        });
        break;
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '风控预警审核失败',
    });
  }
});

export default router;
