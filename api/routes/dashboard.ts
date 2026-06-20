import { Router, type Request, type Response } from 'express';
import {
  users,
  companies,
  jobPosts,
  tasks,
  settlements,
  payouts,
  invoices,
  riskFlags,
  contracts,
  disputes,
  findById,
} from '../data/mockData.js';
import { getUserFromToken } from './auth.js';

const router = Router();

router.get('/overview', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);

    const role = user?.role || 'admin';
    const companyId = user?.companyId;
    const workerId = user?.role === 'worker' ? user.id : undefined;

    let cards: Array<{ title: string; value: string | number; unit?: string; change?: number; icon?: string }> = [];
    let recentItems: any[] = [];

    if (role === 'worker') {
      const workerTasks = tasks.filter((t) => t.workerId === workerId);
      const workerSettlements = settlements.filter((s) => s.workerId === workerId);
      const totalEarning = workerSettlements.reduce((sum, s) => sum + (s.status === 'paid' || s.status === 'confirmed' ? s.netAmount : 0), 0);
      const pendingAmount = workerSettlements.filter((s) => s.status === 'pending').reduce((sum, s) => sum + s.netAmount, 0);
      const completedTasks = workerTasks.filter((t) => t.status === 'completed').length;
      const inProgressTasks = workerTasks.filter((t) => t.status === 'in_progress').length;

      cards = [
        { title: '累计收入', value: totalEarning.toFixed(2), unit: '元', change: 12.5 },
        { title: '待结算', value: pendingAmount.toFixed(2), unit: '元', change: 5.3 },
        { title: '进行中任务', value: inProgressTasks, unit: '个' },
        { title: '已完成任务', value: completedTasks, unit: '个', change: 2 },
      ];

      recentItems = workerTasks
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          title: findById(jobPosts, t.jobId)?.title || '任务',
          status: t.status,
          updatedAt: t.checkIns[t.checkIns.length - 1]?.timestamp,
        }));
    } else if (role === 'hr' || role === 'finance') {
      const companyJobs = jobPosts.filter((j) => j.companyId === companyId);
      const companyTaskIds = tasks.filter((t) => {
        const job = findById(jobPosts, t.jobId);
        return job && job.companyId === companyId;
      });
      const companySettlements = settlements.filter((s) => s.companyId === companyId);
      const totalCost = companySettlements.reduce((sum, s) => sum + s.totalBeforeTax, 0);
      const activeWorkers = new Set(companyTaskIds.map((t) => t.workerId)).size;
      const pendingSettlements = companySettlements.filter((s) => s.status === 'pending').length;
      const publishedJobs = companyJobs.filter((j) => j.status === 'published' || j.status === 'in_progress' || j.status === 'matched').length;

      if (role === 'hr') {
        cards = [
          { title: '在用工人数', value: activeWorkers, unit: '人', change: 8 },
          { title: '招聘中需求', value: publishedJobs, unit: '个' },
          { title: '进行中任务', value: companyTaskIds.filter((t) => t.status === 'in_progress').length, unit: '个' },
          { title: '待验收任务', value: companyTaskIds.filter((t) => t.status === 'pending_review').length, unit: '个' },
        ];
      } else {
        cards = [
          { title: '本月支出', value: totalCost.toFixed(2), unit: '元', change: -3.2 },
          { title: '待确认结算', value: pendingSettlements, unit: '笔', change: 2 },
          { title: '已开发票', value: invoices.filter((i) => {
            const s = findById(settlements, i.settlementId);
            return s && s.companyId === companyId;
          }).length, unit: '张' },
          { title: '代征个税', value: companySettlements.reduce((sum, s) => sum + s.taxAmount, 0).toFixed(2), unit: '元' },
        ];
      }

      recentItems = companySettlements
        .slice(0, 5)
        .map((s) => {
          const worker = findById(users, s.workerId);
          return {
            id: s.id,
            workerName: worker?.name || '未知',
            amount: s.netAmount,
            status: s.status,
            createdAt: s.confirmedAt,
          };
        });
    } else {
      const activeWorkers = new Set(tasks.filter((t) => t.status === 'in_progress').map((t) => t.workerId)).size;
      const totalSettled = payouts.filter((p) => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
      const totalTax = settlements.reduce((sum, s) => sum + s.taxAmount, 0);
      const totalInvoiceAmount = invoices.reduce((sum, i) => sum + i.amount, 0);

      cards = [
        { title: '平台注册企业', value: companies.length, unit: '家', change: 1 },
        { title: '认证灵活用工者', value: users.filter((u) => u.role === 'worker').length, unit: '人', change: 5 },
        { title: '当前活跃人数', value: activeWorkers, unit: '人' },
        { title: '累计结算金额', value: totalSettled.toFixed(0), unit: '元', change: 18.6 },
        { title: '代征个税总额', value: totalTax.toFixed(2), unit: '元' },
        { title: '发票累计金额', value: totalInvoiceAmount.toFixed(0), unit: '元' },
        { title: '风险预警待处理', value: riskFlags.filter((r) => r.status === 'pending').length, unit: '条' },
        { title: '发放成功率', value: `${((payouts.filter((p) => p.status === 'success').length / Math.max(payouts.length, 1)) * 100).toFixed(1)}%`, unit: '' },
      ];

      recentItems = riskFlags
        .filter((r) => r.status === 'pending' || r.status === 'reviewing')
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          type: r.type,
          level: r.level,
          description: r.description,
          triggeredAt: r.triggeredAt,
        }));
    }

    res.status(200).json({
      success: true,
      data: {
        role,
        cards,
        recentItems,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取概览数据失败',
    });
  }
});

