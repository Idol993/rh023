import { Router, type Request, type Response } from 'express';
import {
  taxDeclarations,
  settlements,
  invoices,
  payouts,
  companies,
  users,
  findById,
  generateId,
} from '../data/mockData.js';
import { getUserFromToken } from './auth.js';
import type {
  TaxDeclaration,
  TaxDeclarationWithDetails,
  WorkerTaxDetail,
  TaxDeclarationFullDetail,
  SettlementSummary,
  TaxCertificate,
  FailedSettlement,
  FailedPayout,
  Payout,
  Invoice,
} from '../../shared/types.js';

const router = Router();

const enrichDeclaration = (d: TaxDeclaration): TaxDeclarationWithDetails => {
  const company = findById(companies, d.companyId);
  const periodSettlements = settlements.filter((s) => d.settlementIds.includes(s.id));
  const periodInvoices = invoices.filter((i) => d.invoiceIds.includes(i.id));
  const periodPayouts = payouts.filter((p) => d.payoutIds.includes(p.id));

  const declarations: WorkerTaxDetail[] = d.workerIds.map((workerId) => {
    const worker = findById(users, workerId);
    const workerSettlements = periodSettlements.filter((s) => s.workerId === workerId);
    const totalIncome = workerSettlements.reduce((sum, s) => sum + s.totalBeforeTax, 0);
    const tax = workerSettlements.reduce((sum, s) => sum + s.taxAmount, 0);
    const deduction = Math.min(totalIncome * 0.2, 800 * workerSettlements.length);
    const taxableIncome = totalIncome - deduction;
    const taxRate = totalIncome > 50000 ? '40%' : totalIncome > 20000 ? '30%' : totalIncome > 4000 ? '20%' : totalIncome > 800 ? '20%' : '0%';

    return {
      workerId,
      workerName: worker?.name,
      idCardMasked: worker?.idCard ? worker.idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2') : '',
      totalIncome,
      deduction,
      taxableIncome,
      taxRate,
      taxAmount: tax,
    };
  });

  return {
    ...d,
    companyName: company?.name,
    declarations,
    invoiceSummary: {
      count: periodInvoices.length,
      totalAmount: periodInvoices.reduce((sum, i) => sum + i.amount, 0),
      totalTax: periodInvoices.reduce((sum, i) => sum + i.taxAmount, 0),
    },
    payoutSummary: {
      count: periodPayouts.length,
      totalAmount: periodPayouts.reduce((sum, p) => sum + p.amount, 0),
      successCount: periodPayouts.filter((p) => p.status === 'success').length,
      failCount: periodPayouts.filter((p) => p.status === 'failed').length,
    },
    consistencyCheck: {
      settlementCount: periodSettlements.length,
      invoiceCount: periodInvoices.length,
      payoutCount: periodPayouts.length,
      settlementTotal: periodSettlements.reduce((sum, s) => sum + s.netAmount, 0),
      payoutTotal: periodPayouts.reduce((sum, p) => sum + p.amount, 0),
      isConsistent: Math.abs(
        periodSettlements.reduce((sum, s) => sum + s.netAmount, 0) -
        periodPayouts.reduce((sum, p) => sum + p.amount, 0)
      ) < 0.01,
    },
  };
};

