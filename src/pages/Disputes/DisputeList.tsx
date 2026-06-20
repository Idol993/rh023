import { useState, useMemo } from 'react';
import {
  Scale,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  Eye,
  User,
  FileText,
  Calendar,
  MessageSquare,
  Building2,
  Plus,
  X,
  Upload,
  Image,
  Send,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Gavel,
  Paperclip,
  FileCheck,
  ThumbsUp,
  ThumbsDown,
  History,
  ArrowRight,
  XCircle,
  MapPin,
  Camera,
  MoreHorizontal,
  Ban,
  Sparkles,
  ListChecks,
  Download,
} from 'lucide-react';
import type { Dispute } from '@shared/types';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/ui/FormField';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, formatCurrency, timeAgo, cn } from '../../utils/format';

type DisputeTab = 'all' | 'pending' | 'reviewing' | 'resolved' | 'closed';
type DisputeType = 'hours' | 'deduction' | 'amount' | 'quality' | 'other';

interface DisputeItem extends Dispute {
  title: string;
  initiatorRole: 'worker' | 'company';
  initiatorName: string;
  initiatorAvatar: string;
  responderName: string;
  responderRole: 'worker' | 'company';
  taskTitle: string;
  amount: number;
  priority: 'high' | 'medium' | 'low';
  typeLabel: string;
  timeline: { stage: string; time: string; active: boolean; done: boolean; operator?: string }[];
}

const TABS: { value: DisputeTab; label: string; icon: typeof Clock }[] = [
  { value: 'all', label: '全部', icon: ListChecks },
  { value: 'pending', label: '待处理', icon: Clock },
  { value: 'reviewing', label: '处理中', icon: AlertCircle },
  { value: 'resolved', label: '已解决', icon: CheckCircle2 },
  { value: 'closed', label: '已关闭', icon: XCircle },
];

const TYPE_CONFIG: Record<DisputeType | string, { label: string; icon: typeof FileText; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  hours: { label: '工时争议', icon: Clock, variant: 'info' },
  deduction: { label: '扣款争议', icon: Ban, variant: 'warning' },
  amount: { label: '结算金额', icon: FileText, variant: 'danger' },
  quality: { label: '质量验收', icon: FileCheck, variant: 'warning' },
  other: { label: '其他', icon: MoreHorizontal, variant: 'neutral' },
};

const PRIORITY_STYLES = {
  high: { badge: 'bg-red-50 text-red-700 border-red-200', label: '紧急', dot: 'bg-red-500' },
  medium: { badge: 'bg-orange-50 text-orange-700 border-orange-200', label: '普通', dot: 'bg-orange-500' },
  low: { badge: 'bg-blue-50 text-blue-700 border-blue-200', label: '一般', dot: 'bg-blue-500' },
};

const STATUS_STYLES: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; dot: boolean }> = {
  pending: { label: '待受理', variant: 'warning', dot: true },
  reviewing: { label: '处理中', variant: 'info', dot: true },
  resolved: { label: '已解决', variant: 'success', dot: false },
  closed: { label: '已关闭', variant: 'neutral', dot: false },
};

