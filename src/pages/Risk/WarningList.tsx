import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Shield,
  MapPin,
  Image,
  Clock,
  CreditCard,
  Users,
  Search,
  Filter,
  ChevronDown,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
  FileText,
  Bell,
  History,
  Zap,
} from 'lucide-react';
import type { RiskFlag } from '@shared/types';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, timeAgo, cn } from '../../utils/format';

type LevelFilter = 'all' | 'high' | 'medium' | 'low';
type WarningType = 'location' | 'image_duplicate' | 'abnormal_hours' | 'batch_settlement' | 'multi_account';
type StatusFilter = 'all' | 'pending' | 'reviewing' | 'reviewed' | 'cleared';

const WARNING_TYPES: { value: WarningType; label: string; icon: typeof MapPin; desc: string }[] = [
  { value: 'location', label: '位置异常', icon: MapPin, desc: '打卡位置超出工作范围' },
  { value: 'image_duplicate', label: '图片重复', icon: Image, desc: '打卡照片重复使用' },
  { value: 'abnormal_hours', label: '异常工时', icon: Clock, desc: '工时超出合理范围' },
  { value: 'batch_settlement', label: '集中结算', icon: CreditCard, desc: '短时间内集中发起结算' },
  { value: 'multi_account', label: '多账号', icon: Users, desc: '同一设备登录多个账号' },
];