const generateTaxDeclarations = (): void => {
  const settlementMonths = new Set<string>();
  const companyIds = new Set<string>();

  settlements.forEach((s) => {
    if (s.confirmedAt) {
      const month = s.confirmedAt.slice(0, 7);
      settlementMonths.add(month);
      companyIds.add(s.companyId);
    }
  });

  settlementMonths.forEach((period) => {
    companyIds.forEach((companyId) => {
      const periodSettlements = settlements.filter(
        (s) => s.confirmedAt?.startsWith(period) && s.companyId === companyId
      );

      if (periodSettlements.length === 0) return;

      const existing = taxDeclarations.find(
        (d) => d.period === period && d.companyId === companyId
      );

      if (!existing) {
        const workerIds = [...new Set(periodSettlements.map((s) => s.workerId))];
        const settlementIds = periodSettlements.map((s) => s.id);
        const relatedInvoices = invoices.filter((inv) => settlementIds.includes(inv.settlementId));
        const relatedPayouts = payouts.filter((p) => settlementIds.includes(p.settlementId));

        const failedCount = periodSettlements.filter((s) => s.status === 'failed').length;
        const pendingCount = periodSettlements.filter((s) => s.status === 'pending').length;
        const paidCount = periodSettlements.filter((s) => s.status === 'paid').length;
        const payoutFailedCount = relatedPayouts.filter((p) => p.status === 'failed').length;
        const allPaid = periodSettlements.every((s) => s.status === 'paid');
        const allPayoutSuccess = relatedPayouts.length > 0 && relatedPayouts.every((p) => p.status === 'success');

        let status: TaxDeclaration['status'] = 'draft';
        let failReason: string | undefined;
        let failedSettlementCount: number | undefined;
        let failedPayoutCount: number | undefined;
        let latestFailTime: string | undefined;

        if (failedCount > 0 || payoutFailedCount > 0) {
          status = 'failed';
          failReason = `存在 ${failedCount + payoutFailedCount} 笔失败记录`;
          failedSettlementCount = failedCount;
          failedPayoutCount = payoutFailedCount;

          const failTimes: string[] = [];
          periodSettlements
            .filter((s) => s.status === 'failed')
            .forEach((s) => {
              if (s.confirmedAt) failTimes.push(s.confirmedAt);
            });
          relatedPayouts
            .filter((p) => p.status === 'failed')
            .forEach((p) => {
              if (p.paidAt) failTimes.push(p.paidAt);
            });
          if (failTimes.length > 0) {
            latestFailTime = failTimes.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
          }
        } else if (pendingCount > 0) {
          status = 'draft';
        } else if (allPaid && allPayoutSuccess) {
          status = 'pending';
        } else if (allPaid) {
          status = 'pending';
        }

        const newDecl: TaxDeclaration = {
          id: generateId('TAX'),
          period,
          companyId,
          workerIds,
          settlementIds,
          invoiceIds: relatedInvoices.map((i) => i.id),
          payoutIds: relatedPayouts.map((p) => p.id),
          totalTaxableIncome: periodSettlements.reduce((sum, s) => sum + s.totalBeforeTax, 0),
          totalDeductions: periodSettlements.length * 800,
          totalTax: periodSettlements.reduce((sum, s) => sum + s.taxAmount, 0),
          declarationCount: workerIds.length,
          status,
          failReason,
          failedSettlementCount,
          failedPayoutCount,
          latestFailTime,
        };
        taxDeclarations.push(newDecl);
      }
    });
  });
};