const MOCK_DISPUTES: DisputeItem[] = [
  {
    id: 'DISP-20250620-001',
    initiatorId: 'W-00128',
    taskId: 'TK-20250618-087',
    type: 'hours',
    description: '实际工作时长8小时×5天=40小时，但企业结算只按36小时计算，少算4小时工资，时薪25元/小时，少付100元',
    evidence: [],
    status: 'reviewing',
    resolution: '正在核实打卡记录与工时统计',
    createdAt: '2025-06-20T09:30:15+08:00',
    title: '实际工作时长与结算时长不符',
    initiatorRole: 'worker',
    initiatorName: '刘建国',
    initiatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liu',
    responderName: '恒通物流有限公司',
    responderRole: 'company',
    taskTitle: '朝阳物流园仓库分拣',
    amount: 100,
    priority: 'high',
    typeLabel: '工时争议',
    timeline: [
      { stage: '发起申诉', time: '06-20 09:30', done: true, active: false },
      { stage: '平台受理', time: '06-20 09:45', done: true, active: false, operator: '系统自动' },
      { stage: '企业举证', time: '06-20 10:20', done: true, active: false, operator: '恒通物流' },
      { stage: '平台仲裁中', time: '进行中', done: false, active: true, operator: '仲裁员：王老师' },
      { stage: '处理完成', time: '待完成', done: false, active: false },
    ],
  },
  {
    id: 'DISP-20250620-002',
    initiatorId: 'W-00341',
    taskId: 'TK-20250619-032',
    type: 'amount',
    description: '本人6月15日-6月19日期间共完成配送260单，但企业系统只显示240单，缺少20单结算，涉及金额约560元',
    evidence: [],
    status: 'pending',
    createdAt: '2025-06-20T11:20:30+08:00',
    title: '配送单量统计差异',
    initiatorRole: 'worker',
    initiatorName: '王志强',
    initiatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
    responderName: '顺丰速运',
    responderRole: 'company',
    taskTitle: '朝阳区外卖配送',
    amount: 560,
    priority: 'high',
    typeLabel: '结算金额',
    timeline: [
      { stage: '发起申诉', time: '06-20 11:20', done: true, active: false },
      { stage: '平台受理', time: '待分配', done: false, active: true },
      { stage: '企业举证', time: '待开始', done: false, active: false },
      { stage: '平台仲裁中', time: '待开始', done: false, active: false },
      { stage: '处理完成', time: '待完成', done: false, active: false },
    ],
  },
  {
    id: 'DISP-20250619-045',
    initiatorId: 'C-0008',
    taskId: 'TK-20250615-098',
    type: 'quality',
    description: '理货工人未按标准分类摆放商品，多个货架商品混放，导致后续盘点出现误差，要求扣除当日工资20%作为赔偿',
    evidence: [],
    status: 'pending',
    createdAt: '2025-06-19T16:42:10+08:00',
    title: '商品分类摆放不符合验收标准',
    initiatorRole: 'company',
    initiatorName: '永辉超市',
    initiatorAvatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=yonghui',
    responderName: '赵晓东',
    responderRole: 'worker',
    taskTitle: '永辉超市商品理货',
    amount: 360,
    priority: 'medium',
    typeLabel: '质量验收',
    timeline: [
      { stage: '发起申诉', time: '06-19 16:42', done: true, active: false },
      { stage: '平台受理', time: '待分配', done: false, active: true },
      { stage: '工人举证', time: '待开始', done: false, active: false },
      { stage: '平台仲裁中', time: '待开始', done: false, active: false },
      { stage: '处理完成', time: '待完成', done: false, active: false },
    ],
  },
  {
    id: 'DISP-20250618-092',
    initiatorId: 'W-00891',
    taskId: 'TK-20250616-078',
    type: 'deduction',
    description: '合同约定提供餐补每日30元，但结算时餐补未发放，工作4天共计少发120元',
    evidence: [],
    status: 'resolved',
    resolution: '经核查，合同条款确有餐补约定。平台判定企业补发餐补120元，已发放至工人账户。',
    createdAt: '2025-06-18T15:45:22+08:00',
    resolvedAt: '2025-06-19T10:30:00+08:00',
    title: '合同约定餐补未发放',
    initiatorRole: 'worker',
    initiatorName: '孙美华',
    initiatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sun',
    responderName: '物美便利店',
    responderRole: 'company',
    taskTitle: '物美便利店收银员',
    amount: 120,
    priority: 'medium',
    typeLabel: '扣款争议',
    timeline: [
      { stage: '发起申诉', time: '06-18 15:45', done: true, active: false },
      { stage: '平台受理', time: '06-18 16:00', done: true, active: false, operator: '系统自动' },
      { stage: '企业举证', time: '06-18 17:30', done: true, active: false, operator: '物美便利' },
      { stage: '平台仲裁中', time: '06-19 09:00', done: true, active: false, operator: '仲裁员：李老师' },
      { stage: '处理完成', time: '06-19 10:30', done: true, active: false, operator: '已执行' },
    ],
  },
  {
    id: 'DISP-20250618-076',
    initiatorId: 'W-00234',
    taskId: 'TK-20250617-045',
    type: 'other',
    description: '工作期间公司安排搬运重物导致腰部扭伤，申请工伤医疗费用补偿800元，企业以非全职员工为由拒绝',
    evidence: [],
    status: 'reviewing',
    resolution: '正在核实医疗凭证与工作安排记录',
    createdAt: '2025-06-18T10:15:40+08:00',
    title: '工作期间受伤医疗费用补偿',
    initiatorRole: 'worker',
    initiatorName: '周国强',
    initiatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhou',
    responderName: '京东物流',
    responderRole: 'company',
    taskTitle: '京东物流分拣',
    amount: 800,
    priority: 'high',
    typeLabel: '其他',
    timeline: [
      { stage: '发起申诉', time: '06-18 10:15', done: true, active: false },
      { stage: '平台受理', time: '06-18 10:30', done: true, active: false, operator: '系统自动' },
      { stage: '企业举证', time: '06-18 14:00', done: true, active: false, operator: '京东物流' },
      { stage: '平台仲裁中', time: '进行中', done: false, active: true, operator: '仲裁员：张老师' },
      { stage: '处理完成', time: '待完成', done: false, active: false },
    ],
  },
  {
    id: 'DISP-20250617-038',
    initiatorId: 'W-00523',
    taskId: 'TK-20250612-078',
    type: 'hours',
    description: 'GPS信号差导致打卡位置异常，但实际本人全程在岗工作，有同事可作证，不应扣除当日工时',
    evidence: [],
    status: 'closed',
    resolution: '工人提供同事证词与工作现场照片，企业核实后确认GPS故障导致，撤销扣款。双方无异议，本案关闭。',
    createdAt: '2025-06-17T22:10:55+08:00',
    resolvedAt: '2025-06-18T09:20:00+08:00',
    title: 'GPS异常导致工时扣除申诉',
    initiatorRole: 'worker',
    initiatorName: '李明辉',
    initiatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
    responderName: '美味餐饮集团',
    responderRole: 'company',
    taskTitle: '中关村餐厅服务员',
    amount: 200,
    priority: 'low',
    typeLabel: '工时争议',
    timeline: [
      { stage: '发起申诉', time: '06-17 22:10', done: true, active: false },
      { stage: '平台受理', time: '06-18 08:00', done: true, active: false, operator: '系统自动' },
      { stage: '企业举证', time: '06-18 08:30', done: true, active: false, operator: '美味餐饮' },
      { stage: '平台仲裁中', time: '06-18 09:00', done: true, active: false, operator: '仲裁员：王老师' },
      { stage: '处理完成', time: '06-18 09:20', done: true, active: false, operator: '已关闭' },
    ],
  },
];

