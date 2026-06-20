import { useState, useMemo } from 'react';
import {
  Landmark,
  CreditCard,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  History,
  Shield,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Search,
  Calendar,
  X,
  Users,
  TrendingUp,
  AlertTriangle,
  Zap,
  Timer,
  FileSpreadsheet,
  Banknote,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency, formatDate, maskBankCard, cn } from '../../utils/format';

interface PayoutItem {
  id: string;
  settlementId: string;
  settlementNo: string;
  workerName: string;
  workerAvatar: string;
  bankAccount: string;
  bankName: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  retryCount: number;
  failReason?: string;
  paidAt?: string;
  transactionNo?: string;
}

interface PayoutBatch {
  id: string;
  batchNo: string;
  createdAt: string;
  payoutTime?: string;
  items: PayoutItem[];
  totalAmount: number;
  status: 'processing' | 'success' | 'failed' | 'partial';
  successCount: number;
  failedCount: number;
  processingCount: number;
}

const mockItems: PayoutItem[] = [
  {
    id: 'pay1001',
    settlementId: 'stl1001',
    settlementNo: 'ST-20260628-0001',
    workerName: '张三',
    workerAvatar: 'Z',
    bankAccount: '6222021234567890123',
    bankName: '中国工商银行上海分行',
    amount: 3054.5,
    status: 'success',
    retryCount: 0,
    paidAt: '2026-06-28T09:32:15Z',
    transactionNo: '20260628100001234567',
  },
  {
    id: 'pay1002',
    settlementId: 'stl1002',
    settlementNo: 'ST-20260626-0002',
    workerName: '李四',
    workerAvatar: 'L',
    bankAccount: '6228482345678901234',
    bankName: '中国农业银行上海分行',
    amount: 3051.6,
    status: 'success',
    retryCount: 0,
    paidAt: '2026-06-26T10:18:42Z',
    transactionNo: '20260626100002345678',
  },
];