router.get('/declarations', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);

    const { month, companyId, status, page = 1, pageSize = 10 } = req.query;

    generateTaxDeclarations();

    let filtered: TaxDeclaration[] = [...taxDeclarations];

    if (month) {
      filtered = filtered.filter((d) => d.period === String(month));
    }
    if (companyId) {
      filtered = filtered.filter((d) => d.companyId === String(companyId));
    }
    if (status) {
      filtered = filtered.filter((d) => d.status === String(status));
    }

    if (user?.role === 'worker') {
      filtered = filtered.filter((d) => d.workerIds.includes(user.id));
    } else if (user && (user.role === 'hr' || user.role === 'finance') && user.companyId) {
      filtered = filtered.filter((d) => d.companyId === user.companyId);
    }

    const pageNum = parseInt(String(page), 10);
    const sizeNum = parseInt(String(pageSize), 10);
    const start = (pageNum - 1) * sizeNum;
    const end = start + sizeNum;
    const paginated = filtered.slice(start, end);

    const enriched = paginated.map(enrichDeclaration);

    const draftList = filtered.filter((d) => d.status === 'draft');
    const pendingList = filtered.filter((d) => d.status === 'pending');
    const declaredList = filtered.filter((d) => d.status === 'declared');
    const filedList = filtered.filter((d) => d.status === 'filed');
    const failedList = filtered.filter((d) => d.status === 'failed');

    const sumByList = (list: TaxDeclaration[]) => ({
      count: list.length,
      totalTaxableIncome: list.reduce((sum, d) => sum + d.totalTaxableIncome, 0),
      totalTax: list.reduce((sum, d) => sum + d.totalTax, 0),
    });

    res.status(200).json({
      success: true,
      data: {
        list: enriched,
        total: filtered.length,
        page: pageNum,
        pageSize: sizeNum,
        totalPages: Math.ceil(filtered.length / sizeNum),
        summary: {
          total: filtered.length,
          draft: draftList.length,
          pending: pendingList.length,
          declared: declaredList.length,
          filed: filedList.length,
          failed: failedList.length,
          totalTaxableIncome: filtered.reduce((sum, d) => sum + d.totalTaxableIncome, 0),
          totalTaxAmount: filtered.reduce((sum, d) => sum + d.totalTax, 0),
          byStatus: {
            draft: sumByList(draftList),
            pending: sumByList(pendingList),
            declared: sumByList(declaredList),
            filed: sumByList(filedList),
            failed: sumByList(failedList),
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取税务申报列表失败',
    });
  }
});

router.get('/declarations/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    generateTaxDeclarations();

    const declaration = findById(taxDeclarations, id);

    if (!declaration) {
      res.status(404).json({ success: false, message: '税务申报记录不存在' });
      return;
    }

    const enriched = enrichDeclaration(declaration);

    const periodSettlements = settlements.filter((s) => declaration.settlementIds.includes(s.id));
    const periodInvoices = invoices.filter((i) => declaration.invoiceIds.includes(i.id));
    const periodPayouts = payouts.filter((p) => declaration.payoutIds.includes(p.id));

    const settlementSummaries: SettlementSummary[] = periodSettlements.map((s) => {
      const worker = findById(users, s.workerId);
      return {
        id: s.id,
        workerName: worker?.name,
        totalBeforeTax: s.totalBeforeTax,
        taxAmount: s.taxAmount,
        netAmount: s.netAmount,
        status: s.status,
        confirmedAt: s.confirmedAt,
      };
    });

    let failedSettlements: FailedSettlement[] | undefined;
    let failedPayouts: FailedPayout[] | undefined;
    let failedInvoices: Invoice[] | undefined;
    let failureAnalysis: string | undefined;

    if (declaration.status === 'failed') {
      const failedSettlementList = periodSettlements.filter((s) => s.status === 'failed');
      failedSettlements = failedSettlementList.map((s) => {
        const worker = findById(users, s.workerId);
        return {
          id: s.id,
          workerName: worker?.name,
          workerId: s.workerId,
          totalBeforeTax: s.totalBeforeTax,
          taxAmount: s.taxAmount,
          netAmount: s.netAmount,
          status: s.status,
        };
      });

      const failedPayoutList = periodPayouts.filter((p) => p.status === 'failed');
      failedPayouts = failedPayoutList.map((p) => {
        const s = findById(settlements, p.settlementId);
        const worker = s ? findById(users, s.workerId) : undefined;
        return {
          id: p.id,
          settlementId: p.settlementId,
          workerName: worker?.name,
          amount: p.amount,
          bankAccount: p.bankAccount,
          bankName: p.bankName,
          accountName: p.accountName,
          failReason: p.failReason,
          retryCount: p.retryCount,
          status: p.status,
        };
      });

      const failedSettlementIds = failedSettlementList.map((s) => s.id);
      const failedPayoutSettlementIds = failedPayoutList.map((p) => p.settlementId);
      const allFailedSettlementIds = [...new Set([...failedSettlementIds, ...failedPayoutSettlementIds])];
      failedInvoices = periodInvoices.filter((i) => allFailedSettlementIds.includes(i.settlementId));

      const failReasonCounts: Record<string, number> = {};
      failedPayouts.forEach((p) => {
        const reason = p.failReason || '未知原因';
        failReasonCounts[reason] = (failReasonCounts[reason] || 0) + 1;
      });
      if (failedSettlementList.length > 0) {
        failReasonCounts['结算失败'] = (failReasonCounts['结算失败'] || 0) + failedSettlementList.length;
      }
      failureAnalysis = Object.entries(failReasonCounts)
        .map(([reason, count]) => `${reason} ${count}笔`)
        .join('，');
    }

    const fullDetail: TaxDeclarationFullDetail = {
      ...enriched,
      settlements: settlementSummaries,
      invoices: periodInvoices,
      payouts: periodPayouts,
      failedSettlements,
      failedPayouts,
      failedInvoices,
      failureAnalysis,
    };

    res.status(200).json({
      success: true,
      data: fullDetail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取税务申报详情失败',
    });
  }
});

