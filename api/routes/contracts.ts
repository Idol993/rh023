import { Router, type Request, type Response } from 'express';
import { contracts, generateId, findById } from '../data/mockData.js';
import { getUserFromToken } from './auth.js';
import type { Contract } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId, workerId, status, page = 1, pageSize = 10 } = req.query;

    let filtered = [...contracts];

    if (companyId) {
      filtered = filtered.filter((c) => c.companyId === companyId);
    }
    if (workerId) {
      filtered = filtered.filter((c) => c.workerId === workerId);
    }
    if (status) {
      filtered = filtered.filter((c) => c.status === status);
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
      message: error instanceof Error ? error.message : '获取协议列表失败',
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const contract = findById(contracts, id);

    if (!contract) {
      res.status(404).json({ success: false, message: '协议不存在' });
      return;
    }

    res.status(200).json({
      success: true,
      data: contract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取协议详情失败',
    });
  }
});

router.post('/:id/sign', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const { id } = req.params;
    const { party } = req.body;

    if (!party || !['company', 'worker', 'platform'].includes(party)) {
      res
        .status(400)
        .json({ success: false, message: '签署方参数无效（company/worker/platform）' });
      return;
    }

    const contract = findById(contracts, id);

    if (!contract) {
      res.status(404).json({ success: false, message: '协议不存在' });
      return;
    }

    if (contract.status === 'deposited') {
      res.status(400).json({ success: false, message: '协议已存证，不可再签署' });
      return;
    }

    if (party === 'company') {
      if (contract.companySigned) {
        res.status(400).json({ success: false, message: '企业方已签署' });
        return;
      }
      if (user.role !== 'hr' && user.role !== 'finance' && user.role !== 'admin') {
        res.status(403).json({ success: false, message: '无权限代表企业签署' });
        return;
      }
      contract.companySigned = true;
    } else if (party === 'worker') {
      if (contract.workerSigned) {
        res.status(400).json({ success: false, message: '劳动者已签署' });
        return;
      }
      if (contract.workerId !== user.id && user.role !== 'admin') {
        res.status(403).json({ success: false, message: '无权限代表该劳动者签署' });
        return;
      }
      contract.workerSigned = true;
    } else if (party === 'platform') {
      if (contract.platformSigned) {
        res.status(400).json({ success: false, message: '平台方已签署' });
        return;
      }
      if (user.role !== 'admin') {
        res.status(403).json({ success: false, message: '无权限代表平台签署' });
        return;
      }
      contract.platformSigned = true;
    }

    if (contract.companySigned && contract.workerSigned) {
      if (contract.platformSigned) {
        contract.status = 'signed';
        contract.signedAt = new Date().toISOString();
      } else {
        contract.status = 'signing';
      }
    } else {
      contract.status = 'draft';
    }

    res.status(200).json({
      success: true,
      data: contract,
      message: `${party === 'company' ? '企业方' : party === 'worker' ? '劳动者' : '平台方'}签署成功`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '签署协议失败',
    });
  }
});

router.get('/:id/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const contract = findById(contracts, id);

    if (!contract) {
      res.status(404).json({ success: false, message: '协议不存在' });
      return;
    }

    if (contract.status === 'draft') {
      res.status(200).json({
        success: true,
        data: {
          contractId: contract.id,
          verified: false,
          signed: false,
          deposited: false,
          signatures: {
            company: contract.companySigned,
            worker: contract.workerSigned,
            platform: contract.platformSigned,
          },
          blockchainHash: null,
          depositNo: null,
          timestamp: null,
          message: '协议尚未签署完成',
        },
      });
      return;
    }

    const fullySigned = contract.companySigned && contract.workerSigned && contract.platformSigned;
    const deposited = contract.status === 'deposited';

    if (fullySigned && !contract.blockchainHash) {
      contract.blockchainHash = `0x${generateId('').slice(3)}${Date.now().toString(16)}`.padEnd(66, '0').slice(0, 66);
    }
    if (deposited && !contract.depositNo) {
      contract.depositNo = `DEP${Date.now().toString().slice(-10)}`;
    }

    res.status(200).json({
      success: true,
      data: {
        contractId: contract.id,
        verified: fullySigned,
        signed: fullySigned,
        deposited,
        signatures: {
          company: contract.companySigned,
          worker: contract.workerSigned,
          platform: contract.platformSigned,
        },
        blockchainHash: contract.blockchainHash || null,
        depositNo: contract.depositNo || null,
        timestamp: contract.signedAt || null,
        message: fullySigned
          ? deposited
            ? '协议已完成签署并完成区块链存证'
            : '协议已完成签署，正在进行区块链存证'
          : '协议签署未完成',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '验签查询失败',
    });
  }
});

export default router;
