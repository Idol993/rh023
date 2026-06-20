import { Router, type Request, type Response } from 'express';
import {
  jobPosts,
  matchResults,
  users,
  companies,
  contracts,
  tasks,
  generateId,
  findById,
} from '../data/mockData.js';
import { getUserFromToken } from './auth.js';
import type { JobPost, MatchResult, Contract, Task } from '../../shared/types.js';

const router = Router();

function buildContractContent(job: JobPost, companyName: string, workerName: string): string {
  const typeText = job.type === 'hourly' ? '计时用工' : '计件用工';
  const rateText = job.type === 'hourly' 
    ? `小时单价：${job.hourlyRate}元/小时，每日工作不超过8小时，每周不超过40小时`
    : `计件单价：${job.pieceRate}元/件，多劳多得，按实际合格完成量结算`;

  return `
【第1条 服务内容】
甲方（${companyName}）委托乙方（${workerName}）提供 ${job.title} 服务，具体内容：${job.content}

【第2条 用工类型与工时规则】
用工类型：${typeText}
${job.type === 'hourly' 
  ? '工作时间：每日考勤打卡，上下班时间以系统打卡记录为准；加班需提前申请并经甲方确认'
  : '工作方式：按件计酬，乙方自行安排工作时间，但需在工期内按质按量完成'
}
结算标准：${rateText}

【第3条 报酬标准与结算周期】
1. 报酬标准：${rateText}
2. 结算周期：任务完成并经验收合格后，按月/按批次结算
3. 报酬构成：应发报酬 = 有效工时 × 小时单价 / 完成量 × 计件单价 - 扣款 + 奖励
4. 支付时间：企业确认结算后3个工作日内发放至乙方指定银行账户

【第4条 验收标准与流程】
验收标准：${job.acceptanceCriteria && job.acceptanceCriteria.length > 0 ? job.acceptanceCriteria.join('；') : '按甲方要求的质量标准验收'}
验收流程：乙方完成任务后提交验收申请，甲方应在3个工作日内完成验收；验收不合格的，乙方应在指定期限内整改后重新提交。

【第5条 违约责任】
1. 乙方未按要求完成任务的，甲方有权扣减相应报酬；造成损失的，乙方应予赔偿
2. 甲方未按约定支付报酬的，每逾期1日按应付金额的0.5‰支付违约金
3. 任何一方严重违约导致协议无法履行的，守约方有权解除协议并要求赔偿损失

【第6条 个税承担方式与申报】
1. 乙方取得的劳务报酬所得，应依法缴纳个人所得税
2. 根据《中华人民共和国个人所得税法》规定，由甲方（发放方）代扣代缴劳务报酬个人所得税
3. 个税计算方法（劳务报酬所得）：
   - 每次收入不超过800元的，不预扣预缴个人所得税
   - 每次收入800元以上至4000元的，减除费用800元后，按20%税率预扣预缴
   - 每次收入4000元以上的，减除20%的费用后，按20%-40%的超额累进预扣率预扣预缴
   - 年度终了后，乙方可在次年6月30日前办理个人所得税综合所得汇算清缴，多退少补
4. 甲方应在次月15日前完成扣缴申报，并向乙方提供完税凭证

【第7条 争议处理】
1. 因本协议产生的争议，双方首先应友好协商解决
2. 协商不成的，任何一方均可向平台申请调解，平台调解结果对双方具有约束力
3. 调解不成的，任何一方均可向甲方所在地人民法院提起诉讼
4. 争议处理期间，不影响无争议部分的履行
  `.trim();
}