const mockBatches: PayoutBatch[] = [
  {
    id: 'batch1001',
    batchNo: 'BATCH-20260628-001',
    createdAt: '2026-06-28T09:30:00Z',
    payoutTime: '2026-06-28T09:32:15Z',
    items: [
      mockItems[0],
      {
        id: 'pay1009',
        settlementId: 'stl1010',
        settlementNo: 'ST-20260628-0010',
        workerName: '赵六',
        workerAvatar: 'Z',
        bankAccount: '6217004567890123456',
        bankName: '中国建设银行上海分行',
        amount: 4520.8,
        status: 'success',
        retryCount: 0,
        paidAt: '2026-06-28T09:33:08Z',
        transactionNo: '20260628100003456789',
      },
      {
        id: 'pay1010',
        settlementId: 'stl1011',
        settlementNo: 'ST-20260628-0011',
        workerName: '钱七',
        workerAvatar: 'Q',
        bankAccount: '6228483456789012345',
        bankName: '中国农业银行北京分行',
        amount: 2180.0,
        status: 'success',
        retryCount: 0,
        paidAt: '2026-06-28T09:33:22Z',
        transactionNo: '20260628100004567890',
      },
    ],
    totalAmount: 3054.5 + 4520.8 + 2180,
    status: 'success',
    successCount: 3,
    failedCount: 0,
    processingCount: 0,
  },
  {
    id: 'batch1002',
    batchNo: 'BATCH-20260628-002',
    createdAt: '2026-06-28T10:15:00Z',
    items: [
      {
        id: 'pay1003',
        settlementId: 'stl1003',
        settlementNo: 'ST-20260628-0003',
        workerName: '张三',
        workerAvatar: 'Z',
        bankAccount: '6222021234567890123',
        bankName: '中国工商银行上海分行',
        amount: 6754,
        status: 'processing',
        retryCount: 0,
      },
      {
        id: 'pay1011',
        settlementId: 'stl1012',
        settlementNo: 'ST-20260628-0012',
        workerName: '孙八',
        workerAvatar: 'S',
        bankAccount: '6222025678901234567',
        bankName: '中国工商银行深圳分行',
        amount: 3420.5,
        status: 'processing',
        retryCount: 0,
      },
      {
        id: 'pay1012',
        settlementId: 'stl1013',
        settlementNo: 'ST-20260628-0013',
        workerName: '周九',
        workerAvatar: 'Z',
        bankAccount: '6217006789012345678',
        bankName: '中国建设银行广州分行',
        amount: 5680.0,
        status: 'success',
        retryCount: 0,
        paidAt: '2026-06-28T10:16:30Z',
        transactionNo: '20260628100005678901',
      },
    ],
    totalAmount: 6754 + 3420.5 + 5680,
    status: 'processing',
    successCount: 1,
    failedCount: 0,
    processingCount: 2,
  },
  {
    id: 'batch1003',
    batchNo: 'BATCH-20260626-001',
    createdAt: '2026-06-26T10:00:00Z',
    payoutTime: '2026-06-26T10:15:00Z',
    items: [
      mockItems[1],
      {
        id: 'pay1004',
        settlementId: 'stl1005',
        settlementNo: 'ST-20260628-0005',
        workerName: '李四',
        workerAvatar: 'L',
        bankAccount: '6228482345678901234',
        bankName: '中国农业银行上海分行',
        amount: 1859.8,
        status: 'failed',
        retryCount: 2,
        failReason: '银行卡账户已销户，请更新银行卡信息',
      },
      {
        id: 'pay1013',
        settlementId: 'stl1014',
        settlementNo: 'ST-20260626-0014',
        workerName: '吴十',
        workerAvatar: 'W',
        bankAccount: '6228487890123456789',
        bankName: '中国农业银行杭州分行',
        amount: 8850.0,
        status: 'success',
        retryCount: 0,
        paidAt: '2026-06-26T10:16:45Z',
        transactionNo: '20260626100006789012',
      },
    ],
    totalAmount: 3051.6 + 1859.8 + 8850,
    status: 'partial',
    successCount: 2,
    failedCount: 1,
    processingCount: 0,
  },
  {
    id: 'batch1004',
    batchNo: 'BATCH-20260625-003',
    createdAt: '2026-06-25T14:30:00Z',
    payoutTime: '2026-06-25T14:45:00Z',
    items: [
      {
        id: 'pay1008',
        settlementId: 'stl1003',
        settlementNo: 'ST-20260628-0003',
        workerName: '张三',
        workerAvatar: 'Z',
        bankAccount: '6222021234567890123',
        bankName: '中国工商银行上海分行',
        amount: 6754,
        status: 'failed',
        retryCount: 3,
        failReason: '银行卡开户行信息有误，请核对后重新发起',
      },
      {
        id: 'pay1014',
        settlementId: 'stl1015',
        settlementNo: 'ST-20260625-0015',
        workerName: '郑十一',
        workerAvatar: 'Z',
        bankAccount: '6217007890123456789',
        bankName: '中国建设银行南京分行',
        amount: 4210.5,
        status: 'failed',
        retryCount: 2,
        failReason: '账户异常冻结，请联系银行解冻',
      },
    ],
    totalAmount: 6754 + 4210.5,
    status: 'failed',
    successCount: 0,
    failedCount: 2,
    processingCount: 0,
  },
];

