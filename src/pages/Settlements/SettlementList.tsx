import { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Calendar,
  User,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign,
  Eye,
  Calculator,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  X,
  Filter,
  RefreshCw,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table, { type Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency, formatDate, calculateTax, cn } from '../../utils/format';
import type { Settlement, SettlementItem } from '../../../shared/types';

interface SettlementExt extends Settlement {
  settlementNo: string;
  taskTitle: string;
  workerName: string;
  workerAvatar: string;
  jobType: 'hourly' | 'piecework';
  deductionTotal: number;
  bonusTotal: number;
}

const mockSettlements: SettlementExt[] = [
  {
    id: 'stl1001',
    settlementNo: 'ST-20260628-0001',
    taskId: 'tsk1001',
    taskTitle: '设备维修技术员（计时）',
    workerId: 'usr1001',
    workerName: '张三',
    workerAvatar: 'Z',
    companyId: 'cmp1001',
    jobType: 'hourly',
    baseAmount: 2850,
    deductions: [
      { id: 'd1', name: '社保个人部分', amount: 228, remark: '灵活用工社保代缴' },
      { id: 'd2', name: '住宿费', amount: 0, remark: '' },
    ],
    bonuses: [
      { id: 'b1', name: '全勤奖', amount: 200, remark: '本周全勤无缺勤' },
      { id: 'b2', name: '绩效奖金', amount: 300, remark: '设备故障率低于2%' },
    ],
    deductionTotal: 228,
    bonusTotal: 500,
    totalBeforeTax: 3350,
    taxAmount: 67.5,
    netAmount: 3054.5,
    taxBracket: '3%',
    status: 'paid',
    confirmedAt: '2026-06-27T10:00:00Z',
    paidAt: '2026-06-28T09:30:00Z',
  },
  {
    id: 'stl1002',
    settlementNo: 'ST-20260626-0002',
    taskId: 'tsk1004',
    taskTitle: '仓库分拣员（计时）',
    workerId: 'usr1002',
    workerName: '李四',
    workerAvatar: 'L',
    companyId: 'cmp1002',
    jobType: 'hourly',
    baseAmount: 2940,
    deductions: [
      { id: 'd3', name: '社保个人部分', amount: 235.2, remark: '灵活用工社保代缴' },
      { id: 'd4', name: '住宿费', amount: 150, remark: '员工宿舍本周费用' },
    ],
    bonuses: [
      { id: 'b3', name: '夜班补贴', amount: 420, remark: '夜班7小时，60元/小时' },
      { id: 'b4', name: '分拣准确率奖励', amount: 150, remark: '准确率99.6%达标' },
    ],
    deductionTotal: 385.2,
    bonusTotal: 570,
    totalBeforeTax: 3510,
    taxAmount: 73.2,
    netAmount: 3051.6,
    taxBracket: '3%',
    status: 'paid',
    confirmedAt: '2026-06-25T14:00:00Z',
    paidAt: '2026-06-26T10:15:00Z',
  },
  {
    id: 'stl1003',
    settlementNo: 'ST-20260628-0003',
    taskId: 'tsk1002',
    taskTitle: '电子产品组装工（计件）',
    workerId: 'usr1001',
    workerName: '张三',
    workerAvatar: 'Z',
    companyId: 'cmp1001',
    jobType: 'piecework',
    baseAmount: 6700,
    deductions: [
      { id: 'd5', name: '社保个人部分', amount: 536, remark: '灵活用工社保代缴' },
    ],
    bonuses: [
      { id: 'b5', name: '超产奖', amount: 500, remark: '超额完成周产量目标' },
      { id: 'b6', name: '质量奖', amount: 300, remark: '合格率连续3天超98.5%' },
    ],
    deductionTotal: 536,
    bonusTotal: 800,
    totalBeforeTax: 7500,
    taxAmount: 210,
    netAmount: 6754,
    taxBracket: '10%',
    status: 'confirmed',
    confirmedAt: '2026-06-28T16:00:00Z',
  },
  {
    id: 'stl1004',
    settlementNo: 'ST-20260628-0004',
    taskId: 'tsk1003',
    taskTitle: '电子产品组装工（计件）',
    workerId: 'usr1002',
    workerName: '李四',
    workerAvatar: 'L',
    companyId: 'cmp1001',
    jobType: 'piecework',
    baseAmount: 4550,
    deductions: [
      { id: 'd6', name: '社保个人部分', amount: 364, remark: '灵活用工社保代缴' },
      { id: 'd7', name: '质量不合格扣款', amount: 180, remark: '2件产品报废' },
    ],
    bonuses: [],
    deductionTotal: 544,
    bonusTotal: 0,
    totalBeforeTax: 4550,
    taxAmount: 136.5,
    netAmount: 3869.5,
    taxBracket: '3%',
    status: 'pending',
  },
  {
    id: 'stl1005',
    settlementNo: 'ST-20260628-0005',
    taskId: 'tsk1005',
    taskTitle: '仓库分拣员（计时）',
    workerId: 'usr1002',
    workerName: '李四',
    workerAvatar: 'L',
    companyId: 'cmp1002',
    jobType: 'hourly',
    baseAmount: 1820,
    deductions: [
      { id: 'd8', name: '社保个人部分', amount: 145.6, remark: '灵活用工社保代缴' },
    ],
    bonuses: [
      { id: 'b7', name: '夜班补贴', amount: 240, remark: '夜班4小时' },
    ],
    deductionTotal: 145.6,
    bonusTotal: 240,
    totalBeforeTax: 2060,
    taxAmount: 54.6,
    netAmount: 1859.8,
    taxBracket: '3%',
    status: 'failed',
    confirmedAt: '2026-06-28T11:00:00Z',
  },
  {
    id: 'stl1006',
    settlementNo: 'ST-20260628-0006',
    taskId: 'tsk1007',
    taskTitle: '前端开发工程师（计时）',
    workerId: 'usr1003',
    workerName: '王五',
    workerAvatar: 'W',
    companyId: 'cmp1001',
    jobType: 'hourly',
    baseAmount: 2160,
    deductions: [
      { id: 'd9', name: '社保个人部分', amount: 172.8, remark: '灵活用工社保代缴' },
    ],
    bonuses: [],
    deductionTotal: 172.8,
    bonusTotal: 0,
    totalBeforeTax: 2160,
    taxAmount: 64.8,
    netAmount: 1922.4,
    taxBracket: '3%',
    status: 'pending',
  },
  {
    id: 'stl1007',
    settlementNo: 'ST-20260625-0007',
    taskId: 'tsk1008',
    taskTitle: '包装盒贴标（计件）',
    workerId: 'usr1003',
    workerName: '王五',
    workerAvatar: 'W',
    companyId: 'cmp1001',
    jobType: 'piecework',
    baseAmount: 28800,
    deductions: [
      { id: 'd10', name: '社保个人部分', amount: 2304, remark: '灵活用工社保代缴' },
    ],
    bonuses: [
      { id: 'b8', name: '月度优秀员工奖', amount: 1000, remark: '' },
    ],
    deductionTotal: 2304,
    bonusTotal: 1000,
    totalBeforeTax: 29800,
    taxAmount: 5560,
    netAmount: 21936,
    taxBracket: '30%',
    status: 'pending',
  },
  {
    id: 'stl1008',
    settlementNo: 'ST-20260620-0008',
    taskId: 'tsk1009',
    taskTitle: '叉车司机（计时）',
    workerId: 'usr1001',
    workerName: '张三',
    workerAvatar: 'Z',
    companyId: 'cmp1002',
    jobType: 'hourly',
    baseAmount: 52000,
    deductions: [
      { id: 'd11', name: '社保个人部分', amount: 4160, remark: '灵活用工社保代缴' },
    ],
    bonuses: [
      { id: 'b9', name: '安全奖', amount: 500, remark: '连续30天无安全事故' },
    ],
    deductionTotal: 4160,
    bonusTotal: 500,
    totalBeforeTax: 52500,
    taxAmount: 12940,
    netAmount: 35400,
    taxBracket: '40%',
    status: 'confirmed',
    confirmedAt: '2026-06-20T15:00:00Z',
  },
];

const statusTabs = [
  { key: 'all', label: '全部', count: 0 },
  { key: 'pending', label: '待确认', count: 0 },
  { key: 'confirmed', label: '已确认', count: 0 },
  { key: 'paid', label: '已发放', count: 0 },
  { key: 'failed', label: '失败', count: 0 },
];

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; icon: typeof CheckCircle2 }> = {
  pending: { label: '待确认', variant: 'warning', icon: Clock },
  confirmed: { label: '已确认', variant: 'info', icon: CheckCircle2 },
  paid: { label: '已发放', variant: 'success', icon: CheckCircle2 },
  failed: { label: '发放失败', variant: 'danger', icon: XCircle },
};