function createContractAndTask(job: JobPost, worker: { id: string; name: string }): { contract: Contract; task: Task } {
  const company = findById(companies, job.companyId);
  const content = buildContractContent(job, company?.name || '企业', worker.name);

  const newContract: Contract = {
    id: generateId('CTR'),
    jobId: job.id,
    companyId: job.companyId,
    workerId: worker.id,
    content,
    templateVersion: 'v1.0',
    companySigned: false,
    workerSigned: false,
    platformSigned: false,
    status: 'signing',
  };
  contracts.unshift(newContract);

  const newTask: Task = {
    id: generateId('TSK'),
    jobId: job.id,
    workerId: worker.id,
    contractId: newContract.id,
    status: 'pending',
    checkIns: [],
    submissions: [],
    riskFlags: [],
  };
  tasks.unshift(newTask);

  return { contract: newContract, task: newTask };
}

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const {
      companyId,
      title,
      type,
      content,
      startDate,
      endDate,
      hourlyRate,
      pieceRate,
      workLocation,
      skills,
      requirements,
      acceptanceCriteria,
    } = req.body;

    if (!companyId || !title || !type || !content || !startDate || !endDate) {
      res
        .status(400)
        .json({ success: false, message: '缺少必要的需求信息' });
      return;
    }

    if (type === 'hourly' && !hourlyRate) {
      res.status(400).json({ success: false, message: '计时制需提供时薪' });
      return;
    }
    if (type === 'piecework' && !pieceRate) {
      res.status(400).json({ success: false, message: '计件制需提供计件单价' });
      return;
    }

    const newJob: JobPost = {
      id: generateId('job'),
      companyId,
      title,
      type: type as 'hourly' | 'piecework',
      content,
      startDate,
      endDate,
      hourlyRate: type === 'hourly' ? hourlyRate : undefined,
      pieceRate: type === 'piecework' ? pieceRate : undefined,
      workLocation: workLocation || {
        lat: 31.2304,
        lng: 121.4737,
        address: '上海市',
        radius: 500,
      },
      skills: skills || [],
      requirements: requirements || [],
      acceptanceCriteria: acceptanceCriteria || [],
      status: 'published',
      createdAt: new Date().toISOString(),
    };

    jobPosts.unshift(newJob);

    res.status(201).json({
      success: true,
      data: newJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '发布需求失败',
    });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId, status, type, page = 1, pageSize = 10 } = req.query;

    let filtered = [...jobPosts];

    if (companyId) {
      filtered = filtered.filter((j) => j.companyId === companyId);
    }
    if (status) {
      filtered = filtered.filter((j) => j.status === status);
    }
    if (type) {
      filtered = filtered.filter((j) => j.type === type);
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
      message: error instanceof Error ? error.message : '获取需求列表失败',
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = findById(jobPosts, id);

    if (!job) {
      res.status(404).json({ success: false, message: '需求不存在' });
      return;
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取需求详情失败',
    });
  }
});

router.get('/:id/match', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = findById(jobPosts, id);

    if (!job) {
      res.status(404).json({ success: false, message: '需求不存在' });
      return;
    }

    const matches = matchResults
      .filter((m) => m.jobId === id)
      .map((m) => {
        const worker = findById(users, m.workerId);
        const { password: _p, ...workerWithoutPassword } = worker || ({} as any);
        return {
          ...m,
          worker: worker ? workerWithoutPassword : undefined,
        } as MatchResult;
      })
      .sort((a, b) => b.totalScore - a.totalScore);

    res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取匹配候选人失败',
    });
  }
});

router.post('/:id/apply', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    if (user.role !== 'worker') {
      res.status(403).json({ success: false, message: '只有灵活用工者可以接单' });
      return;
    }

    const { id } = req.params;
    const job = findById(jobPosts, id);

    if (!job) {
      res.status(404).json({ success: false, message: '需求不存在' });
      return;
    }

    if (job.status === 'completed') {
      res.status(400).json({ success: false, message: '该需求已完成，无法接单' });
      return;
    }

    const existingMatch = matchResults.find(
      (m) => m.jobId === id && m.workerId === user.id,
    );

    if (existingMatch) {
      if (existingMatch.status === 'accepted') {
        res.status(400).json({ success: false, message: '您已接受该需求' });
        return;
      }
      existingMatch.status = 'accepted';

      const existingContract = contracts.find(
        (c) => c.jobId === id && c.workerId === user.id,
      );
      const existingTask = tasks.find(
        (t) => t.jobId === id && t.workerId === user.id,
      );

      let contract = existingContract;
      let task = existingTask;
      if (!existingContract || !existingTask) {
        const result = createContractAndTask(job, user);
        contract = result.contract;
        task = result.task;
      }

      if (job.status === 'published' || job.status === 'matched') {
        job.status = 'in_progress';
      }

      res.status(200).json({
        success: true,
        data: { match: existingMatch, contract, task },
        message: '接单成功，请尽快签署电子协议',
      });
      return;
    }

    const newMatch: MatchResult = {
      id: generateId('mtc'),
      jobId: id,
      workerId: user.id,
      skillMatchScore: 80,
      distanceKm: 5,
      ratingScore: Math.round(user.rating * 20),
      acceptRateScore: Math.round(user.acceptRate * 100),
      totalScore: 85,
      status: 'accepted',
    };

    matchResults.push(newMatch);

    if (job.status === 'published' || job.status === 'matched') {
      job.status = 'in_progress';
    }

    const { contract: newContract, task: newTask } = createContractAndTask(job, user);

    res.status(201).json({
      success: true,
      data: {
        match: newMatch,
        contract: newContract,
        task: newTask,
      },
      message: '接单成功，请尽快签署电子协议',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '接单失败',
    });
  }
});

export default router;