const PLATFORM_TIMELINE = [
  { time: '2025-06-20 09:30', operator: '刘建国（工人）', action: '发起争议申诉', detail: '提交申诉说明及打卡截图证据', type: 'worker' },
  { time: '2025-06-20 09:45', operator: '平台系统', action: '自动受理案件', detail: '案件编号 DISP-20250620-001，已分配至仲裁组', type: 'system' },
  { time: '2025-06-20 10:05', operator: '平台系统', action: '通知企业方', detail: '已向恒通物流有限公司发送应诉通知', type: 'system' },
  { time: '2025-06-20 10:20', operator: '恒通物流（企业）', action: '提交应诉材料', detail: '上传排班表、工时统计表共3份文件', type: 'company' },
  { time: '2025-06-20 11:00', operator: '仲裁员：王老师', action: '接收案件', detail: '开始审核双方证据材料', type: 'arbiter' },
];

export default function DisputeList() {
  const [activeTab, setActiveTab] = useState<DisputeTab>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [newDispute, setNewDispute] = useState({
    taskId: '',
    type: 'hours' as DisputeType,
    description: '',
  });

  const [arbitration, setArbitration] = useState({
    result: 'support_worker' as 'support_worker' | 'support_company' | 'partial' | 'dismiss',
    resolution: '',
  });

  const stats = useMemo(() => ({
    pending: MOCK_DISPUTES.filter((d) => d.status === 'pending' || d.status === 'reviewing').length,
    avgHours: 18.5,
    resolveRate: 89,
    total: MOCK_DISPUTES.length,
  }), []);

  const filteredDisputes = useMemo(() => {
    return MOCK_DISPUTES.filter((d) => {
      if (activeTab === 'pending' && !(d.status === 'pending')) return false;
      if (activeTab === 'reviewing' && !(d.status === 'reviewing')) return false;
      if (activeTab === 'resolved' && !(d.status === 'resolved')) return false;
      if (activeTab === 'closed' && !(d.status === 'closed')) return false;
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        return (
          d.id.toLowerCase().includes(kw) ||
          d.title.toLowerCase().includes(kw) ||
          d.initiatorName.toLowerCase().includes(kw) ||
          d.taskTitle.toLowerCase().includes(kw)
        );
      }
      return true;
    });
  }, [activeTab, searchKeyword]);

  const tabCounts = useMemo(() => ({
    all: MOCK_DISPUTES.length,
    pending: MOCK_DISPUTES.filter((d) => d.status === 'pending').length,
    reviewing: MOCK_DISPUTES.filter((d) => d.status === 'reviewing').length,
    resolved: MOCK_DISPUTES.filter((d) => d.status === 'resolved').length,
    closed: MOCK_DISPUTES.filter((d) => d.status === 'closed').length,
  }), []);

  const handleViewDetail = (dispute: DisputeItem) => {
    setSelectedDispute(dispute);
    setDetailOpen(true);
  };

  const handleProcess = (dispute: DisputeItem) => {
    setSelectedDispute(dispute);
    setDetailOpen(true);
  };

  const handleSubmitDispute = () => {
    alert('争议已提交，平台将在24小时内受理');
    setCreateOpen(false);
  };

  const handleArbitrate = () => {
    if (!arbitration.resolution.trim()) {
      alert('请填写处理说明');
      return;
    }
    alert('仲裁处理已提交');
    setDetailOpen(false);
  };

  const canProcess = (dispute: DisputeItem) =>
    dispute.status === 'pending' || dispute.status === 'reviewing';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Scale className="h-7 w-7 text-teal-600" />
            争议处理中心
          </h1>
          <p className="mt-1 text-sm text-gray-500">公正处理企业与工人之间的争议纠纷，保障双方合法权益</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Badge variant="warning" dot>
            <Clock className="h-3.5 w-3.5" />
            待处理 {stats.pending}
          </Badge>
          <Badge variant="info" dot={false}>
            <Sparkles className="h-3.5 w-3.5" />
            解决率 {stats.resolveRate}%
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="待处理争议"
          value={stats.pending}
          icon={<AlertTriangle size={22} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          description="等待平台受理或仲裁"
        />
        <StatCard
          title="平均处理时长"
          value={`${stats.avgHours}h`}
          icon={<Clock size={22} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          description="从受理到结案平均耗时"
          trend={{ value: 8, isUp: false, label: '较上周优化' }}
        />
        <StatCard
          title="争议解决率"
          value={`${stats.resolveRate}%`}
          icon={<ShieldCheck size={22} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          description="双方无异议结案比例"
          trend={{ value: 2, isUp: true, label: '较上月' }}
        />
      </div>

      <Card padding="none">
        <div className="border-b border-gray-100 px-2 sm:px-4 pt-2">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const count = tabCounts[tab.value];
              const active = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  data-active={active}
                  className={cn(
                    'relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors -mb-px border-b-2',
                    active
                      ? 'text-teal-600 border-teal-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon size={15} />
                  {tab.label}
                  <span
                    className={cn(
                      'inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-xs font-semibold',
                      active ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索争议编号、标题、发起人、关联任务..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              rightIcon={
                <ChevronRight className={cn('h-4 w-4 transition-transform', showFilters && 'rotate-90')} />
              }
            >
              <Filter className="h-4 w-4" />
              高级筛选
            </Button>
          </div>
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">争议类型</label>
                <select className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">全部类型</option>
                  {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">优先级</label>
                <select className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">全部优先级</option>
                  <option value="high">紧急</option>
                  <option value="medium">普通</option>
                  <option value="low">一般</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">发起方</label>
                <select className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">全部</option>
                  <option value="worker">工人发起</option>
                  <option value="company">企业发起</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <CardContent padding="none">
          {filteredDisputes.length === 0 ? (
            <div className="p-12">
              <EmptyState icon={<Scale className="h-10 w-10" />} title="暂无争议工单" description="当前条件下没有匹配的争议记录" />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredDisputes.map((d) => {
                const statusInfo = STATUS_STYLES[d.status];
                const typeInfo = TYPE_CONFIG[d.type] ?? TYPE_CONFIG.other;
                const TypeIcon = typeInfo.icon;
                const priorityStyle = PRIORITY_STYLES[d.priority];

                return (
                  <div key={d.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-600">{d.id}</span>
                          <Badge variant={typeInfo.variant}>
                            <TypeIcon size={12} />
                            {typeInfo.label}
                          </Badge>
                          <Badge variant={statusInfo.variant} dot={statusInfo.dot}>
                            {statusInfo.label}
                          </Badge>
                          <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium', priorityStyle.badge)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', priorityStyle.dot)} />
                            {priorityStyle.label}
                          </span>
                          {d.initiatorRole === 'worker' ? (
                            <Badge variant="info">工人发起</Badge>
                          ) : (
                            <Badge variant="warning">企业发起</Badge>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">{d.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{d.description}</p>

                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            <span className="font-medium text-gray-700">{d.initiatorName}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium text-gray-700">{d.responderName}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            {d.taskTitle}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(d.createdAt)}
                            <span className="text-gray-400">({timeAgo(d.createdAt)})</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                            <MessageSquare className="h-3.5 w-3.5" />
                            涉及 {formatCurrency(d.amount)}
                          </span>
                        </div>

                        <div className="relative pl-1">
                          <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-500 via-teal-300 to-gray-200 rounded-full" />
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pl-5">
                            {d.timeline.map((stage, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    'relative -ml-5 h-4 w-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10',
                                    stage.active
                                      ? 'bg-teal-500 ring-4 ring-teal-100 animate-pulse'
                                      : stage.done
                                      ? 'bg-emerald-500'
                                      : 'bg-gray-300'
                                  )}
                                >
                                  {stage.done && !stage.active && <CheckCircle2 size={10} className="text-white -ml-[1px] -mt-[1px]" />}
                                </div>
                                <div>
                                  <p
                                    className={cn(
                                      'text-xs font-medium',
                                      stage.active
                                        ? 'text-teal-700'
                                        : stage.done
                                        ? 'text-gray-700'
                                        : 'text-gray-400'
                                    )}
                                  >
                                    {stage.stage}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {stage.time}
                                    {stage.operator && ` · ${stage.operator}`}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0 self-start lg:self-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleViewDetail(d)}
                          leftIcon={<Eye size={14} />}
                        >
                          查看详情
                        </Button>
                        {canProcess(d) && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleProcess(d)}
                            leftIcon={<Gavel size={14} />}
                          >
                            处理
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-8 right-8 z-40 h-14 w-14 rounded-full bg-teal-600 text-white shadow-xl shadow-teal-600/30 hover:bg-teal-700 hover:shadow-2xl hover:shadow-teal-600/40 transition-all hover:-translate-y-0.5 flex items-center justify-center group"
      >
        <Plus size={26} className="transition-transform group-hover:rotate-90 duration-300" />
      </button>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        size="xl"
        title={
          selectedDispute ? (
            <div className="flex items-start justify-between gap-4 w-full pr-8">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900">{selectedDispute.title}</h2>
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-500">
                    {selectedDispute.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={STATUS_STYLES[selectedDispute.status].variant} dot={STATUS_STYLES[selectedDispute.status].dot}>
                    {STATUS_STYLES[selectedDispute.status].label}
                  </Badge>
                  <Badge variant={(TYPE_CONFIG[selectedDispute.type] ?? TYPE_CONFIG.other).variant}>
                    {selectedDispute.typeLabel}
                  </Badge>
                  <Badge variant="danger">涉及 {formatCurrency(selectedDispute.amount)}</Badge>
                </div>
              </div>
            </div>
          ) : null
        }
        footer={
          selectedDispute && canProcess(selectedDispute) ? (
            <>
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleArbitrate}
                disabled={!arbitration.resolution.trim()}
                leftIcon={<Gavel size={16} />}
                rightIcon={<Send size={16} />}
              >
                提交仲裁
              </Button>
            </>
          ) : undefined
        }
      >
        {selectedDispute && (
          <div className="space-y-6 -mx-2">
            <Card padding="sm" className="border-dashed border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-[11px] uppercase font-semibold text-gray-500 mb-1">发起方</p>
                  <p className="font-medium text-gray-900">{selectedDispute.initiatorName}</p>
                  <p className="text-xs text-gray-500">{selectedDispute.initiatorRole === 'worker' ? '工人' : '企业'}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase font-semibold text-gray-500 mb-1">被申诉方</p>
                  <p className="font-medium text-gray-900">{selectedDispute.responderName}</p>
                  <p className="text-xs text-gray-500">{selectedDispute.responderRole === 'worker' ? '工人' : '企业'}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase font-semibold text-gray-500 mb-1">关联任务</p>
                  <p className="font-medium text-gray-900 truncate">{selectedDispute.taskTitle}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase font-semibold text-gray-500 mb-1">创建时间</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedDispute.createdAt)}</p>
                </div>
              </div>
            </Card>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-teal-600" />
                双方陈述
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
                  <div className={cn(
                    'px-4 py-3 flex items-center gap-3 border-b border-blue-100',
                    selectedDispute.initiatorRole === 'worker' ? 'bg-blue-500/10' : 'bg-orange-500/10 border-orange-100'
                  )}>
                    <div className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold',
                      selectedDispute.initiatorRole === 'worker'
                        ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                        : 'bg-gradient-to-br from-orange-400 to-amber-500'
                    )}>
                      {selectedDispute.initiatorRole === 'worker' ? (
                        <User size={18} />
                      ) : (
                        <Building2 size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedDispute.initiatorName}</p>
                      <p className="text-xs text-gray-500">申诉方 · {selectedDispute.initiatorRole === 'worker' ? '工人' : '企业'}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-semibold uppercase text-gray-500 mb-2">申诉内容</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedDispute.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <Paperclip className="h-3.5 w-3.5" />
                      <span>已上传 3 份证据材料</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                  <div className={cn(
                    'px-4 py-3 flex items-center gap-3 border-b border-gray-100',
                    selectedDispute.responderRole === 'worker' ? 'bg-blue-500/10' : 'bg-orange-500/10 border-orange-100'
                  )}>
                    <div className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold',
                      selectedDispute.responderRole === 'worker'
                        ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                        : 'bg-gradient-to-br from-orange-400 to-amber-500'
                    )}>
                      {selectedDispute.responderRole === 'worker' ? (
                        <User size={18} />
                      ) : (
                        <Building2 size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedDispute.responderName}</p>
                      <p className="text-xs text-gray-500">被申诉方 · {selectedDispute.responderRole === 'worker' ? '工人' : '企业'}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-semibold uppercase text-gray-500 mb-2">应诉说明</p>
                    {selectedDispute.status === 'pending' ? (
                      <div className="rounded-lg bg-gray-100 border border-dashed border-gray-200 p-4 text-center">
                        <Clock className="h-6 w-6 mx-auto text-gray-400 mb-1.5" />
                        <p className="text-sm text-gray-500">等待被申诉方提交举证材料</p>
                        <p className="text-xs text-gray-400 mt-0.5">响应期限剩余 23 小时</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        我司排班系统显示该岗位排班为 7.2 小时/天（扣除午休时间），
                        5 天共计 36 小时，与系统结算一致。工时计算标准已在合同中明确约定，
                        不存在少算情况。附排班表与考勤记录。
                      </p>
                    )}
                    {selectedDispute.status !== 'pending' && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <Paperclip className="h-3.5 w-3.5" />
                        <span>已上传 3 份证据材料</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                证据展示
              </h4>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2 text-xs">
                    <Badge variant="info">工人举证 3 件</Badge>
                    {selectedDispute.status !== 'pending' && <Badge variant="warning">企业举证 3 件</Badge>}
                    <Badge variant="neutral">打卡记录</Badge>
                  </div>
                  <Button size="sm" variant="ghost" leftIcon={<Download size={14} />}>
                    下载全部
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {['排班表.pdf', '考勤明细.xlsx', '打卡截图1.jpg', '打卡截图2.jpg', '现场照片.jpg', '合同条款.pdf'].map((name, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group">
                      <div className={cn(
                        'aspect-square flex items-center justify-center',
                        name.endsWith('.pdf') ? 'bg-red-50' :
                        name.endsWith('.xlsx') ? 'bg-emerald-50' : 'bg-blue-50'
                      )}>
                        {name.endsWith('.jpg') || name.endsWith('.png') ? (
                          <div className="w-full h-full bg-gradient-to-br from-blue-200/40 via-indigo-200/30 to-purple-200/40 flex items-center justify-center">
                            <Image size={28} className="text-blue-500/60" />
                          </div>
                        ) : name.endsWith('.pdf') ? (
                          <FileText size={28} className="text-red-400" />
                        ) : (
                          <FileCheck size={28} className="text-emerald-400" />
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <p className="text-[11px] font-medium text-gray-700 truncate">{name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">工人 · 上传</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <History className="h-4 w-4 text-purple-600" />
                平台处理记录
              </h4>
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-purple-200 via-purple-300 to-gray-200" />
                {PLATFORM_TIMELINE.map((item, idx) => {
                  const typeColors = {
                    worker: 'bg-blue-500',
                    company: 'bg-orange-500',
                    system: 'bg-gray-400',
                    arbiter: 'bg-purple-500',
                  };
                  const typeBgColors = {
                    worker: 'bg-blue-50 border-blue-100',
                    company: 'bg-orange-50 border-orange-100',
                    system: 'bg-gray-50 border-gray-200',
                    arbiter: 'bg-purple-50 border-purple-100',
                  };
                  return (
                    <div key={idx} className="relative">
                      <div className={cn(
                        'absolute -left-[13px] top-1.5 h-5 w-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center',
                        typeColors[item.type as keyof typeof typeColors]
                      )} />
                      <div className={cn('rounded-xl border p-3 ml-2', typeBgColors[item.type as keyof typeof typeBgColors])}>
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <p className="text-sm font-medium text-gray-900">{item.action}</p>
                          <span className="text-[10px] text-gray-500 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-xs text-gray-600">{item.operator}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'closed' && (
              <div className="rounded-xl border-2 border-purple-100 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Gavel size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">仲裁处理</h4>
                    <p className="text-xs text-gray-500">请根据双方举证做出公正裁决</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">裁决结果</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { value: 'support_worker', label: '支持工人', icon: ThumbsUp, color: 'blue' },
                        { value: 'support_company', label: '支持企业', icon: ThumbsUp, color: 'orange' },
                        { value: 'partial', label: '部分支持', icon: Scale, color: 'teal' },
                        { value: 'dismiss', label: '驳回申诉', icon: XCircle, color: 'gray' },
                      ].map((opt) => {
                        const OptIcon = opt.icon;
                        const active = arbitration.result === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setArbitration({ ...arbitration, result: opt.value as typeof arbitration.result })}
                            className={cn(
                              'rounded-xl border-2 p-3 text-left transition-all',
                              active
                                ? opt.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                                  opt.color === 'orange' ? 'border-orange-500 bg-orange-50' :
                                  opt.color === 'teal' ? 'border-teal-500 bg-teal-50' :
                                  'border-gray-500 bg-gray-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            )}
                          >
                            <OptIcon size={18} className={cn(
                              'mb-1.5',
                              active
                                ? opt.color === 'blue' ? 'text-blue-600' :
                                  opt.color === 'orange' ? 'text-orange-600' :
                                  opt.color === 'teal' ? 'text-teal-600' :
                                  'text-gray-600'
                                : 'text-gray-400'
                            )} />
                            <p className={cn('text-sm font-semibold', active ? 'text-gray-900' : 'text-gray-700')}>{opt.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <FormField
                    label="处理说明"
                    required
                    type="textarea"
                    textareaProps={{
                      rows: 3,
                      placeholder: '请详细说明仲裁依据和处理结果，例如：经核对打卡GPS轨迹与考勤系统记录，确认工人实际工作40小时，企业应补发4小时工资...',
                      value: arbitration.resolution,
                      onChange: (e) => setArbitration({ ...arbitration, resolution: e.target.value }),
                    }}
                    hint="处理说明将同步给双方，确保描述清晰、依据充分"
                  />
                </div>
              </div>
            )}

            {selectedDispute.resolution && (selectedDispute.status === 'resolved' || selectedDispute.status === 'closed') && (
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900 mb-1">
                      {selectedDispute.status === 'resolved' ? '处理结果（已解决）' : '案件状态（已关闭）'}
                    </p>
                    <p className="text-sm text-emerald-800 leading-relaxed">{selectedDispute.resolution}</p>
                    {selectedDispute.resolvedAt && (
                      <p className="text-xs text-emerald-600 mt-2">
                        结案时间：{formatDate(selectedDispute.resolvedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">发起争议申诉</h2>
              <p className="text-xs text-gray-500">平台将在 24 小时内受理并安排仲裁</p>
            </div>
          </div>
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              <X size={16} />
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitDispute}
              disabled={!newDispute.taskId || !newDispute.description.trim()}
              rightIcon={<Send size={16} />}
            >
              提交申诉
            </Button>
          </>
        }
      >
        <div className="space-y-5 -mx-2">
          <FormField
            label="选择关联任务"
            required
            type="select"
            selectProps={{
              value: newDispute.taskId,
              onChange: (e) => setNewDispute({ ...newDispute, taskId: e.target.value }),
            }}
          >
            <option value="">请选择发生争议的任务</option>
            {MOCK_DISPUTES.slice(0, 5).map((d) => (
              <option key={d.taskId} value={d.taskId}>
                {d.taskTitle}（{d.taskId}）
              </option>
            ))}
          </FormField>

          <FormField
            label="争议类型"
            required
            type="select"
            selectProps={{
              value: newDispute.type,
              onChange: (e) => setNewDispute({ ...newDispute, type: e.target.value as DisputeType }),
            }}
          >
            {Object.entries(TYPE_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </FormField>

          <FormField
            label="争议描述"
            required
            type="textarea"
            textareaProps={{
              rows: 5,
              placeholder: '请详细描述争议内容：\n1. 争议发生的时间和背景\n2. 您认为不合理的具体事项\n3. 您期望的处理结果\n4. 其他需要说明的情况',
              value: newDispute.description,
              onChange: (e) => setNewDispute({ ...newDispute, description: e.target.value }),
            }}
            hint="描述越详细越有助于平台快速公正处理，建议 50 字以上"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              上传证据材料
              <span className="ml-0.5 text-red-500">*</span>
            </label>
            <div className="mt-1 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center hover:border-teal-300 hover:bg-teal-50/30 transition-colors cursor-pointer group">
              <div className="mx-auto h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-teal-500 group-hover:border-teal-200 transition-colors mb-3 shadow-sm">
                <Upload size={22} />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">点击或拖拽文件到此处上传</p>
              <p className="text-xs text-gray-500">支持 JPG/PNG/PDF/Excel 格式，单个文件不超过 10MB</p>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1"><Camera size={12} />打卡照片</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><MapPin size={12} />定位截图</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><FileText size={12} />合同协议</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <p className="font-semibold mb-0.5">温馨提示</p>
              <p>提交申诉后平台将自动通知对方举证，双方各有 24 小时响应时间。
              请确保所提交证据真实有效，恶意申诉将影响信用评分。</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
