import { Router, type Request, type Response } from 'express';
import {
  settlements,
  tasks,
  jobPosts,
  users,
  generateId,
  findById,
} from '../data/mockData.js';
import { getUserFromToken } from './auth.js';
import type { Settlement, SettlementItem } from '../../shared/types.js';

const router = Router();

const calculateLaborTax = (income: number): { tax: number; bracket: string; taxableIncome: number } => {
  let tax = 0;
  let bracket = '';
  let taxableIncome = 0;

  if (income <= 800) {
    tax = 0;
    bracket = '免税';
    taxableIncome = 0;
  } else if (income <= 4000) {
    taxableIncome = income - 800;
    tax = taxableIncome * 0.2;
    bracket = '20%（800-4000档）';
  } else if (income <= 20000) {
    taxableIncome = income * 0.8;
    tax = taxableIncome * 0.2;
    bracket = '20%（4000-20000档）';
  } else if (income <= 50000) {
    taxableIncome = income * 0.8;
    tax = taxableIncome * 0.3 - 2000;
    bracket = '30%（20000-50000档，加成征收）';
  } else {
    taxableIncome = income * 0.8;
    tax = taxableIncome * 0.4 - 7000;
    bracket = '40%（50000以上档，加成征收）';
  }

  tax = Math.round(tax * 100) / 100;

  return { tax, bracket, taxableIncome };
};

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, workerId, companyId, page = 1, pageSize = 10 } = req.query;

    let filtered = [...settlements];

    if (status) {
      filtered = filtered.filter((s) => s.status === status);
    }
    if (workerId) {
      filtered = filtered.filter((s) => s.workerId === workerId);
    }
    if (companyId) {
      filtered = filtered.filter((s) => s.companyId === companyId);
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
      message: error instanceof Error ? error.message : '获取结算列表失败',
    });
  }
});

router.get('/calculate/:taskId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const task = findById(tasks, taskId);

    if (!task) {
      res.status(404).json({ success: false, message: '任务不存在' });
      return;
    }

    const job = findById(jobPosts, task.jobId);
    if (!job) {
      res.status(404).json({ success: false, message: '关联用工需求不存在' });
      return;
    }

    let baseAmount = 0;
    if (job.type === 'hourly' && task.actualHours) {
      baseAmount = task.actualHours * (job.hourlyRate || 0);
    } else if (job.type === 'piecework' && task.pieceCount) {
      baseAmount = task.pieceCount * (job.pieceRate || 0);
    }
    baseAmount = Math.round(baseAmount * 100) / 100;

    const bonuses: SettlementItem[] = [];
    const deductions: SettlementItem[] = [];

    if (job.type === 'hourly' && task.actualHours && task.actualHours >= 40) {
      bonuses.push({
        id: generateId('sitem'),
        name: '全勤奖',
        amount: 200,
        remark: '周工时满40小时',
      });
    }

    const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

    const totalBeforeTax = Math.round((baseAmount + totalBonuses - totalDeductions) * 100) / 100;

    const { tax, bracket, taxableIncome } = calculateLaborTax(totalBeforeTax);
    const taxRounded = Math.round(tax * 100) / 100;

    const taxDeduction: SettlementItem = {
      id: generateId('sitem'),
      name: '个人所得税',
      amount: taxRounded,
      remark: bracket,
    };
    deductions.push(taxDeduction);

    const totalDeductionsWithTax = deductions.reduce((sum, d) => sum + d.amount, 0);
    const netAmount = Math.round((totalBeforeTax - totalDeductionsWithTax) * 100) / 100;

    res.status(200).json({
      success: true,
      data: {
        taskId,
        workerId: task.workerId,
        companyId: job.companyId,
        baseAmount,
        baseDetail: {
          type: job.type,
          hours: task.actualHours || 0,
          hourlyRate: job.hourlyRate || 0,
          pieceCount: task.pieceCount || 0,
          pieceRate: job.pieceRate || 0,
        },
        bonuses,
        deductions,
        totalBeforeTax,
        taxableIncome: Math.round(taxableIncome * 100) / 100,
        taxAmount: taxRounded,
        taxBracket: bracket,
        taxFormula: {
          rule: '劳务报酬个税计算规则',
          details: [
            '≤800元：免税',
            '800-4000元：(收入-800)×20%',
            '4000-20000元：收入×(1-20%)×20%',
            '20000-50000元：收入×(1-20%)×30%-2000（加成）',
            '>50000元：收入×(1-20%)×40%-7000（加成）',
          ],
        },
        netAmount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '薪税计算失败',
    });
  }
});

router.post('/:id/confirm', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    if (user.role === 'worker') {
      res.status(403).json({ success: false, message: '无权限确认结算' });
      return;
    }

    const { id } = req.params;
    const settlement = findById(settlements, id);

    if (!settlement) {
      res.status(404).json({ success: false, message: '结算不存在' });
      return;
    }

    if (settlement.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: `当前状态（${settlement.status}）无法确认`,
      });
      return;
    }

    if (user.companyId && settlement.companyId !== user.companyId && user.role !== 'admin') {
      res.status(403).json({ success: false, message: '无权限确认该企业的结算' });
      return;
    }

    settlement.status = 'confirmed';
    settlement.confirmedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      data: settlement,
      message: '结算确认成功，等待发放',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '结算确认失败',
    });
  }
});

export default router;
