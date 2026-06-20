import { useState, useMemo } from 'react';
import {
  Gauge,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Clock,
  Camera,
  MapPin,
  FileText,
  Send,
  ArrowLeft,
  ArrowRight,
  Filter,
  Search,
  FileCheck,
  Building2,
  History,
  Image as ImageIcon,
  ListChecks,
  AlertOctagon,
  Upload,
  Download,
  Link2,
  Database,
  Pause,
  DollarSign,
  TrendingUp,
  ChevronDown,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import type { RiskFlag } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, formatCurrency, timeAgo, cn } from '../../utils/format';

type EvidenceTab = 'contract' | 'checkin' | 'submission' | 'history';
type ReviewConclusion = 'pass' | 'reject' | 'escalate' | null;
type SideFilter = 'all' | 'pending' | 'reviewing' | 'high' | 'medium';

interface WarningItem extends RiskFlag {
  workerName: string;
  taskTitle: string;
  typeLabel: string;
  typeIcon: string;
}

const SIDE_FILTERS: { value: SideFilter; label: string; icon: typeof Clock }[] = [
  { value: 'pending', label: '待处理', icon: Clock },
  { value: 'reviewing', label: '审核中', icon: AlertTriangle },
  { value: 'high', label: '高风险', icon: AlertOctagon },
  { value: 'all', label: '全部', icon: ListChecks },
];

const LEVEL_STYLES = {
  high: {
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
    label: '高风险',
    ring: 'ring-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
  },
  medium: {
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    bar: 'bg-orange-500',
    label: '中风险',
    ring: 'ring-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
  },
  low: {
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-500',
    bar: 'bg-yellow-500',
    label: '低风险',
    ring: 'ring-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
  },
};

const TYPE_LABELS: Record<string, { label: string; icon: typeof MapPin; desc: string }> = {
  location: { label: '位置异常', icon: MapPin, desc: '打卡位置超出工作范围' },
  image_duplicate: { label: '图片重复', icon: Camera, desc: '打卡照片重复使用' },
  abnormal_hours: { label: '异常工时', icon: Clock, desc: '工时超出合理范围' },
  batch_settlement: { label: '集中结算', icon: DollarSign, desc: '短时间内集中发起结算' },
  multi_account: { label: '多账号', icon: Users, desc: '同一设备登录多个账号' },
};

const MOCK_WARNINGS: WarningItem[] = [
  {
    id: 'RF-20250620-001',
    taskId: 'TK-20250618-087',
    workerId: 'W-00128',
    type: 'location',
    level: 'high',
    description: '上班打卡位置距离预设工作地点623米，超出允许的100米范围',
    triggeredAt: '2025-06-20T08:02:15+08:00',
    status: 'pending',
    workerName: '刘建国',
    taskTitle: '朝阳物流园仓库分拣',
    typeLabel: '位置异常',
    typeIcon: 'MapPin',
  },
  {
    id: 'RF-20250620-002',
    taskId: 'TK-20250619-032',
    workerId: 'W-00341',
    type: 'abnormal_hours',
    level: 'high',
    description: '连续7天单日工作时长超过14小时，远超法定上限',
    triggeredAt: '2025-06-20T22:15:30+08:00',
    status: 'reviewing',
    reviewerId: 'R-001',
    workerName: '王志强',
    taskTitle: '朝阳区外卖配送',
    typeLabel: '异常工时',
    typeIcon: 'Clock',
  },
  {
    id: 'RF-20250620-003',
    taskId: 'TK-20250617-156',
    workerId: 'W-00523',
    type: 'image_duplicate',
    level: 'medium',
    description: '近3日打卡照片中有5张与历史照片相似度超过95%',
    triggeredAt: '2025-06-20T11:05:42+08:00',
    status: 'pending',
    workerName: '李明辉',
    taskTitle: '中关村餐厅服务员',
    typeLabel: '图片重复',
    typeIcon: 'Camera',
  },
  {
    id: 'RF-20250619-045',
    taskId: 'TK-20250615-098',
    workerId: 'W-00712',
    type: 'batch_settlement',
    level: 'medium',
    description: '1小时内连续发起12笔结算申请，累计金额¥28,560',
    triggeredAt: '2025-06-19T16:42:10+08:00',
    status: 'reviewing',
    reviewerId: 'R-002',
    workerName: '赵晓东',
    taskTitle: '永辉超市商品理货',
    typeLabel: '集中结算',
    typeIcon: 'DollarSign',
  },
  {
    id: 'RF-20250619-038',
    taskId: 'TK-20250618-221',
    workerId: 'W-00456',
    type: 'multi_account',
    level: 'medium',
    description: '同一设备24小时内登录了6个不同工人账号',
    triggeredAt: '2025-06-19T09:18:55+08:00',
    status: 'pending',
    workerName: '陈大龙',
    taskTitle: '华联商超促销员',
    typeLabel: '多账号',
    typeIcon: 'Users',
  },
];

