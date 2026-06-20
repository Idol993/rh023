import { Router, type Request, type Response } from 'express';
import { invoices, settlements, findById } from '../data/mockData.js';
import { getUserFromToken } from './auth.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { settlementId, workerId, companyId, page = 1, pageSize = 10 } = req.query;

    let filtered = [...invoices];

    if (settlementId) {
      filtered = filtered.filter((i) => i.settlementId === settlementId);
    }
    if (workerId || companyId) {
      filtered = filtered.filter((i) => {
        const settlement = findById(settlements, i.settlementId);
        if (!settlement) return false;
        if (workerId && settlement.workerId !== workerId) return false;
        if (companyId && settlement.companyId !== companyId) return false;
        return true;
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
      message: error instanceof Error ? error.message : '获取发票列表失败',
    });
  }
});

router.get('/:id/download', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const { id } = req.params;
    const invoice = findById(invoices, id);

    if (!invoice) {
      res.status(404).json({ success: false, message: '发票不存在' });
      return;
    }

    const settlement = findById(settlements, invoice.settlementId);
    if (settlement) {
      if (user.role === 'worker' && settlement.workerId !== user.id) {
        res.status(403).json({ success: false, message: '无权限下载此发票' });
        return;
      }
      if ((user.role === 'hr' || user.role === 'finance') && user.companyId && settlement.companyId !== user.companyId) {
        res.status(403).json({ success: false, message: '无权限下载此发票' });
        return;
      }
    }

    const timestamp = Date.now();
    const token = Buffer.from(`${id}:${timestamp}:download`).toString('base64');
    const downloadUrl = `${invoice.pdfUrl}?token=${token}&t=${timestamp}`;

    res.status(200).json({
      success: true,
      data: {
        downloadUrl,
        invoiceNo: invoice.invoiceNo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '发票下载失败',
    });
  }
});

export default router;