const pendingForPayout: PayoutItem[] = [
  {
    id: 'pend1001',
    settlementId: 'stl1004',
    settlementNo: 'ST-20260628-0004',
    workerName: '李四',
    workerAvatar: 'L',
    bankAccount: '6228482345678901234',
    bankName: '中国农业银行上海分行',
    amount: 3869.5,
    status: 'pending',
    retryCount: 0,
  },
  {
    id: 'pend1002',
    settlementId: 'stl1006',
    settlementNo: 'ST-20260628-0006',
    workerName: '王五',
    workerAvatar: 'W',
    bankAccount: '6217003456789012345',
    bankName: '中国建设银行上海分行',
    amount: 1922.4,
    status: 'pending',
    retryCount: 0,
  },
  {
    id: 'pend1003',
    settlementId: 'stl1007',
    settlementNo: 'ST-20260625-0007',
    workerName: '王五',
    workerAvatar: 'W',
    bankAccount: '6217003456789012345',
    bankName: '中国建设银行上海分行',
    amount: 21936,
    status: 'pending',
    retryCount: 0,
  },
  {
    id: 'pend1004',
    settlementId: 'stl1008',
    settlementNo: 'ST-20260620-0008',
    workerName: '张三',
    workerAvatar: 'Z',
    bankAccount: '6222021234567890123',
    bankName: '中国工商银行上海分行',
    amount: 35400,
    status: 'pending',
    retryCount: 0,
  },
  {
    id: 'pend1005',
    settlementId: 'stl1016',
    settlementNo: 'ST-20260628-0016',
    workerName: '陈十二',
    workerAvatar: 'C',
    bankAccount: '6228484567890123456',
    bankName: '中国农业银行成都分行',
    amount: 5280.8,
    status: 'pending',
    retryCount: 0,
  },
];

const batchTabs = [
  { key: 'all', label: '全部批次' },
  { key: 'processing', label: '处理中' },
  { key: 'success', label: '全部成功' },
  { key: 'failed', label: '失败/异常' },
];

const batchStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; icon: typeof CheckCircle2 }> = {
  processing: { label: '处理中', variant: 'info', icon: RefreshCw },
  success: { label: '全部成功', variant: 'success', icon: CheckCircle2 },
  partial: { label: '部分成功', variant: 'warning', icon: AlertTriangle },
  failed: { label: '全部失败', variant: 'danger', icon: X },
};

const itemStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  pending: { label: '待发放', variant: 'neutral' },
  processing: { label: '处理中', variant: 'info' },
  success: { label: '已到账', variant: 'success' },
  failed: { label: '发放失败', variant: 'danger' },
};