const HISTORY_WARNINGS = [
  { id: 'RF-20250610-018', type: 'location', level: 'low', triggeredAt: '2025-06-10T09:15:00+08:00', status: 'cleared', reviewComment: 'GPS漂移误报，已解除' },
  { id: 'RF-20250605-007', type: 'abnormal_hours', level: 'medium', triggeredAt: '2025-06-05T23:30:00+08:00', status: 'reviewed', reviewComment: '大促期间临时加班，已核实审批' },
  { id: 'RF-20250528-112', type: 'image_duplicate', level: 'low', triggeredAt: '2025-05-28T18:20:00+08:00', status: 'cleared', reviewComment: '同一地点拍摄背景相同，误报解除' },
];

const CHECKIN_RECORDS = [
  { type: 'checkin', time: '2025-06-20T08:02:15+08:00', location: '39.9189°N, 116.4587°E', address: '朝阳路某咖啡馆', valid: false, distance: 623, photo: 1 },
  { type: 'checkout', time: '2025-06-20T18:05:32+08:00', location: '39.9230°N, 116.4525°E', address: '朝阳物流园A区', valid: true, distance: 45, photo: 2 },
  { type: 'checkin', time: '2025-06-19T07:58:12+08:00', location: '39.9228°N, 116.4521°E', address: '朝阳物流园A区', valid: true, distance: 38, photo: 3 },
  { type: 'checkout', time: '2025-06-19T18:12:45+08:00', location: '39.9231°N, 116.4522°E', address: '朝阳物流园A区', valid: true, distance: 52, photo: 4 },
];