const taxBracketColors: Record<string, string> = {
  '3%': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '10%': 'bg-blue-50 text-blue-700 border-blue-200',
  '20%': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  '25%': 'bg-purple-50 text-purple-700 border-purple-200',
  '30%': 'bg-orange-50 text-orange-700 border-orange-200',
  '35%': 'bg-amber-50 text-amber-700 border-amber-200',
  '40%': 'bg-red-50 text-red-700 border-red-200',
  '免征': 'bg-gray-50 text-gray-700 border-gray-200',
};

const taxAmountColors: Record<string, string> = {
  '3%': 'text-emerald-600',
  '10%': 'text-blue-600',
  '20%': 'text-indigo-600',
  '25%': 'text-purple-600',
  '30%': 'text-orange-600',
  '35%': 'text-amber-600',
  '40%': 'text-red-600',
  '免征': 'text-gray-600',
};

export default function SettlementList() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [workerFilter, setWorkerFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewSettlement, setPreviewSettlement] = useState<SettlementExt | null>(null);
  const [showTaxHelp, setShowTaxHelp] = useState(false);
  const [batchConfirmLoading, setBatchConfirmLoading] = useState(false);
  const [confirmSingleLoading, setConfirmSingleLoading] = useState<string | null>(null);

  const tabCounts = useMemo(() => {
    return statusTabs.map(tab => ({
      ...tab,
      count: tab.key === 'all'
        ? mockSettlements.length
        : mockSettlements.filter(s => s.status === tab.key).length,
    }));
  }, []);

  const filteredSettlements = useMemo(() => {
    return mockSettlements.filter(s => {
      if (activeTab !== 'all' && s.status !== activeTab) return false;
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        if (
          !s.settlementNo.toLowerCase().includes(kw) &&
          !s.taskTitle.toLowerCase().includes(kw) &&
          !s.workerName.toLowerCase().includes(kw)
        ) return false;
      }
      if (workerFilter && s.workerId !== workerFilter) return false;
      return true;
    });
  }, [activeTab, searchKeyword, workerFilter]);

  const stats = useMemo(() => {
    const pending = mockSettlements.filter(s => s.status === 'pending');
    const confirmed = mockSettlements.filter(s => s.status === 'confirmed');
    const paid = mockSettlements.filter(s => s.status === 'paid');
    const failed = mockSettlements.filter(s => s.status === 'failed');
    return {
      pending: { count: pending.length, amount: pending.reduce((a, b) => a + b.netAmount, 0) },
      confirmed: { count: confirmed.length, amount: confirmed.reduce((a, b) => a + b.netAmount, 0) },
      paid: { count: paid.length, amount: paid.reduce((a, b) => a + b.netAmount, 0) },
      failed: { count: failed.length, amount: failed.reduce((a, b) => a + b.netAmount, 0) },
    };
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pendingIds = filteredSettlements.filter(s => s.status === 'pending').map(s => s.id);
    const allSelected = pendingIds.every(id => selectedIds.includes(id)) && pendingIds.length > 0;
    setSelectedIds(allSelected ? [] : pendingIds);
  };

  const handleSingleConfirm = async (id: string) => {
    setConfirmSingleLoading(id);
    await new Promise(r => setTimeout(r, 800));
    setConfirmSingleLoading(null);
  };

  const handleBatchConfirm = async () => {
    setBatchConfirmLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setBatchConfirmLoading(false);
    setSelectedIds([]);
  };

  const columns: Column<SettlementExt>[] = [
    {
      key: 'select',
      title: (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={
              filteredSettlements.filter(s => s.status === 'pending').length > 0 &&
              filteredSettlements.filter(s => s.status === 'pending').every(s => selectedIds.includes(s.id))
            }
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      ),
      width: 40,
      render: (record) => (
        record.status === 'pending' ? (
          <input
            type="checkbox"
            checked={selectedIds.includes(record.id)}
            onChange={() => toggleSelect(record.id)}
            onClick={e => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        ) : null
      ),
    },
    {
      key: 'settlementNo',
      title: '结算编号',
      width: 150,
      render: (r) => (
        <span className="font-mono text-sm font-medium text-blue-600">{r.settlementNo}</span>
      ),
    },
    {
      key: 'taskTitle',
      title: '任务标题',
      width: 200,
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 truncate max-w-[180px]" title={r.taskTitle}>{r.taskTitle}</span>
          <Badge variant={r.jobType === 'hourly' ? 'info' : 'success'} className="mt-1 w-fit">
            {r.jobType === 'hourly' ? '⏱ 计时' : '📦 计件'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'workerName',
      title: '工人姓名',
      width: 120,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs font-semibold">
            {r.workerAvatar}
          </div>
          <span className="text-gray-900 font-medium">{r.workerName}</span>
        </div>
      ),
    },
    {
      key: 'baseAmount',
      title: '基础金额',
      align: 'right',
      width: 100,
      render: (r) => <span className="font-medium text-gray-900">{formatCurrency(r.baseAmount)}</span>,
    },
    {
      key: 'deductionTotal',
      title: '扣款合计',
      align: 'right',
      width: 100,
      render: (r) => (
        <span className={cn(r.deductionTotal > 0 ? 'text-red-600' : 'text-gray-400')}>
          {r.deductionTotal > 0 ? `-${formatCurrency(r.deductionTotal).replace('¥', '¥')}` : '-'}
        </span>
      ),
    },
    {
      key: 'bonusTotal',
      title: '奖励合计',
      align: 'right',
      width: 100,
      render: (r) => (
        <span className={cn(r.bonusTotal > 0 ? 'text-emerald-600' : 'text-gray-400')}>
          {r.bonusTotal > 0 ? `+${formatCurrency(r.bonusTotal).replace('¥', '¥')}` : '-'}
        </span>
      ),
    },
    {
      key: 'totalBeforeTax',
      title: '税前金额',
      align: 'right',
      width: 110,
      render: (r) => <span className="font-semibold text-gray-900">{formatCurrency(r.totalBeforeTax)}</span>,
    },
    {
      key: 'taxAmount',
      title: '个税金额',
      align: 'right',
      width: 110,
      render: (r) => (
        <div className="flex flex-col items-end">
          <span className={cn('font-bold', taxAmountColors[r.taxBracket] || 'text-gray-900')}>
            {formatCurrency(r.taxAmount)}
          </span>
          <span className={cn(
            'mt-0.5 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
            taxBracketColors[r.taxBracket] || taxBracketColors['免征']
          )}>
            税档 {r.taxBracket}
          </span>
        </div>
      ),
    },
    {
      key: 'netAmount',
      title: '税后实发',
      align: 'right',
      width: 110,
      render: (r) => <span className="font-bold text-emerald-600 text-base">{formatCurrency(r.netAmount)}</span>,
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (r) => {
        const cfg = statusConfig[r.status];
        const Icon = cfg.icon;
        return (
          <Badge variant={cfg.variant} dot>
            <Icon size={12} />
            {cfg.label}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: 160,
      fixed: 'right',
      render: (r) => (
        <div className="flex items-center gap-1">
          {r.status === 'pending' && (
            <Button
              size="sm"
              variant="primary"
              loading={confirmSingleLoading === r.id}
              onClick={(e) => {
                e.stopPropagation();
                handleSingleConfirm(r.id);
              }}
              leftIcon={<CheckCircle2 size={14} />}
            >
              确认
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewSettlement(r);
            }}
            leftIcon={<Calculator size={14} />}
          >
            计税
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewSettlement(r);
            }}
            leftIcon={<Eye size={14} />}
          >
            查看
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="h-7 w-7 text-emerald-600" />
            结算明细列表
          </h1>
          <p className="mt-1 text-sm text-gray-500">查看和管理所有任务结算单，支持批量确认和计税预览</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="secondary" leftIcon={<RefreshCw size={16} />}>
            刷新
          </Button>
          <Button variant="secondary" leftIcon={<Download size={16} />}>
            导出报表
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="待确认"
          value={stats.pending.count}
          icon={<Clock size={22} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          description={`待确认金额 ${formatCurrency(stats.pending.amount)}`}
          trend={{ value: 8.2, isUp: false, label: '较上周' }}
        />
        <StatCard
          title="已确认"
          value={stats.confirmed.count}
          icon={<CheckCircle2 size={22} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          description={`已确认金额 ${formatCurrency(stats.confirmed.amount)}`}
          trend={{ value: 15.6, isUp: true, label: '较上周' }}
        />
        <StatCard
          title="已发放"
          value={stats.paid.count}
          icon={<DollarSign size={22} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          description={`累计发放 ${formatCurrency(stats.paid.amount)}`}
          trend={{ value: 12.3, isUp: true, label: '较上周' }}
        />
        <StatCard
          title="发放失败"
          value={stats.failed.count}
          icon={<AlertCircle size={22} />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          description={`涉及金额 ${formatCurrency(stats.failed.amount)}`}
          trend={{ value: 2.1, isUp: false, label: '较上周' }}
        />
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex flex-wrap items-center gap-1">
              {tabCounts.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs',
                    activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative">
              <button
                onMouseEnter={() => setShowTaxHelp(true)}
                onMouseLeave={() => setShowTaxHelp(false)}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <HelpCircle size={16} />
                个税计算规则说明
              </button>
              {showTaxHelp && (
                <div
                  className="absolute right-0 top-full z-20 mt-2 w-96 rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
                  onMouseEnter={() => setShowTaxHelp(true)}
                  onMouseLeave={() => setShowTaxHelp(false)}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calculator size={16} className="text-blue-600" />
                      劳务报酬个税计算规则
                    </h4>
                    <button onClick={() => setShowTaxHelp(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="font-medium text-blue-900 mb-1">计算公式</p>
                      <p className="font-mono">应纳税所得额 = 收入 × (1 - 20%)</p>
                      <p className="font-mono">应纳税额 = 应纳税所得额 × 税率 - 速算扣除数</p>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1.5 text-gray-600">级数</th>
                            <th className="px-2 py-1.5 text-gray-600">应纳税所得额</th>
                            <th className="px-2 py-1.5 text-gray-600">税率</th>
                            <th className="px-2 py-1.5 text-gray-600">扣除数</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr><td className="px-2 py-1.5">1</td><td className="px-2 py-1.5">≤20,000</td><td className="px-2 py-1.5">20%</td><td className="px-2 py-1.5">0</td></tr>
                          <tr><td className="px-2 py-1.5">2</td><td className="px-2 py-1.5">20,001-50,000</td><td className="px-2 py-1.5">30%</td><td className="px-2 py-1.5">2,000</td></tr>
                          <tr><td className="px-2 py-1.5">3</td><td className="px-2 py-1.5">{'>'}50,000</td><td className="px-2 py-1.5">40%</td><td className="px-2 py-1.5">7,000</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-amber-600">* 收入≤4000元时，减除费用按800元计算</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <FormField
              type="input"
              inputProps={{
                placeholder: '搜索结算编号、任务、工人...',
                value: searchKeyword,
                onChange: e => setSearchKeyword(e.target.value),
              }}
              leftIcon={<Search size={16} />}
            />
            <FormField
              type="input"
              inputProps={{
                type: 'date',
                value: dateRange.start,
                onChange: e => setDateRange(prev => ({ ...prev, start: e.target.value })),
              }}
              leftIcon={<Calendar size={16} />}
              label="开始日期"
            />
            <FormField
              type="input"
              inputProps={{
                type: 'date',
                value: dateRange.end,
                onChange: e => setDateRange(prev => ({ ...prev, end: e.target.value })),
              }}
              leftIcon={<Calendar size={16} />}
              label="结束日期"
            />
            <FormField
              type="select"
              selectProps={{
                value: workerFilter,
                onChange: e => setWorkerFilter(e.target.value),
              }}
              leftIcon={<User size={16} />}
              label="人员筛选"
            >
              <option value="">全部人员</option>
              <option value="usr1001">张三</option>
              <option value="usr1002">李四</option>
              <option value="usr1003">王五</option>
            </FormField>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <CheckCheck size={18} />
                <span>已选择 <strong>{selectedIds.length}</strong> 笔待确认结算单</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds([])}
                >
                  取消选择
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  loading={batchConfirmLoading}
                  onClick={handleBatchConfirm}
                  leftIcon={<CheckCircle2 size={14} />}
                >
                  批量确认
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Table<SettlementExt>
        columns={columns}
        data={filteredSettlements}
        rowKey="id"
        emptyText={<EmptyState compact title="暂无结算数据" description="调整筛选条件后重试" />}
      />

      <Modal
        open={!!previewSettlement}
        onClose={() => setPreviewSettlement(null)}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <span>计税预览 - {previewSettlement?.settlementNo}</span>
          </div>
        }
      >
        {previewSettlement && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-semibold">
                {previewSettlement.workerAvatar}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{previewSettlement.workerName}</p>
                <p className="text-sm text-gray-500 mt-0.5">{previewSettlement.taskTitle}</p>
              </div>
              <Badge variant={previewSettlement.jobType === 'hourly' ? 'info' : 'success'}>
                {previewSettlement.jobType === 'hourly' ? '计时制' : '计件制'}
              </Badge>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">收支明细</h4>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign size={16} className="text-gray-400" />
                    <span>基础金额</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatCurrency(previewSettlement.baseAmount)}</span>
                </div>

                {previewSettlement.bonuses.length > 0 && (
                  <div className="bg-emerald-50/30 px-5 py-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp size={14} className="text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">奖励项目</span>
                    </div>
                    {previewSettlement.bonuses.map(b => (
                      <div key={b.id} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Plus size={12} className="text-emerald-500" />
                          <span>{b.name}</span>
                          {b.remark && <span className="text-xs text-gray-400">({b.remark})</span>}
                        </div>
                        <span className="text-sm font-medium text-emerald-600">+{formatCurrency(b.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {previewSettlement.deductions.filter(d => d.name !== '个人所得税' && d.amount > 0).length > 0 && (
                  <div className="bg-red-50/30 px-5 py-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingDown size={14} className="text-red-600" />
                      <span className="text-sm font-medium text-red-700">扣款项目（不含个税）</span>
                    </div>
                    {previewSettlement.deductions.filter(d => d.name !== '个人所得税' && d.amount > 0).map(d => (
                      <div key={d.id} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Minus size={12} className="text-red-500" />
                          <span>{d.name}</span>
                          {d.remark && <span className="text-xs text-gray-400">({d.remark})</span>}
                        </div>
                        <span className="text-sm font-medium text-red-600">-{formatCurrency(d.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between px-5 py-3 bg-gray-50/50">
                  <span className="font-medium text-gray-700">税前金额合计</span>
                  <span className="font-bold text-lg text-gray-900">{formatCurrency(previewSettlement.totalBeforeTax)}</span>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <div className="px-5 py-3 border-b border-blue-200/50 flex items-center justify-between">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                  <Calculator size={16} />
                  个税计算过程
                </h4>
                <span className={cn(
                  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
                  taxBracketColors[previewSettlement.taxBracket] || taxBracketColors['免征']
                )}>
                  适用税率 {previewSettlement.taxBracket}
                </span>
              </div>
              <div className="p-5 space-y-3">
                {(() => {
                  const tax = calculateTax(previewSettlement.totalBeforeTax);
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg bg-white/60 p-3">
                          <p className="text-xs text-gray-500 mb-1">收入金额</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(previewSettlement.totalBeforeTax)}</p>
                        </div>
                        <div className="rounded-lg bg-white/60 p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            减除费用 {previewSettlement.totalBeforeTax <= 4000 ? '(800元)' : '(20%)'}
                          </p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(previewSettlement.totalBeforeTax <= 4000 ? 800 : previewSettlement.totalBeforeTax * 0.2)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white/60 p-3">
                          <p className="text-xs text-gray-500 mb-1">应纳税所得额</p>
                          <p className="font-semibold text-blue-700">{formatCurrency(tax.taxableIncome)}</p>
                        </div>
                        <div className="rounded-lg bg-white/60 p-3">
                          <p className="text-xs text-gray-500 mb-1">税率 / 速算扣除数</p>
                          <p className="font-semibold text-blue-700">
                            {tax.rate * 100}% / {formatCurrency(tax.deduction)}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-blue-200 bg-white p-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-2">应纳税额 = 应纳税所得额 × 税率 - 速算扣除数</p>
                          <p className="font-mono text-sm text-gray-600 mb-2">
                            {formatCurrency(tax.taxableIncome)} × {tax.rate * 100}% - {formatCurrency(tax.deduction)}
                          </p>
                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-around">
                            <div>
                              <p className="text-xs text-gray-500">应缴个税</p>
                              <p className={cn('text-xl font-bold mt-1', taxAmountColors[previewSettlement.taxBracket] || 'text-gray-900')}>
                                {formatCurrency(previewSettlement.taxAmount)}
                              </p>
                            </div>
                            <div className="h-10 w-px bg-gray-200" />
                            <div>
                              <p className="text-xs text-gray-500">税后实发</p>
                              <p className="text-xl font-bold mt-1 text-emerald-600">
                                {formatCurrency(previewSettlement.netAmount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {previewSettlement.confirmedAt && (
              <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-4">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-blue-500" />
                  确认时间：{formatDate(previewSettlement.confirmedAt)}
                </span>
                {previewSettlement.paidAt && (
                  <span className="flex items-center gap-1">
                    <DollarSign size={12} className="text-emerald-500" />
                    发放时间：{formatDate(previewSettlement.paidAt)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