router.get('/monitor', async (req: Request, res: Response): Promise<void> => {
  try {
    const activeWorkers = new Set(
      tasks.filter((t) => t.status === 'in_progress' || t.status === 'pending_review').map((t) => t.workerId),
    ).size;

    const totalSettled = payouts.filter((p) => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
    const totalTax = settlements.reduce((sum, s) => sum + s.taxAmount, 0);
    const totalInvoice = invoices.reduce((sum, i) => sum + i.amount, 0);
    const companyCount = companies.length;
    const taskCount = tasks.length;
    const warningCount = riskFlags.length;
    const payoutSuccess = payouts.filter((p) => p.status === 'success').length;
    const payoutTotal = payouts.length;
    const payoutSuccessRate = payoutTotal > 0 ? (payoutSuccess / payoutTotal) * 100 : 0;

    const today = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
      return `${d.getMonth() + 1}月`;
    });

    const settlementTrend = months.map((_, i) => Math.round(80000 + Math.random() * 60000 + i * 15000));
    const workerTrend = months.map((_, i) => Math.round(50 + Math.random() * 30 + i * 8));
    const taskTrend = months.map((_, i) => Math.round(30 + Math.random() * 20 + i * 5));

    const riskLevelDist = {
      high: riskFlags.filter((r) => r.level === 'high').length,
      medium: riskFlags.filter((r) => r.level === 'medium').length,
      low: riskFlags.filter((r) => r.level === 'low').length,
    };

    const statusDist = {
      pending: tasks.filter((t) => t.status === 'pending').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      pending_review: tasks.filter((t) => t.status === 'pending_review').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      abnormal: tasks.filter((t) => t.status === 'abnormal').length,
    };

    res.status(200).json({
      success: true,
      data: {
        summary: {
          activeWorkers,
          totalSettled: totalSettled.toFixed(0),
          totalTax: totalTax.toFixed(2),
          totalInvoice: totalInvoice.toFixed(0),
          companyCount,
          taskCount,
          warningCount,
          payoutSuccessRate: payoutSuccessRate.toFixed(1),
        },
        trends: {
          months,
          settlementTrend,
          workerTrend,
          taskTrend,
        },
        distributions: {
          riskLevel: riskLevelDist,
          taskStatus: statusDist,
        },
        topWarnings: riskFlags
          .filter((r) => r.level === 'high')
          .slice(0, 5)
          .map((r) => ({
            id: r.id,
            type: r.type,
            level: r.level,
            description: r.description,
            workerName: findById(users, r.workerId || '')?.name,
            triggeredAt: r.triggeredAt,
          })),
        recentPayouts: payouts
          .slice()
          .sort((a, b) => new Date(b.paidAt || '0').getTime() - new Date(a.paidAt || '0').getTime())
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            accountName: p.accountName,
            amount: p.amount,
            status: p.status,
            paidAt: p.paidAt,
          })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取监管大屏数据失败',
    });
  }
});

