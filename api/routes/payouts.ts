import { Router, type Request, type Response } from 'express';
import {
  payouts,
  settlements,
  users,
  generateId,
  findById,
} from '../data/mockData.js';
import { getUserFromToken } from './auth.js';
import type { Payout } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, settlementId, workerId, page = 1, pageSize = 10 } = req.query;

    let filtered = [...payouts];

    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }
    if (settlementId) {
      filtered = filtered.filter((p) => p.settlementId === settlementId);
    }
    if (workerId) {
      filtered = filtered.filter((p) => {
        const settlement = findById(settlements, p.settlementId);
        return settlement && settlement.workerId === workerId;
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
      message: error instanceof Error ? error.message : '获取发放列表失败',
    });
  }
});

router.post('/batch', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    if (user.role !== 'finance' && user.role !== 'admin') {
      res.status(403).json({ success: false, message: '无权限发起批量发放' });
      return;
    }

    const { settlementIds } = req.body;

    if (!Array.isArray(settlementIds) || settlementIds.length === 0) {
      res.status(400).json({ success: false, message: '请选择要发放的结算单' });
      return;
    }

    const results: { success: boolean; settlementId: string; payoutId?: string; message: string }[] = [];

    for (const settlementId of settlementIds) {
      try {
        const settlement = findById(settlements, settlementId);

        if (!settlement) {
          results.push({ success: false, settlementId, message: '结算单不存在' });
          continue;
        }

        if (settlement.status !== 'confirmed') {
          results.push({
            success: false,
            settlementId,
            message: `结算单状态为${settlement.status}，无法发放`,
          });
          continue;
        }

        const worker = findById(users, settlement.workerId);
        if (!worker) {
          results.push({ success: false, settlementId, message: '劳动者信息不存在' });
          continue;
        }

        const existingPayout = payouts.find((p) => p.settlementId === settlementId && p.status !== 'failed');
        if (existingPayout) {
          results.push({
            success: false,
            settlementId,
            message: `已存在发放记录（${existingPayout.id}）`,
          });
          continue;
        }

        const payout: Payout = {
          id: generateId('pay'),
          settlementId,
          amount: settlement.netAmount,
          bankAccount: worker.bankAccount,
          bankName: worker.bankName,
          accountName: worker.name,
          status: 'processing',
          retryCount: 0,
        };

        payouts.push(payout);
        settlement.status = 'paid';

        results.push({
          success: true,
          settlementId,
          payoutId: payout.id,
          message: '发放已提交',
        });
      } catch (err) {
        results.push({
          success: false,
          settlementId,
          message: err instanceof Error ? err.message : '处理失败',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.length - successCount;

    res.status(200).json({
      success: true,
      data: {
        total: results.length,
        success: successCount,
        failed: failCount,
        details: results,
      },
      message: `批量发放完成：成功${successCount}笔，失败${failCount}笔`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '批量发放失败',
    });
  }
});

router.post('/:id/retry', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    if (user.role !== 'finance' && user.role !== 'admin') {
      res.status(403).json({ success: false, message: '无权限重试发放' });
      return;
    }

    const { id } = req.params;
    const payout = findById(payouts, id);

    if (!payout) {
      res.status(404).json({ success: false, message: '发放记录不存在' });
      return;
    }

    if (payout.status !== 'failed') {
      res.status(400).json({
        success: false,
        message: `当前状态（${payout.status}）无需重试`,
      });
      return;
    }

    if (payout.retryCount >= 3) {
      res.status(400).json({
        success: false,
        message: '重试次数已达上限（3次），请核实银行信息后重新发起',
      });
      return;
    }

    payout.retryCount += 1;
    payout.status = 'processing';
    payout.failReason = undefined;

    const settlement = findById(settlements, payout.settlementId);
    if (settlement && settlement.status === 'failed') {
      settlement.status = 'confirmed';
    }

    res.status(200).json({
      success: true,
      data: payout,
      message: `已发起第${payout.retryCount}次重试`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '发放重试失败',
    });
  }
});

export default router;