router.post('/declarations/:id/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = getUserFromToken(req);

    generateTaxDeclarations();

    const declaration = findById(taxDeclarations, id);

    if (!declaration) {
      res.status(404).json({ success: false, message: '税务申报记录不存在' });
      return;
    }

    if (declaration.status !== 'draft' && declaration.status !== 'pending') {
      res.status(400).json({ success: false, message: '当前状态不允许提交申报' });
      return;
    }

    if (declaration.status === 'draft') {
      const periodSettlements = settlements.filter((s) => declaration.settlementIds.includes(s.id));
      if (!periodSettlements.every((s) => s.status === 'paid')) {
        res.status(400).json({ success: false, message: '存在未完成支付的结算单，无法提交申报' });
        return;
      }
    }

    declaration.status = 'declared';
    declaration.declaredAt = new Date().toISOString();
    declaration.declarationNo = `TAX${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    res.status(200).json({
      success: true,
      message: '税务申报提交成功',
      data: {
        id: declaration.id,
        status: declaration.status,
        declarationNo: declaration.declarationNo,
        declaredAt: declaration.declaredAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '提交税务申报失败',
    });
  }
});

router.get('/declarations/:id/certificate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    generateTaxDeclarations();

    const declaration = findById(taxDeclarations, id);

    if (!declaration) {
      res.status(404).json({ success: false, message: '税务申报记录不存在' });
      return;
    }

    if (declaration.status !== 'declared' && declaration.status !== 'filed') {
      res.status(400).json({ success: false, message: '申报尚未完成，无法生成完税凭证' });
      return;
    }

    const company = findById(companies, declaration.companyId);
    const enriched = enrichDeclaration(declaration);

    if (!declaration.filedAt) {
      declaration.filedAt = new Date().toISOString();
      declaration.status = 'filed';
    }

    const certificate: TaxCertificate = {
      declarationId: declaration.id,
      declarationNo: declaration.declarationNo || `CERT${declaration.id}`,
      period: declaration.period,
      companyName: company?.name || '',
      companyLicenseNo: company?.licenseNo || '',
      totalTaxableIncome: declaration.totalTaxableIncome,
      totalTax: declaration.totalTax,
      declarationCount: declaration.declarationCount,
      declaredAt: declaration.declaredAt || new Date().toISOString(),
      filedAt: declaration.filedAt,
      issuedAt: new Date().toISOString(),
      items: enriched.declarations.map((d) => ({
        workerName: d.workerName || '',
        idCardMasked: d.idCardMasked,
        taxableIncome: d.taxableIncome,
        taxAmount: d.taxAmount,
      })),
    };

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '生成完税凭证失败',
    });
  }
});

export default router;