const LEVEL_COLORS = {
  high: {
    bar: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    card: 'border-l-4 border-l-red-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  medium: {
    bar: 'bg-orange-500',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    card: 'border-l-4 border-l-orange-500',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  low: {
    bar: 'bg-yellow-500',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-500',
    card: 'border-l-4 border-l-yellow-500',
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
};

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; dot: boolean }> = {
  pending: { label: '待处理', variant: 'warning', dot: true },
  reviewing: { label: '审核中', variant: 'info', dot: true },
  reviewed: { label: '已审核', variant: 'neutral', dot: false },
  cleared: { label: '已解除', variant: 'success', dot: false },
};

const MOCK_WARNINGS: RiskFlag[] = [
  {
    id: 'RF-20250620-001',
    taskId: 'TK-20250618-087',
    workerId: 'W-00128',
    type: 'location',
    level: 'high',
    description: '上班打卡位置距离预设工作地点623米，超出允许的100米范围',
    triggeredAt: '2025-06-20T08:02:15+08:00',
    status: 'pending',
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
  },
  {
    id: 'RF-20250619-038',
    taskId: 'TK-20250618-221',
    workerId: 'W-00456',
    type: 'multi_account',
    level: 'medium',
    description: '同一设备24小时内登录了6个不同工人账号',
    triggeredAt: '2025-06-19T09:18:55+08:00',
    status: 'reviewed',
    reviewerId: 'R-001',
    reviewComment: '确认为同一工头管理多个工人账号，已标记备案',
  },
  {
    id: 'RF-20250618-092',
    taskId: 'TK-20250616-078',
    workerId: 'W-00891',
    type: 'location',
    level: 'low',
    description: '打卡位置偏离工作地点120米，略微超出范围',
    triggeredAt: '2025-06-18T08:30:22+08:00',
    status: 'cleared',
    reviewerId: 'R-003',
    reviewComment: 'GPS漂移误差，已解除',
  },
  {
    id: 'RF-20250618-076',
    taskId: 'TK-20250617-045',
    workerId: 'W-00234',
    type: 'image_duplicate',
    level: 'low',
    description: '连续两天打卡照片背景相同，疑似在固定地点拍摄',
    triggeredAt: '2025-06-18T17:55:12+08:00',
    status: 'cleared',
    reviewerId: 'R-001',
    reviewComment: '工人确认为在工位自拍，属于正常情况',
  },
];

const WORKER_INFO: Record<string, { name: string; avatar: string; company: string }> = {
  'W-00128': { name: '刘建国', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liu', company: '恒通物流有限公司' },
  'W-00341': { name: '王志强', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang', company: '顺丰速运' },
  'W-00523': { name: '李明辉', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li', company: '美味餐饮集团' },
  'W-00712': { name: '赵晓东', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao', company: '永辉超市' },
  'W-00456': { name: '陈大龙', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen', company: '华联商超' },
  'W-00891': { name: '孙美华', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sun', company: '物美便利店' },
  'W-00234': { name: '周国强', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhou', company: '京东物流' },
};

const TASK_INFO: Record<string, { title: string; type: string; amount: number }> = {
  'TK-20250618-087': { title: '朝阳物流园仓库分拣', type: 'hourly', amount: 3200 },
  'TK-20250619-032': { title: '朝阳区外卖配送', type: 'hourly', amount: 5600 },
  'TK-20250617-156': { title: '中关村餐厅服务员', type: 'hourly', amount: 2800 },
  'TK-20250615-098': { title: '永辉超市商品理货', type: 'piecework', amount: 28560 },
  'TK-20250618-221': { title: '华联商超促销员', type: 'hourly', amount: 3600 },
  'TK-20250616-078': { title: '物美便利店收银员', type: 'hourly', amount: 2400 },
  'TK-20250617-045': { title: '京东物流分拣', type: 'piecework', amount: 4200 },
};

const RULE_DESC: Record<WarningType | string, { title: string; detail: string; threshold: string }> = {
  location: { title: '位置风控规则', detail: '打卡GPS坐标与工作地点坐标距离计算', threshold: '允许范围：≤100米' },
  image_duplicate: { title: '图像比对规则', detail: '基于感知哈希算法(pHash)计算图片指纹相似度', threshold: '相似度阈值：≥90%' },
  abnormal_hours: { title: '工时统计规则', detail: '每日、每周累计工时与法定标准比对', threshold: '单日≤11小时，周≤44小时' },
  batch_settlement: { title: '结算频次规则', detail: '单位时间内结算申请数量和金额监控', threshold: '1小时内≤5笔，≤¥10000' },
  multi_account: { title: '设备指纹规则', detail: '基于设备ID、IP地址的账号关联检测', threshold: '单设备24h内≤3个账号' },
};

function getWarningTypeInfo(type: string) {
  return WARNING_TYPES.find((w) => w.value === type) ?? WARNING_TYPES[0];
}

export default function WarningList() {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const stats = useMemo(() => {
    const total = MOCK_WARNINGS.length;
    const pending = MOCK_WARNINGS.filter((w) => w.status === 'pending' || w.status === 'reviewing').length;
    const high = MOCK_WARNINGS.filter((w) => w.level === 'high').length;
    const medium = MOCK_WARNINGS.filter((w) => w.level === 'medium').length;
    const low = MOCK_WARNINGS.filter((w) => w.level === 'low').length;
    return { total, pending, high, medium, low };
  }, []);

  const filteredWarnings = useMemo(() => {
    return MOCK_WARNINGS.filter((w) => {
      if (levelFilter !== 'all' && w.level !== levelFilter) return false;
      if (typeFilter !== 'all' && w.type !== typeFilter) return false;
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        const worker = WORKER_INFO[w.workerId]?.name ?? '';
        const task = TASK_INFO[w.taskId ?? '']?.title ?? '';
        if (
          !w.id.toLowerCase().includes(kw) &&
          !worker.toLowerCase().includes(kw) &&
          !task.toLowerCase().includes(kw) &&
          !w.description.toLowerCase().includes(kw)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [levelFilter, typeFilter, statusFilter, searchKeyword, dateRange]);

  const handleReview = (id: string) => {
    console.log('Go to review:', id);
  };

  const handleMarkRead = (id: string) => {
    console.log('Mark read:', id);
  };

  const handleIgnore = (id: string) => {
    console.log('Ignore:', id);
  };

  const levelTabs: { value: LevelFilter; label: string; count: number; colorClass: string }[] = [
    { value: 'all', label: '全部', count: stats.total, colorClass: 'data-[active=true]:bg-gray-900 data-[active=true]:text-white' },
    { value: 'high', label: '高风险', count: stats.high, colorClass: 'data-[active=true]:bg-red-600 data-[active=true]:text-white' },
    { value: 'medium', label: '中风险', count: stats.medium, colorClass: 'data-[active=true]:bg-orange-500 data-[active=true]:text-white' },
    { value: 'low', label: '低风险', count: stats.low, colorClass: 'data-[active=true]:bg-yellow-500 data-[active=true]:text-white' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-red-600" />
            风控预警中心
          </h1>
          <p className="mt-1 text-sm text-gray-500">AI智能风控引擎实时识别异常行为，保护平台资金与交易安全</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Badge variant="warning" dot>
            <Bell className="h-3.5 w-3.5" />
            待处理 {stats.pending}
          </Badge>
          <Badge variant="danger" dot>
            <Zap className="h-3.5 w-3.5" />
            高风险 {stats.high}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          title="预警总数"
          value={stats.total}
          icon={<AlertTriangle size={22} />}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          description="累计产生预警"
        />
        <StatCard
          title="待处理"
          value={stats.pending}
          icon={<Clock size={22} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          description="等待人工审核"
          trend={{ value: 15, isUp: true, label: '较昨日' }}
        />
        <StatCard
          title="高风险"
          value={stats.high}
          icon={<ShieldAlert size={22} />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          description="严重违规预警"
        />
        <StatCard
          title="中风险"
          value={stats.medium}
          icon={<AlertTriangle size={22} />}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          description="需关注异常"
        />
        <StatCard
          title="低风险"
          value={stats.low}
          icon={<Shield size={22} />}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
          description="轻微异常提示"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 p-1 gap-1 overflow-x-auto">
          {levelTabs.map((tab) => (
            <button
              key={tab.value}
              data-active={levelFilter === tab.value}
              onClick={() => setLevelFilter(tab.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                levelFilter === tab.value
                  ? tab.colorClass
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-xs font-semibold',
                  levelFilter === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索预警编号、工人姓名、任务名称..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                rightIcon={<ChevronDown className={cn('h-4 w-4 transition-transform', showFilters && 'rotate-180')} />}
              >
                <Filter className="h-4 w-4" />
                筛选
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">预警类型</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="all">全部类型</option>
                  {WARNING_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">处理状态</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="all">全部状态</option>
                  <option value="pending">待处理</option>
                  <option value="reviewing">审核中</option>
                  <option value="reviewed">已审核</option>
                  <option value="cleared">已解除</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">时间范围</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="today">今日</option>
                  <option value="week">近7天</option>
                  <option value="month">近30天</option>
                  <option value="all">全部</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <CardContent padding="none">
          {filteredWarnings.length === 0 ? (
            <div className="p-8">
              <EmptyState compact icon={<Shield className="h-8 w-8" />} title="暂无符合条件的预警" description="尝试调整筛选条件查看更多" />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[22px] top-6 bottom-6 w-0.5 bg-gray-200" aria-hidden="true" />
              <div className="divide-y divide-gray-50">
                {filteredWarnings.map((warning) => {
                  const colors = LEVEL_COLORS[warning.level];
                  const typeInfo = getWarningTypeInfo(warning.type);
                  const TypeIcon = typeInfo.icon;
                  const statusInfo = STATUS_MAP[warning.status];
                  const worker = WORKER_INFO[warning.workerId ?? ''];
                  const task = TASK_INFO[warning.taskId ?? ''];
                  const rule = RULE_DESC[warning.type];

                  return (
                    <div key={warning.id} className="relative p-5 pl-14">
                      <div
                        className={cn(
                          'absolute left-[14px] top-7 h-4 w-4 rounded-full border-4 border-white shadow',
                          colors.dot
                        )}
                      />
                      <div className={cn('rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow', colors.card)}>
                        <div className="p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', colors.iconBg, colors.iconColor)}>
                                <TypeIcon size={22} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  <h3 className="text-base font-semibold text-gray-900">{typeInfo.label}预警</h3>
                                  <Badge variant={statusInfo.variant} dot={statusInfo.dot}>
                                    {statusInfo.label}
                                  </Badge>
                                  <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium', colors.badge)}>
                                    <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
                                    {warning.level === 'high' ? '高风险' : warning.level === 'medium' ? '中风险' : '低风险'}
                                  </span>
                                  <span className="text-xs font-mono text-gray-400">#{warning.id}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <History className="h-3.5 w-3.5" />
                                    {formatDate(warning.triggeredAt)}
                                    <span className="text-gray-400">({timeAgo(warning.triggeredAt)})</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button size="sm" variant="primary" onClick={() => handleReview(warning.id)} rightIcon={<ArrowRight size={14} />}>
                                去审核
                              </Button>
                              {warning.status === 'pending' && (
                                <Button size="sm" variant="secondary" onClick={() => handleMarkRead(warning.id)}>
                                  <Eye size={14} />
                                  标记已读
                                </Button>
                              )}
                              {warning.level === 'low' && warning.status !== 'cleared' && (
                                <Button size="sm" variant="ghost" onClick={() => handleIgnore(warning.id)}>
                                  <XCircle size={14} />
                                  忽略
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="rounded-xl bg-gray-50 p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="h-6 w-1 rounded-full bg-blue-500" />
                                <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wide">涉及人员与任务</h4>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-white shadow-sm">
                                    {worker?.name?.charAt(0) ?? 'W'}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                      <p className="text-sm font-medium text-gray-900 truncate">{worker?.name ?? '-'}</p>
                                      <span className="text-xs text-gray-400 font-mono shrink-0">{warning.workerId}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{worker?.company ?? '-'}</p>
                                  </div>
                                </div>
                                <div className="rounded-lg bg-white border border-gray-100 p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <span className="text-xs font-medium text-gray-700">{task?.title ?? '-'}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">{task?.type === 'hourly' ? '计时任务' : '计件任务'}</span>
                                    <span className="font-semibold text-gray-900">涉及金额 ¥{task?.amount?.toLocaleString() ?? '0'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="rounded-xl border border-gray-100 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className={cn('h-4 w-4 shrink-0', colors.iconColor)} />
                                  <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wide">预警详情</h4>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">{warning.description}</p>
                              </div>

                              <div className="rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-100 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Shield className="h-4 w-4 shrink-0 text-slate-600" />
                                  <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wide">触发规则</h4>
                                </div>
                                <div className="space-y-1.5">
                                  <p className="text-sm font-medium text-gray-900">{rule?.title}</p>
                                  <p className="text-xs text-gray-600">{rule?.detail}</p>
                                  <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200/60">
                                    <CheckCircle2 className="h-3 w-3 inline mr-1 text-gray-400" />
                                    {rule?.threshold}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {warning.reviewComment && (
                            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div className="text-sm">
                                <span className="font-medium text-emerald-800">审核意见：</span>
                                <span className="text-emerald-700">{warning.reviewComment}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-red-500 via-orange-500 to-yellow-500" />
          <h3 className="text-sm font-semibold text-gray-900">预警类型说明</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {WARNING_TYPES.map((t) => {
            const TypeIcon = t.icon;
            return (
              <div key={t.value} className="rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <TypeIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                    <p className="text-xs text-gray-500">{t.value}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
