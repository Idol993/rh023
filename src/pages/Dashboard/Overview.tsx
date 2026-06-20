import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Briefcase,
  DollarSign,
  PiggyBank,
  Clock,
  Users,
  FileSpreadsheet,
  ClipboardCheck,
  TrendingUp,
  Activity,
  Building,
  ShieldAlert,
  Bell,
  Plus,
  Search,
  ChevronRight,
  Calendar,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  Timer,
  AlertCircle,
  Handshake,
  Receipt,
  FileCheck,
  Eye,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatNumber, formatDate, formatDateOnly, maskName, timeAgo } from '../../utils/format';
import type { UserRole } from '@shared/types';
import {
  tasks,
  settlements,
  riskFlags,
  matchResults,
  payouts,
  users,
  jobPosts,
} from '../../mock/data';

const roleConfig: Record<
  UserRole,
  {
    greeting: string;
    quickActions: { label: string; icon: React.ReactNode; variant: 'primary' | 'secondary' }[];
  }
> = {
  worker: {
    greeting: '努力工作，收获满满！',
    quickActions: [
      { label: '查看任务', icon: <Briefcase size={16} />, variant: 'primary' },
      { label: '开始打卡', icon: <Clock size={16} />, variant: 'secondary' },
      { label: '我的收入', icon: <DollarSign size={16} />, variant: 'secondary' },
      { label: '浏览岗位', icon: <Search size={16} />, variant: 'secondary' },
    ],
  },
  hr: {
    greeting: '高效招聘，精准匹配！',
    quickActions: [
      { label: '发布需求', icon: <Plus size={16} />, variant: 'primary' },
      { label: '匹配候选人', icon: <Users size={16} />, variant: 'secondary' },
      { label: '验收任务', icon: <ClipboardCheck size={16} />, variant: 'secondary' },
      { label: '在用工管理', icon: <Briefcase size={16} />, variant: 'secondary' },
    ],
  },
  finance: {
    greeting: '精准核算，合规无忧！',
    quickActions: [
      { label: '批量发放', icon: <DollarSign size={16} />, variant: 'primary' },
      { label: '待发结算', icon: <FileSpreadsheet size={16} />, variant: 'secondary' },
      { label: '开票中心', icon: <Receipt size={16} />, variant: 'secondary' },
      { label: '税务申报', icon: <FileCheck size={16} />, variant: 'secondary' },
    ],
  },
  admin: {
    greeting: '全局掌控，稳健运营！',
    quickActions: [
      { label: '企业审核', icon: <Building size={16} />, variant: 'primary' },
      { label: '风险预警', icon: <ShieldAlert size={16} />, variant: 'secondary' },
      { label: '监管大屏', icon: <Activity size={16} />, variant: 'secondary' },
      { label: '运营数据', icon: <TrendingUp size={16} />, variant: 'secondary' },
    ],
  },
};