router.get('/enterprise', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    const companyId = user?.companyId || (req.query.companyId as string) || 'cmp1001';

    const companyJobs = jobPosts.filter((j) => j.companyId === companyId);
    const companyTasks = tasks.filter((t) => {
      const job = findById(jobPosts, t.jobId);
      return job && job.companyId === companyId;
    });
    const companySettlements = settlements.filter((s) => s.companyId === companyId);
    const companyInvoices = invoices.filter((i) => {
      const s = findById(settlements, i.settlementId);
      return s && s.companyId === companyId;
    });
    const activeWorkers = new Set(companyTasks.filter((t) => t.status === 'in_progress').map((t) => t.workerId)).size;
    const completedTasks = companyTasks.filter((t) => t.status === 'completed').length;
    const totalRemuneration = companySettlements.reduce((sum, s) => sum + s.totalBeforeTax, 0);
    const totalTaxDeclared = companySettlements.reduce((sum, s) => sum + s.taxAmount, 0);
    const totalNetPaid = companySettlements.filter((s) => s.status === 'paid' || s.status === 'confirmed')
      .reduce((sum, s) => sum + s.netAmount, 0);

    const today = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const monthlyCostTrend = months.map((_, i) => ({
      month: months[i],
      cost: Math.round(50000 + Math.random() * 40000 + i * 8000),
      tax: Math.round(3000 + Math.random() * 2000 + i * 500),
    }));

    const riskCount = riskFlags.filter((r) => {
      if (!r.taskId) return false;
      const task = findById(tasks, r.taskId);
      if (!task) return false;
      const job = findById(jobPosts, task.jobId);
      return job && job.companyId === companyId;
    }).length;
    const disputeCount = disputes.filter((d) => {
      const task = findById(tasks, d.taskId);
      if (!task) return false;
      const job = findById(jobPosts, task.jobId);
      return job && job.companyId === companyId;
    }).length;

    const complianceScore = Math.max(0, Math.round(100 - riskCount * 3 - disputeCount * 5 - companyTasks.filter((t) => t.status === 'abnormal').length * 8));

    const completedJobTypes = companyJobs.reduce(
      (acc, j) => {
        if (j.type === 'hourly') acc.hourly += 1;
        else acc.piecework += 1;
        return acc;
      },
      { hourly: 0, piecework: 0 },
    );

    res.status(200).json({
      success: true,
      data: {
        company: findById(companies, companyId) || { id: companyId, name: '企业' },
        cards: [
          { title: '在用工人数', value: activeWorkers, unit: '人', change: 6 },
          { title: '已完成任务', value: completedTasks, unit: '个', change: 12 },
          { title: '累计报酬支出', value: totalRemuneration.toFixed(0), unit: '元', change: 15.3 },
          { title: '已报税金额', value: totalTaxDeclared.toFixed(2), unit: '元' },
          { title: '实际已发放', value: totalNetPaid.toFixed(0), unit: '元' },
          { title: '已开发票', value: companyInvoices.length, unit: '张' },
        ],
        compliance: {
          score: complianceScore,
          level: complianceScore >= 90 ? '优秀' : complianceScore >= 75 ? '良好' : complianceScore >= 60 ? '合格' : '需改进',
          details: {
            riskWarnings: riskCount,
            disputes: disputeCount,
            abnormalTasks: companyTasks.filter((t) => t.status === 'abnormal').length,
            contractSignRate: contracts.filter((c) => c.companyId === companyId && c.status !== 'draft').length /
              Math.max(contracts.filter((c) => c.companyId === companyId).length, 1) * 100,
          },
        },
        monthlyCostTrend,
        jobTypeDist: completedJobTypes,
        recentTasks: companyTasks.slice(0, 5).map((t) => {
          const job = findById(jobPosts, t.jobId);
          const worker = findById(users, t.workerId);
          return {
            id: t.id,
            title: job?.title || '任务',
            workerName: worker?.name || '未知',
            status: t.status,
            amount: findById(settlements, '')?.netAmount || 0,
          };
        }),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取企业看板数据失败',
    });
  }
});

export default router;