export default function ReviewPanel() {
  const [selectedId, setSelectedId] = useState<string>(MOCK_WARNINGS[0].id);
  const [sideFilter, setSideFilter] = useState<SideFilter>('pending');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [evidenceTab, setEvidenceTab] = useState<EvidenceTab>('contract');
  const [conclusion, setConclusion] = useState<ReviewConclusion>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredWarnings = useMemo(() => {
    return MOCK_WARNINGS.filter((w) => {
      if (sideFilter === 'pending' && w.status !== 'pending') return false;
      if (sideFilter === 'reviewing' && w.status !== 'reviewing') return false;
      if (sideFilter === 'high' && w.level !== 'high') return false;
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        return (
          w.workerName.toLowerCase().includes(kw) ||
          w.taskTitle.toLowerCase().includes(kw) ||
          w.id.toLowerCase().includes(kw)
        );
      }
      return true;
    });
  }, [sideFilter, searchKeyword]);

  const selected = MOCK_WARNINGS.find((w) => w.id === selectedId) ?? MOCK_WARNINGS[0];
  const levelStyle = LEVEL_STYLES[selected.level];
  const typeInfo = TYPE_LABELS[selected.type] ?? TYPE_LABELS.location;
  const TypeIcon = typeInfo.icon;

  const filterCounts = useMemo(() => ({
    pending: MOCK_WARNINGS.filter((w) => w.status === 'pending').length,
    reviewing: MOCK_WARNINGS.filter((w) => w.status === 'reviewing').length,
    high: MOCK_WARNINGS.filter((w) => w.level === 'high').length,
    all: MOCK_WARNINGS.length,
  }), []);

  const evidenceTabs: { key: EvidenceTab; label: string; icon: typeof FileText }[] = [
    { key: 'contract', label: '协议信息', icon: FileCheck },
    { key: 'checkin', label: '打卡记录', icon: MapPin },
    { key: 'submission', label: '任务提交', icon: Upload },
    { key: 'history', label: '历史风控', icon: History },
  ];

  const settlementImpact = {
    baseAmount: 3200,
    affectedAmount: 3200,
    isPaused: true,
    riskDeduction: 0,
    finalPending: 3200,
  };

  const handleSubmit = () => {
    if (!conclusion) return;
    if (!reviewComment.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      alert(`审核提交成功：${conclusion === 'pass' ? '解除风控' : conclusion === 'reject' ? '维持拦截' : '转人工处理'}`);
    }, 800);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gauge className="h-7 w-7 text-indigo-600" />
            风控审核工作台
          </h1>
          <p className="mt-1 text-sm text-gray-500">待处理 {filterCounts.pending} 条 | 审核中 {filterCounts.reviewing} 条</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="warning" dot>
            <Clock className="h-3.5 w-3.5" />
            平均处理时长 2.4h
          </Badge>
          <Badge variant="success" dot={false}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            今日处理 18 条
          </Badge>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        <Card className="lg:col-span-4 xl:col-span-3 p-0 flex flex-col min-h-0 shrink-0" padding="none">
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索工人、任务、预警号..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SIDE_FILTERS.map((f) => {
                const Icon = f.icon;
                const count = filterCounts[f.value];
                const active = sideFilter === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setSideFilter(f.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <Icon size={12} />
                    {f.label}
                    <span className={cn(
                      'inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-semibold',
                      active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredWarnings.length === 0 ? (
              <div className="p-6">
                <EmptyState compact title="无匹配预警" description="调整筛选条件后重试" />
              </div>
            ) : (
              <div className="p-2 space-y-1.5">
                {filteredWarnings.map((w) => {
                  const ls = LEVEL_STYLES[w.level];
                  const isActive = w.id === selectedId;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setSelectedId(w.id)}
                      className={cn(
                        'w-full text-left rounded-xl p-3 transition-all border-2',
                        isActive
                          ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                          : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                          isActive ? 'bg-indigo-100 text-indigo-600' : `${ls.bg} ${ls.text}`
                        )}>
                          <ShieldAlert size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className={cn('text-sm font-semibold truncate', isActive ? 'text-indigo-900' : 'text-gray-900')}>
                              {w.workerName}
                            </p>
                            <span className={cn(
                              'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border',
                              ls.badge
                            )}>
                              <span className={cn('h-1.5 w-1.5 rounded-full', ls.dot)} />
                              {ls.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 truncate mb-1">{w.typeLabel} · {w.taskTitle}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-mono">{w.id.slice(-8)}</span>
                            <span className="text-[10px] text-gray-500">{timeAgo(w.triggeredAt)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 min-h-0 overflow-y-auto">
          <Card padding="none" className="shrink-0">
            <div className={cn('h-2 rounded-t-xl', levelStyle.bar.replace('bg-', 'bg-gradient-to-r from-').replace('-500', '-400 to-') + '-600')} />
            <div className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', levelStyle.bg, levelStyle.text)}>
                      <TypeIcon size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-gray-900">{typeInfo.label}预警审核</h2>
                        <span className={cn('inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold', levelStyle.badge)}>
                          <span className={cn('h-2 w-2 rounded-full', levelStyle.dot)} />
                          {levelStyle.label}
                        </span>
                        {selected.status === 'pending' && <Badge variant="warning" dot>待处理</Badge>}
                        {selected.status === 'reviewing' && <Badge variant="info" dot>审核中</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 font-mono">编号：{selected.id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-[11px] uppercase font-semibold text-gray-500 mb-1">触发时间</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selected.triggeredAt)}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-[11px] uppercase font-semibold text-gray-500 mb-1">涉及工人</p>
                      <p className="text-sm font-medium text-gray-900">{selected.workerName}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-[11px] uppercase font-semibold text-gray-500 mb-1">关联任务</p>
                      <p className="text-sm font-medium text-gray-900 truncate" title={selected.taskTitle}>{selected.taskTitle}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-[11px] uppercase font-semibold text-gray-500 mb-1">任务编号</p>
                      <p className="text-sm font-medium text-gray-900 font-mono">{selected.taskId}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={cn('mt-4 rounded-xl border p-4', levelStyle.border, levelStyle.bg)}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className={cn('h-5 w-5 shrink-0 mt-0.5', levelStyle.text)} />
                  <div>
                    <p className={cn('text-sm font-semibold mb-1', levelStyle.text)}>预警描述</p>
                    <p className={cn('text-sm leading-relaxed', levelStyle.text.replace('text-', 'text-gray-').replace('700', '800'))}>
                      {selected.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card padding="none" className="shrink-0">
            <div className="border-b border-gray-100 px-5 pt-4">
              <div className="flex gap-1 overflow-x-auto">
                {evidenceTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = evidenceTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setEvidenceTab(tab.key)}
                      className={cn(
                        'relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors -mb-px border-b-2',
                        active
                          ? 'text-indigo-600 border-indigo-600'
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                      )}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-5">
              {evidenceTab === 'contract' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        协议摘要
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-50">
                          <span className="text-gray-500">协议编号</span>
                          <span className="font-mono text-gray-900">CT-20250615-087</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-50">
                          <span className="text-gray-500">协议版本</span>
                          <span className="text-gray-900">v2.3.1 (最新版)</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-50">
                          <span className="text-gray-500">任务类型</span>
                          <span className="text-gray-900">计时 · 仓库分拣</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-50">
                          <span className="text-gray-500">约定工时</span>
                          <span className="text-gray-900">8小时/天 × 5天</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-50">
                          <span className="text-gray-500">时薪标准</span>
                          <span className="text-gray-900">¥25/小时</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-500">预估总额</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(4000)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-indigo-600" />
                        签署与存证
                      </h4>
                      <div className="space-y-3">
                        <div className="rounded-xl border border-gray-100 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-900">签署状态</span>
                            <Badge variant="success">三方已签署</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                                <Building2 size={18} />
                              </div>
                              <p className="text-xs font-medium text-gray-900">企业方</p>
                              <p className="text-[10px] text-gray-500">06-15 09:22</p>
                            </div>
                            <div>
                              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                                <User size={18} />
                              </div>
                              <p className="text-xs font-medium text-gray-900">工人方</p>
                              <p className="text-[10px] text-gray-500">06-15 09:25</p>
                            </div>
                            <div>
                              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                                <Shield size={18} />
                              </div>
                              <p className="text-xs font-medium text-gray-900">平台方</p>
                              <p className="text-[10px] text-gray-500">06-15 09:26</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-gray-100 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-900">区块链存证</span>
                          </div>
                          <div className="space-y-1.5 font-mono text-[11px] bg-gray-50 rounded-lg p-2.5 text-gray-600">
                            <p>Hash: 0x8f3a...e21b</p>
                            <p>区块: #18,542,673</p>
                            <p>存证时间: 2025-06-15 09:26:42</p>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="secondary" leftIcon={<Download size={14} />}>下载协议</Button>
                            <Button size="sm" variant="ghost" leftIcon={<Link2 size={14} />}>验真</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {evidenceTab === 'checkin' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-rose-600" />
                        位置比对分析
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-white/80 p-3 border border-gray-200">
                          <p className="text-[11px] font-semibold text-emerald-700 mb-1">工作地点（预设）</p>
                          <p className="text-sm font-medium text-gray-900">朝阳物流园A区</p>
                          <p className="text-[11px] text-gray-500 mt-1 font-mono">39.9231°N, 116.4523°E</p>
                        </div>
                        <div className="rounded-lg bg-white/80 p-3 border border-rose-200">
                          <p className="text-[11px] font-semibold text-rose-700 mb-1">异常打卡位置</p>
                          <p className="text-sm font-medium text-gray-900">朝阳路某咖啡馆</p>
                          <p className="text-[11px] text-gray-500 mt-1 font-mono">39.9189°N, 116.4587°E</p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-lg bg-white p-3 border border-gray-200 flex items-center justify-between">
                        <span className="text-xs text-gray-500">距离偏差</span>
                        <span className="text-lg font-bold text-rose-600">623 米</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-center min-h-[180px]">
                      <div className="text-center">
                        <div className="h-12 w-12 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-2">
                          <MapPin size={24} />
                        </div>
                        <p className="text-sm font-medium text-gray-600">地图可视化区域</p>
                        <p className="text-xs text-gray-400 mt-0.5">集成地图组件展示位置轨迹</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      打卡时间线
                    </h4>
                    <div className="relative pl-6">
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />
                      {CHECKIN_RECORDS.map((record, idx) => (
                        <div key={idx} className="relative pb-5 last:pb-0">
                          <div className={cn(
                            'absolute -left-[13px] top-1 h-6 w-6 rounded-full border-4 border-white shadow flex items-center justify-center',
                            record.valid ? 'bg-emerald-500' : 'bg-rose-500'
                          )}>
                            {record.type === 'checkin' ? <Clock size={10} className="text-white" /> : <ArrowRight size={10} className="text-white" />}
                          </div>
                          <div className={cn(
                            'rounded-xl border p-4 ml-2',
                            record.valid ? 'border-gray-200 bg-white' : 'border-rose-200 bg-rose-50/40'
                          )}>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={record.valid ? 'success' : 'danger'}>
                                  {record.type === 'checkin' ? '上班打卡' : '下班打卡'}
                                </Badge>
                                {!record.valid && <Badge variant="warning">位置异常</Badge>}
                              </div>
                              <span className="text-xs text-gray-500 font-mono">{formatDate(record.time)}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div className="flex items-start gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-gray-500">地址</p>
                                  <p className="text-gray-900 font-medium">{record.address}</p>
                                  <p className="text-gray-400 font-mono">{record.location}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-gray-500">距离工作点</p>
                                  <p className={cn('font-semibold', record.valid ? 'text-emerald-600' : 'text-rose-600')}>
                                    {record.distance} 米
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-1.5">
                                <Camera className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-gray-500">打卡照片</p>
                                  <div className="h-10 w-10 mt-1 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                    <ImageIcon size={16} className="text-blue-400" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {evidenceTab === 'submission' && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Upload className="h-4 w-4 text-teal-600" />
                        成果物提交记录
                      </h4>
                      <Badge variant="success">已完成验收</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500 mb-1">提交日期</p>
                        <p className="font-medium text-gray-900">2025-06-20</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500 mb-1">提交数量</p>
                        <p className="font-medium text-gray-900">128 件</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500 mb-1">验收人员</p>
                        <p className="font-medium text-gray-900">张主管</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-blue-600" />
                      成果物照片（共 6 张）
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-gradient-to-br overflow-hidden border border-gray-200 hover:shadow-md transition-shadow relative group cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/60 via-indigo-200/40 to-purple-200/60 flex items-center justify-center">
                            <Camera size={32} className="text-white/70" />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            照片 {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-800 mb-1">验收记录</p>
                        <p className="text-sm text-emerald-700">经企业方验收，分拣数量与质量均符合要求，通过验收。</p>
                        <p className="text-xs text-emerald-600 mt-1">验收人：张主管 · 2025-06-20 18:35</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {evidenceTab === 'history' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">3</p>
                      <p className="text-xs text-gray-500 mt-1">历史预警总数</p>
                    </div>
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
                      <p className="text-2xl font-bold text-red-700">0</p>
                      <p className="text-xs text-red-600 mt-1">高风险记录</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-700">66%</p>
                      <p className="text-xs text-emerald-600 mt-1">误报解除率</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {HISTORY_WARNINGS.map((h) => {
                      const ls = LEVEL_STYLES[h.level as 'low' | 'medium' | 'high'];
                      const tInfo = TYPE_LABELS[h.type] ?? TYPE_LABELS.location;
                      return (
                        <div key={h.id} className="rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium', ls.badge)}>
                                <span className={cn('h-1.5 w-1.5 rounded-full', ls.dot)} />
                                {ls.label}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{tInfo.label}</span>
                              <span className="text-xs font-mono text-gray-400">#{h.id}</span>
                            </div>
                            {h.status === 'cleared' && <Badge variant="success">已解除</Badge>}
                            {h.status === 'reviewed' && <Badge variant="neutral">已审核</Badge>}
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">{formatDate(h.triggeredAt)}</span>
                            <span className="text-xs text-gray-400">{timeAgo(h.triggeredAt)}</span>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-2.5 text-xs text-gray-700">
                            <span className="font-medium text-gray-500">处理意见：</span>{h.reviewComment}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card padding="none" className="shrink-0">
            <CardHeader className="px-5 py-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  结算影响分析
                </CardTitle>
                <CardDescription>该风控预警对本笔结算的影响评估</CardDescription>
              </div>
              {settlementImpact.isPaused && (
                <Badge variant="warning" dot>
                  <Pause className="h-3 w-3" />
                  结算已暂停
                </Badge>
              )}
            </CardHeader>
            <div className="px-5 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 mb-1">本金金额</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(settlementImpact.baseAmount)}</p>
                </div>
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
                  <p className="text-xs text-rose-600 mb-1">受影响金额</p>
                  <p className="text-lg font-bold text-rose-700">{formatCurrency(settlementImpact.affectedAmount)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 mb-1">风险扣款</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(settlementImpact.riskDeduction)}</p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-xs text-amber-700 mb-1">待处理金额</p>
                  <p className="text-lg font-bold text-amber-700">{formatCurrency(settlementImpact.finalPending)}</p>
                </div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-900 mb-0.5">风控建议</p>
                  <p className="text-amber-800 leading-relaxed">
                    鉴于本次预警为<span className="font-medium">高风险位置异常</span>，建议暂缓本笔结算发放，
                    待审核完成确认是否存在代打卡行为后再行处理。如审核通过，将全额发放；如确认违规，按协议条款扣除当日工资。
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card padding="none" className="shrink-0 border-2 border-indigo-100">
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <CardHeader className="px-5 py-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  审核结论
                </CardTitle>
                <CardDescription>请根据以上证据做出审核判断，审核意见必填</CardDescription>
              </div>
            </CardHeader>
            <div className="px-5 pb-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setConclusion('pass')}
                  className={cn(
                    'relative rounded-xl border-2 p-4 text-left transition-all group',
                    conclusion === 'pass'
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-500/10'
                      : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                  )}
                >
                  {conclusion === 'pass' && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                  )}
                  <div className={cn(
                    'h-11 w-11 rounded-xl flex items-center justify-center mb-3 transition-colors',
                    conclusion === 'pass' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'
                  )}>
                    <CheckCircle2 size={22} />
                  </div>
                  <p className={cn('text-sm font-semibold', conclusion === 'pass' ? 'text-emerald-900' : 'text-gray-900')}>通过审核</p>
                  <p className={cn('text-xs mt-0.5', conclusion === 'pass' ? 'text-emerald-700' : 'text-gray-500')}>解除风控，正常结算</p>
                </button>

                <button
                  onClick={() => setConclusion('reject')}
                  className={cn(
                    'relative rounded-xl border-2 p-4 text-left transition-all group',
                    conclusion === 'reject'
                      ? 'border-rose-500 bg-rose-50 shadow-sm shadow-rose-500/10'
                      : 'border-gray-200 bg-white hover:border-rose-300 hover:bg-rose-50/30'
                  )}
                >
                  {conclusion === 'reject' && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                  )}
                  <div className={cn(
                    'h-11 w-11 rounded-xl flex items-center justify-center mb-3 transition-colors',
                    conclusion === 'reject' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600 group-hover:bg-rose-200'
                  )}>
                    <XCircle size={22} />
                  </div>
                  <p className={cn('text-sm font-semibold', conclusion === 'reject' ? 'text-rose-900' : 'text-gray-900')}>驳回</p>
                  <p className={cn('text-xs mt-0.5', conclusion === 'reject' ? 'text-rose-700' : 'text-gray-500')}>维持拦截，按违规处理</p>
                </button>

                <button
                  onClick={() => setConclusion('escalate')}
                  className={cn(
                    'relative rounded-xl border-2 p-4 text-left transition-all group',
                    conclusion === 'escalate'
                      ? 'border-orange-500 bg-orange-50 shadow-sm shadow-orange-500/10'
                      : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                  )}
                >
                  {conclusion === 'escalate' && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                  )}
                  <div className={cn(
                    'h-11 w-11 rounded-xl flex items-center justify-center mb-3 transition-colors',
                    conclusion === 'escalate' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'
                  )}>
                    <MoreHorizontal size={22} />
                  </div>
                  <p className={cn('text-sm font-semibold', conclusion === 'escalate' ? 'text-orange-900' : 'text-gray-900')}>转人工</p>
                  <p className={cn('text-xs mt-0.5', conclusion === 'escalate' ? 'text-orange-700' : 'text-gray-500')}>升级资深团队处理</p>
                </button>
              </div>

              <FormField
                label="审核意见"
                required
                type="textarea"
                textareaProps={{
                  rows: 4,
                  placeholder: '请详细说明审核判断依据和处理意见，例如：核实为 GPS 信号漂移导致位置异常，工人实际在岗，解除风控...',
                  value: reviewComment,
                  onChange: (e) => setReviewComment(e.target.value),
                }}
                error={conclusion && !reviewComment.trim() ? '请输入审核意见' : undefined}
                hint="审核意见将同步给企业方和工人方，请客观公正描述"
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="sm:order-1"
                  leftIcon={<ArrowLeft size={16} />}
                >
                  上一条
                </Button>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  className="sm:order-2"
                  leftIcon={<Clock size={16} />}
                >
                  暂存
                </Button>
                <Button
                  variant="secondary"
                  className="sm:order-3"
                  rightIcon={<ArrowRight size={16} />}
                >
                  跳过
                </Button>
                <Button
                  variant="primary"
                  loading={submitting}
                  disabled={!conclusion || !reviewComment.trim()}
                  className="sm:order-4"
                  onClick={handleSubmit}
                  rightIcon={<Send size={16} />}
                  size="md"
                >
                  提交审核
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