export default function Overview() {
  const { user } = useAuthStore();
  const role: UserRole = user?.role || 'worker';
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const config = roleConfig[role];

  const currentHour = new Date().getHours();
  const greetingText =
    currentHour < 6
      ? '凌晨好'
      : currentHour < 12
      ? '早上好'
      : currentHour < 14
      ? '中午好'
      : currentHour < 18
      ? '下午好'
      : '晚上好';

  const statsData = useMemo(() => {
    const workerTasks = tasks.filter((t) => t.workerId === 'usr1001');
    const workerSettlements = settlements.filter((s) => s.workerId === 'usr1001');

    if (role === 'worker') {
      return [
        {
          title: '进行中任务',
          value: formatNumber(workerTasks.filter((t) => t.status === 'in_progress').length + 3),
          icon: <Briefcase size={22} />,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          trend: { value: 15, isUp: true, label: '较上周' },
        },
        {
          title: '本月收入',
          value: formatCurrency(workerSettlements.reduce((s, x) => s + x.netAmount, 0) * 1.8),
          icon: <DollarSign size={22} />,
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          trend: { value: 22, isUp: true, label: '较上月' },
        },
        {
          title: '累计收入',
          value: formatCurrency(workerSettlements.reduce((s, x) => s + x.netAmount, 0) * 12.5),
          icon: <PiggyBank size={22} />,
          iconBg: 'bg-violet-50',
          iconColor: 'text-violet-600',
          description: '平台累计收益',
        },
        {
          title: '待确认结算',
          value: formatNumber(workerSettlements.filter((s) => s.status === 'pending').length + 2),
          icon: <Clock size={22} />,
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          description: '待确认金额 ¥8,926.50',
        },
      ];
    }

    if (role === 'hr') {
      return [
        {
          title: '在用工人数',
          value: formatNumber(186),
          icon: <Users size={22} />,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          trend: { value: 8, isUp: true, label: '较上月' },
        },
        {
          title: '发布需求数',
          value: formatNumber(jobPosts.filter((j) => j.companyId === 'cmp1001').length + 12),
          icon: <FileSpreadsheet size={22} />,
          iconBg: 'bg-violet-50',
          iconColor: 'text-violet-600',
          trend: { value: 25, isUp: true, label: '较上月' },
        },
        {
          title: '待验收任务',
          value: formatNumber(tasks.filter((t) => t.status === 'pending_review').length),
          icon: <ClipboardCheck size={22} />,
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          description: '含2个高优先级',
        },
        {
          title: '本月人工成本',
          value: formatCurrency(settlements.reduce((s, x) => s + x.totalBeforeTax, 0) * 6.8),
          icon: <DollarSign size={22} />,
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          trend: { value: 12, isUp: false, label: '较上月' },
        },
      ];
    }

    if (role === 'finance') {
      return [
        {
          title: '待发金额',
          value: formatCurrency(
            settlements.filter((s) => s.status === 'pending').reduce((s, x) => s + x.netAmount, 0) * 4.2
          ),
          icon: <Clock size={22} />,
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          description: '共 58 笔待发放',
        },
        {
          title: '已发金额',
          value: formatCurrency(
            payouts.filter((p) => p.status === 'success').reduce((s, x) => s + x.amount, 0) * 7.6
          ),
          icon: <DollarSign size={22} />,
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          trend: { value: 18, isUp: true, label: '较上月' },
        },
        {
          title: '待开票数',
          value: formatNumber(settlements.filter((s) => s.status === 'paid').length - 2),
          icon: <Receipt size={22} />,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          description: '金额 ¥128,640.00',
        },
        {
          title: '本月税额',
          value: formatCurrency(settlements.reduce((s, x) => s + x.taxAmount, 0) * 8.2),
          icon: <FileCheck size={22} />,
          iconBg: 'bg-violet-50',
          iconColor: 'text-violet-600',
          trend: { value: 6, isUp: true, label: '较上月' },
        },
      ];
    }

    return [
      {
        title: '今日活跃',
        value: formatNumber(users.filter((u) => u.role === 'worker').length * 86),
        icon: <Activity size={22} />,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        trend: { value: 14, isUp: true, label: '较昨日' },
      },
      {
        title: '本月结算',
        value: formatCurrency(settlements.reduce((s, x) => s + x.totalBeforeTax, 0) * 38),
        icon: <DollarSign size={22} />,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        trend: { value: 22, isUp: true, label: '较上月' },
      },
      {
        title: '新增企业',
        value: formatNumber(36),
        icon: <Building size={22} />,
        iconBg: 'bg-violet-50',
        iconColor: 'text-violet-600',
        trend: { value: 28, isUp: true, label: '较上月' },
      },
      {
        title: '待处理预警',
        value: formatNumber(riskFlags.filter((r) => r.status === 'pending' || r.status === 'reviewing').length),
        icon: <ShieldAlert size={22} />,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
        description: '含 3 条高风险',
      },
    ];
  }, [role]);

  const trendOption = useMemo(() => {
    const days = timeRange === '7d' ? 7 : 30;
    const xData = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    let lineData: number[] = [];
    let barData: number[] = [];
    let lineName = '';
    let barName = '';

    if (role === 'worker') {
      lineName = '每日工时';
      barName = '当日收入';
      lineData = Array.from({ length: days }, () => 4 + Math.random() * 6);
      barData = Array.from({ length: days }, () => 200 + Math.random() * 500);
    } else if (role === 'hr') {
      lineName = '每日新增';
      barName = '匹配成功数';
      lineData = Array.from({ length: days }, () => 5 + Math.random() * 15);
      barData = Array.from({ length: days }, () => 2 + Math.random() * 8);
    } else if (role === 'finance') {
      lineName = '发放笔数';
      barName = '发放金额(千)';
      lineData = Array.from({ length: days }, () => 20 + Math.random() * 40);
      barData = Array.from({ length: days }, () => 50 + Math.random() * 150);
    } else {
      lineName = '活跃用户';
      barName = '新增注册';
      lineData = Array.from({ length: days }, () => 500 + Math.random() * 500);
      barData = Array.from({ length: days }, () => 50 + Math.random() * 100);
    }

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' },
      },
      legend: {
        data: [lineName, barName],
        top: 0,
        right: 0,
        textStyle: { color: '#6b7280' },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '18%', containLabel: true },
      xAxis: {
        type: 'category',
        data: xData,
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280', fontSize: 11 },
      },
      yAxis: [
        {
          type: 'value',
          splitLine: { lineStyle: { color: '#f3f4f6' } },
          axisLabel: { color: '#6b7280' },
        },
        {
          type: 'value',
          splitLine: { show: false },
          axisLabel: { color: '#6b7280' },
        },
      ],
      series: [
        {
          name: lineName,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#3b82f6' },
          lineStyle: { width: 3, color: '#3b82f6' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.25)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.02)' },
              ],
            },
          },
          data: lineData,
        },
        {
          name: barName,
          type: 'bar',
          yAxisIndex: 1,
          barWidth: '35%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.5)' },
              ],
            },
          },
          data: barData,
        },
      ],
    };
  }, [role, timeRange]);

  const todoItems = useMemo(() => {
    if (role === 'worker') {
      return [
        { id: '1', title: '确认结算单 STL20260628-003', time: '今天 14:00 前', priority: 'high', type: 'settlement' },
        { id: '2', title: '电子组装任务提交每日成果', time: '今天 18:00 前', priority: 'medium', type: 'task' },
        { id: '3', title: '签署包装盒贴标劳务协议', time: '明天 12:00 前', priority: 'medium', type: 'contract' },
        { id: '4', title: '查看本月收入明细', time: '本周内', priority: 'low', type: 'info' },
      ];
    }
    if (role === 'hr') {
      return [
        { id: '1', title: '验收李四的组装任务(tsk1003)', time: '今天 15:00 前', priority: 'high', type: 'review' },
        { id: '2', title: '审批王五的匹配申请(job1004)', time: '今天 18:00 前', priority: 'high', type: 'match' },
        { id: '3', title: '审核包装盒贴标劳务协议', time: '明天 10:00 前', priority: 'medium', type: 'contract' },
        { id: '4', title: '发布叉车司机新招聘需求', time: '本周内', priority: 'low', type: 'publish' },
      ];
    }
    if (role === 'finance') {
      return [
        { id: '1', title: '批量发放待发工资(58笔)', time: '今天 16:00 前', priority: 'high', type: 'payout' },
        { id: '2', title: '开具6月上旬增值税发票', time: '今天 17:00 前', priority: 'high', type: 'invoice' },
        { id: '3', title: '处理2笔发放失败重试', time: '明天 11:00 前', priority: 'medium', type: 'retry' },
        { id: '4', title: '核对6月个税申报数据', time: '本周内', priority: 'low', type: 'tax' },
      ];
    }
    return [
      { id: '1', title: '处理3条高风险预警', time: '今天 12:00 前', priority: 'high', type: 'risk' },
      { id: '2', title: '审核新注册企业(共6家)', time: '今天 18:00 前', priority: 'high', type: 'audit' },
      { id: '3', title: '回复2条争议申诉', time: '明天 15:00 前', priority: 'medium', type: 'dispute' },
      { id: '4', title: '生成月度运营报告', time: '本周五', priority: 'low', type: 'report' },
    ];
  }, [role]);

  const activityList = useMemo(() => {
    if (role === 'worker') {
      const allCheckIns = tasks.flatMap((t) => t.checkIns || []);
      return allCheckIns
        .filter((c) => c.workerId === 'usr1001')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 6)
        .map((c) => ({
          id: c.id,
          title: c.type === 'checkin' ? '上班打卡' : '下班打卡',
          desc: c.locationValid ? '地点验证通过' : '地点需复核',
          time: c.timestamp,
          status: c.locationValid ? 'success' : 'warning',
          meta: c.type === 'checkin' ? '设备维修岗' : '工时 9.5h',
        }));
    }
    if (role === 'hr') {
      return matchResults
        .filter((m) => m.status === 'pending' || m.status === 'accepted')
        .slice(0, 6)
        .map((m) => {
          const w = users.find((u) => u.id === m.workerId);
          const j = jobPosts.find((job) => job.id === m.jobId);
          return {
            id: m.id,
            title: w ? maskName(w.name) : '候选人',
            desc: j?.title || '岗位匹配',
            time: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
            status: m.status === 'accepted' ? 'success' : m.totalScore >= 85 ? 'success' : 'warning',
            meta: `匹配度 ${m.totalScore}%`,
          };
        });
    }
    if (role === 'finance') {
      return payouts
        .sort((a, b) => new Date(b.paidAt || b.status).getTime() - new Date(a.paidAt || a.status).getTime())
        .slice(0, 6)
        .map((p) => ({
          id: p.id,
          title: maskName(p.accountName),
          desc: `发放 ${payouts.indexOf(p) % 2 === 0 ? '中国工商银行' : '中国农业银行'}`,
          time: p.paidAt || new Date(Date.now() - Math.random() * 86400000).toISOString(),
          status: p.status === 'success' ? 'success' : p.status === 'failed' ? 'error' : 'pending',
          meta: formatCurrency(p.amount),
        }));
    }
    return riskFlags
      .filter((r) => r.status === 'reviewed' || r.status === 'cleared')
      .slice(0, 6)
      .map((r) => ({
        id: r.id,
        title: r.type === 'location_abnormal' ? '打卡地点异常' : r.type === 'overtime_risk' ? '超时作业' : '合规检查',
        desc: r.reviewComment || '已处理完成',
        time: r.triggeredAt,
        status: r.status === 'cleared' ? 'success' : 'warning',
        meta: r.level === 'high' ? '高危' : r.level === 'medium' ? '中危' : '低危',
      }));
  }, [role]);

  const priorityColor = (p: string) =>
    p === 'high' ? 'bg-red-50 text-red-600 border-red-200' : p === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-600 border-gray-200';

  const statusIcon = (s: string) => {
    switch (s) {
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={16} className="text-amber-500" />;
      case 'pending':
      default:
        return <Timer size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 border-0 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-300 rounded-full blur-3xl translate-y-1/2" />
        </div>
        <div className="relative z-10 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-3xl font-bold shadow-lg">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {greetingText}，{user?.name || '用户'}！👋
                </h2>
                <p className="text-blue-100/80 text-sm mb-2">{config.greeting}</p>
                <div className="flex items-center gap-4 text-sm text-blue-100/70">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date().toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    })}
                  </span>
                  <Badge variant="info" className="bg-white/15 text-white border-white/20">
                    {role === 'worker' ? '灵活用工' : role === 'hr' ? '企业HR' : role === 'finance' ? '财务专员' : '平台管理员'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {config.quickActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant={action.variant}
                  size="md"
                  leftIcon={action.icon}
                  className={
                    action.variant === 'primary'
                      ? 'bg-white text-blue-700 hover:bg-blue-50 shadow-lg shadow-blue-900/20'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }
                >
                  {action.label}
                </Button>
              ))}
              <button className="p-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
                <Bell size={18} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              <CardTitle>近期趋势</CardTitle>
            </div>
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {(['7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    timeRange === r
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {r === '7d' ? '近7天' : '近30天'}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <ReactECharts option={trendOption} style={{ height: 320 }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardCheck size={18} className="text-amber-600" />
              <CardTitle>待办事项</CardTitle>
            </div>
            <Badge variant="warning">{todoItems.length}项</Badge>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200" />
              <div className="space-y-4">
                {todoItems.map((item) => (
                  <div key={item.id} className="relative flex items-start gap-3 group cursor-pointer">
                    <div
                      className={`shrink-0 mt-0.5 h-6 w-6 rounded-full border-2 bg-white flex items-center justify-center z-10 transition-colors ${
                        item.priority === 'high'
                          ? 'border-red-400 group-hover:border-red-500'
                          : item.priority === 'medium'
                          ? 'border-amber-400 group-hover:border-amber-500'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                    >
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          item.priority === 'high'
                            ? 'bg-red-500'
                            : item.priority === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {item.title}
                        </p>
                        <ChevronRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${priorityColor(item.priority)}`}>
                          {item.priority === 'high' ? '高优' : item.priority === 'medium' ? '中优' : '普通'}
                        </span>
                        <span className="text-xs text-gray-500">{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-emerald-600" />
            <CardTitle>
              {role === 'worker'
                ? '最近打卡记录'
                : role === 'hr'
                ? '最近匹配候选人'
                : role === 'finance'
                ? '最近发放记录'
                : '最近处理预警'}
            </CardTitle>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            查看全部 <ChevronRight size={14} />
          </button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activityList.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
              >
                <div
                  className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${
                    item.status === 'success'
                      ? 'bg-emerald-50'
                      : item.status === 'error'
                      ? 'bg-red-50'
                      : item.status === 'warning'
                      ? 'bg-amber-50'
                      : 'bg-blue-50'
                  }`}
                >
                  {item.status === 'success' ? (
                    role === 'worker' ? (
                      <MapPin size={18} className="text-emerald-600" />
                    ) : role === 'hr' ? (
                      <Handshake size={18} className="text-emerald-600" />
                    ) : (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    )
                  ) : item.status === 'error' ? (
                    <XCircle size={18} className="text-red-600" />
                  ) : item.status === 'warning' ? (
                    <AlertCircle size={18} className="text-amber-600" />
                  ) : (
                    <Timer size={18} className="text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700">
                      {item.title}
                    </p>
                    {statusIcon(item.status)}
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-2">{item.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{timeAgo(item.time)}</span>
                    <span
                      className={`text-xs font-medium ${
                        item.status === 'success'
                          ? 'text-emerald-600'
                          : item.status === 'error'
                          ? 'text-red-600'
                          : item.status === 'warning'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {item.meta}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