export default function PayoutCenter() {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [payoutType, setPayoutType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledTime, setScheduledTime] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [batchLaunching, setBatchLaunching] = useState<string | null>(null);

  const statistics = useMemo(() => {
    const allItems = mockBatches.flatMap(b => b.items);
    const totalAmount = allItems.reduce((a, b) => a + (b.status === 'success' ? b.amount : 0), 0);
    const thisMonthSuccess = allItems.filter(i =>
      i.status === 'success' && i.paidAt?.startsWith('2026-06')
    ).reduce((a, b) => a + b.amount, 0);
    const totalSuccess = allItems.filter(i => i.status === 'success').length;
    const totalProcessed = allItems.filter(i => i.status !== 'pending').length;
    const successRate = totalProcessed > 0 ? (totalSuccess / totalProcessed) * 100 : 0;
    return {
      totalAmount,
      thisMonthSuccess,
      successRate,
      pendingCount: pendingForPayout.length,
    };
  }, []);

  const filteredBatches = useMemo(() => {
    return mockBatches.filter(b => {
      if (activeTab === 'all') return true;
      if (activeTab === 'failed') return b.status === 'failed' || b.status === 'partial';
      return b.status === activeTab;
    }).filter(b => {
      if (!searchKeyword) return true;
      const kw = searchKeyword.toLowerCase();
      return b.batchNo.toLowerCase().includes(kw) ||
        b.items.some(i => i.workerName.toLowerCase().includes(kw));
    });
  }, [activeTab, searchKeyword]);

  const toggleExpand = (id: string) => {
    setExpandedBatch(prev => prev === id ? null : id);
  };

  const toggleSelectPayout = (id: string) => {
    setSelectedPayouts(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPayouts.length === pendingForPayout.length) {
      setSelectedPayouts([]);
    } else {
      setSelectedPayouts(pendingForPayout.map(p => p.id));
    }
  };

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    await new Promise(r => setTimeout(r, 1000));
    setRetryingId(null);
  };

  const handleLaunchBatch = async (batchId: string) => {
    setBatchLaunching(batchId);
    await new Promise(r => setTimeout(r, 1500));
    setBatchLaunching(null);
  };

  const selectedTotal = selectedPayouts.reduce(
    (a, id) => a + (pendingForPayout.find(p => p.id === id)?.amount || 0),
    0
  );

  const handleConfirmPayout = async () => {
    await new Promise(r => setTimeout(r, 1500));
    setShowBatchModal(false);
    setSelectedPayouts([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Landmark className="h-7 w-7 text-blue-600" />
            发放中心
          </h1>
          <p className="mt-1 text-sm text-gray-500">银行级安全通道，批量处理工资发放，支持失败重试与实时追踪</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="secondary" leftIcon={<FileSpreadsheet size={16} />}>
            导出明细
          </Button>
          <Button variant="primary" leftIcon={<Send size={16} />} onClick={() => setShowBatchModal(true)}>
            发起批量发放
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="累计发放金额"
          value={formatCurrency(statistics.totalAmount)}
          icon={<Banknote size={22} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          description="自平台上线以来累计发放"
          trend={{ value: 18.5, isUp: true, label: '环比上月' }}
        />
        <StatCard
          title="本月发放"
          value={formatCurrency(statistics.thisMonthSuccess)}
          icon={<TrendingUp size={22} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          description="2026年6月成功发放金额"
          trend={{ value: 22.3, isUp: true, label: '同比上月' }}
        />
        <StatCard
          title="发放成功率"
          value={`${statistics.successRate.toFixed(1)}%`}
          icon={<Shield size={22} />}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          description="最近30天发放成功率"
          trend={{ value: 0.8, isUp: true, label: '较上月' }}
        />
        <StatCard
          title="待处理数量"
          value={`${statistics.pendingCount} 笔`}
          icon={<Timer size={22} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          description={`待发放总额 ${formatCurrency(pendingForPayout.reduce((a, b) => a + b.amount, 0))}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                待发放队列
                <Badge variant="warning" className="ml-1">
                  {pendingForPayout.length} 笔
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {pendingForPayout.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-xl border p-3 transition-all',
                      selectedPayouts.includes(item.id)
                        ? 'border-blue-300 bg-blue-50/50'
                        : 'border-gray-100 bg-gray-50/30 hover:border-gray-200'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedPayouts.includes(item.id)}
                        onChange={() => toggleSelectPayout(item.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm font-semibold">
                        {item.workerAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{item.workerName}</p>
                          <p className="font-bold text-emerald-600">{formatCurrency(item.amount)}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{item.settlementNo}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <CreditCard size={10} />
                          {item.bankName.replace(/银行.*/, '银行')} · {maskBankCard(item.bankAccount).slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingForPayout.length === 0 && (
                  <EmptyState compact title="暂无待发放" description="当前无待发放的结算单" />
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPayouts.length === pendingForPayout.length && pendingForPayout.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  全选
                </label>
                <div className="text-right">
                  <p className="text-xs text-gray-500">已选 {selectedPayouts.length} 笔</p>
                  <p className="text-sm font-bold text-emerald-600">{formatCurrency(selectedTotal)}</p>
                </div>
              </div>
              <Button
                className="w-full mt-3"
                disabled={selectedPayouts.length === 0}
                leftIcon={<Send size={16} />}
                onClick={() => setShowBatchModal(true)}
              >
                发起发放 ({selectedPayouts.length})
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                安全保障
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50/50 p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">银行加密通道</p>
                    <p className="text-xs text-gray-500 mt-0.5">所有打款通过银企直连加密通道，资金全程可控</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-lg bg-blue-50/50 p-3">
                  <Zap className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">快速到账</p>
                    <p className="text-xs text-gray-500 mt-0.5">工作日支持 2 小时内快速到账，节假日顺延</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-lg bg-amber-50/50 p-3">
                  <RefreshCw className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">自动重试机制</p>
                    <p className="text-xs text-gray-500 mt-0.5">失败自动重试最多3次，保障资金准确到账</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1">
                  {batchTabs.map(tab => (
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
                    </button>
                  ))}
                </div>
                <FormField
                  type="input"
                  inputProps={{
                    placeholder: '搜索批次号、姓名...',
                    value: searchKeyword,
                    onChange: e => setSearchKeyword(e.target.value),
                    className: 'w-64',
                  }}
                  leftIcon={<Search size={16} />}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredBatches.length === 0 ? (
              <Card>
                <CardContent>
                  <EmptyState title="暂无发放批次" description="调整筛选条件后重试" />
                </CardContent>
              </Card>
            ) : (
              filteredBatches.map(batch => {
                const statusCfg = batchStatusConfig[batch.status];
                const StatusIcon = statusCfg.icon;
                const totalItems = batch.items.length;
                const isExpanded = expandedBatch === batch.id;
                const progressPercent = ((batch.successCount + batch.failedCount) / totalItems) * 100;
                const hasFailed = batch.items.some(i => i.status === 'failed');

                return (
                  <Card key={batch.id} className={cn(hasFailed && 'border-red-200')}>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-xl',
                            batch.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            batch.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                            batch.status === 'partial' ? 'bg-amber-100 text-amber-600' :
                            'bg-red-100 text-red-600'
                          )}>
                            <Landmark size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-mono font-semibold text-gray-900">{batch.batchNo}</p>
                              <Badge variant={statusCfg.variant} dot>
                                <StatusIcon size={12} />
                                {statusCfg.label}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                创建：{formatDate(batch.createdAt)}
                              </span>
                              {batch.payoutTime && (
                                <span className="flex items-center gap-1">
                                  <Send size={12} />
                                  完成：{formatDate(batch.payoutTime)}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Users size={12} />
                                {totalItems} 笔
                              </span>
                              <span className="font-bold text-emerald-600 text-sm">
                                {formatCurrency(batch.totalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {batch.status === 'processing' && (
                            <Button
                              size="sm"
                              variant="primary"
                              loading={batchLaunching === batch.id}
                              onClick={() => handleLaunchBatch(batch.id)}
                              leftIcon={<Zap size={14} />}
                            >
                              继续发放
                            </Button>
                          )}
                          {hasFailed && (
                            <Button
                              size="sm"
                              variant="danger"
                              leftIcon={<RefreshCw size={14} />}
                            >
                              失败重试
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={<Download size={14} />}
                          >
                            导出
                          </Button>
                          <button
                            onClick={() => toggleExpand(batch.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-emerald-50 p-3">
                          <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} /> 成功</span>
                            <span className="font-bold">{batch.successCount}</span>
                          </div>
                          <ProgressBar value={batch.successCount} max={totalItems} variant="success" size="sm" />
                        </div>
                        <div className="rounded-lg bg-blue-50 p-3">
                          <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                            <span className="flex items-center gap-1"><RefreshCw size={12} /> 处理中</span>
                            <span className="font-bold">{batch.processingCount}</span>
                          </div>
                          <ProgressBar value={batch.processingCount} max={totalItems} variant="primary" size="sm" />
                        </div>
                        <div className="rounded-lg bg-red-50 p-3">
                          <div className="flex items-center justify-between text-xs text-red-700 mb-1">
                            <span className="flex items-center gap-1"><AlertCircle size={12} /> 失败</span>
                            <span className="font-bold">{batch.failedCount}</span>
                          </div>
                          <ProgressBar value={batch.failedCount} max={totalItems} variant="danger" size="sm" />
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">批次整体进度</span>
                          <span className="text-xs font-bold text-gray-900">{Math.round(progressPercent)}%</span>
                        </div>
                        <ProgressBar
                          value={progressPercent}
                          variant={
                            batch.status === 'success' ? 'success' :
                            batch.status === 'failed' ? 'danger' :
                            batch.status === 'partial' ? 'warning' : 'primary'
                          }
                          size="lg"
                        />
                      </div>

                      {isExpanded && (
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2.5 border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                              <History size={12} />
                              发放明细 ({batch.items.length} 条)
                            </p>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-white border-b border-gray-100">
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">收款人</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">银行卡</th>
                                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">金额</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">状态</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">重试</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">失败原因</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">操作</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 bg-white">
                                {batch.items.map(item => {
                                  const itemSt = itemStatusConfig[item.status];
                                  const isFailed = item.status === 'failed';
                                  return (
                                    <tr
                                      key={item.id}
                                      className={cn(isFailed && 'bg-red-50/30')}
                                    >
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs font-semibold">
                                            {item.workerAvatar}
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-gray-900">{item.workerName}</p>
                                            <p className="text-xs text-gray-400 font-mono">{item.settlementNo}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div>
                                          <p className="text-xs text-gray-900">{item.bankName.replace(/(银行|分行).*/, '$1')}</p>
                                          <p className="text-xs font-mono text-gray-500">{maskBankCard(item.bankAccount)}</p>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <span className="text-sm font-bold text-gray-900">{formatCurrency(item.amount)}</span>
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <Badge variant={itemSt.variant} dot>
                                          {itemSt.label}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {item.retryCount > 0 ? (
                                          <span className={cn(
                                            'text-xs font-medium',
                                            item.retryCount >= 3 ? 'text-red-600' : 'text-amber-600'
                                          )}>
                                            {item.retryCount} 次
                                          </span>
                                        ) : (
                                          <span className="text-xs text-gray-400">-</span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        {isFailed ? (
                                          <span className="text-xs text-red-600 flex items-start gap-1 max-w-[200px]">
                                            <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                                            {item.failReason}
                                          </span>
                                        ) : (
                                          <span className="text-xs text-gray-400">-</span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            leftIcon={<Eye size={12} />}
                                          >
                                            详情
                                          </Button>
                                          {isFailed && (
                                            <Button
                                              size="sm"
                                              variant="danger"
                                              loading={retryingId === item.id}
                                              onClick={() => handleRetry(item.id)}
                                              leftIcon={<RefreshCw size={12} />}
                                            >
                                              重试
                                            </Button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        size="xl"
        title={
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            <span>确认批量发放</span>
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              共 <strong>{selectedPayouts.length || pendingForPayout.length}</strong> 笔，
              合计 <strong className="text-emerald-600">{formatCurrency(selectedTotal || pendingForPayout.reduce((a, b) => a + b.amount, 0))}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setShowBatchModal(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={handleConfirmPayout} leftIcon={<Zap size={16} />}>
                确认发放
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="发放方式" type="select" selectProps={{
              value: payoutType,
              onChange: e => setPayoutType(e.target.value as 'immediate' | 'scheduled')
            }}>
              <option value="immediate">立即发放（预计2小时内到账）</option>
              <option value="scheduled">定时发放</option>
            </FormField>
            {payoutType === 'scheduled' && (
              <FormField
                label="发放时间"
                type="input"
                inputProps={{
                  type: 'datetime-local',
                  value: scheduledTime,
                  onChange: e => setScheduledTime(e.target.value),
                  min: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
                }}
              />
            )}
          </div>

          <div className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 space-y-1">
                <p className="font-medium">发放须知</p>
                <ul className="text-xs text-blue-800 space-y-0.5">
                  <li>• 工作日 9:00-17:00 期间提交，预计 2 小时内到账</li>
                  <li>• 非工作时间或节假日提交，顺延至下一个工作日处理</li>
                  <li>• 请确保发放资金账户余额充足，余额不足将导致发放失败</li>
                  <li>• 失败的发放将自动重试最多 3 次，仍失败需人工介入处理</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Users size={14} />
                发放明细 ({selectedPayouts.length || pendingForPayout.length} 人)
              </p>
              <p className="text-xs text-gray-500">
                总金额: <span className="font-bold text-emerald-600">{formatCurrency(selectedTotal || pendingForPayout.reduce((a, b) => a + b.amount, 0))}</span>
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-white sticky top-0">
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">姓名</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">银行账户</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">金额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(selectedPayouts.length > 0
                    ? pendingForPayout.filter(p => selectedPayouts.includes(p.id))
                    : pendingForPayout
                  ).map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-semibold">
                            {item.workerAvatar}
                          </div>
                          <span className="text-sm text-gray-900">{item.workerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-mono text-gray-600">{maskBankCard(item.bankAccount)}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
