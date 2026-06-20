import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  Users,
  CheckSquare,
  Wallet,
  FileCheck2,
  Receipt,
  AlertTriangle,
  TrendingDown,
  Calendar,
  Download,
  Eye,
  ChevronRight,
  Clock,
  MapPin,
  FileWarning,
  FileSearch,
  Gauge,
  XCircle,
  CheckCircle2,
  FileText,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Table, type Column } from '../../components/ui/Table';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { formatCurrency, formatNumber, formatDate, formatDateOnly, maskName, maskPhone, formatDuration } from '../../utils/format';
import { companies, users, tasks, settlements, invoices, riskFlags, contracts, taxDeclarations, jobPosts } from '../../mock/data';

export default function Enterprise() {
  const [activeTab, setActiveTab] = useState<'workers' | 'settlements' | 'reports'>('workers');

  const getTaskCompanyId = (taskId: string): string | undefined => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return undefined;
    const job = jobPosts.find((j) => j.id === task.jobId);
    return job?.companyId;
  };

  const taskBelongsToCompany = (task: { jobId: string }, companyId: string): boolean => {
    const job = jobPosts.find((j) => j.id === task.jobId);
    return job?.companyId === companyId;
  };

  const company = companies[0] || {
    id: 'cmp1001',
    name: '宏远科技有限公司',
    licenseNo: '91310000MA1FL3ABCD',
    contact: '李经理 13900139001',
    status: 'active',
    balance: 586420.5,
  };

  const complianceScore = 92;
  const scoreColor = complianceScore >= 90 ? '#10b981' : complianceScore >= 75 ? '#f59e0b' : '#ef4444';

  const activeWorkers = tasks
    .filter((t) => taskBelongsToCompany(t, company.id) && (t.status === 'in_progress' || t.status === 'pending_review'))
    .map((t) => t.workerId)
    .filter((v, i, a) => a.indexOf(v) === i).length * 18;

  const completedTasks = tasks.filter((t) => taskBelongsToCompany(t, company.id) && t.status === 'completed').length * 42;
  const totalReward = settlements.filter((s) => s.companyId === company.id).reduce((s, x) => s + x.totalBeforeTax, 0) * 6.8;
  const totalTaxed = settlements.filter((s) => s.companyId === company.id).reduce((s, x) => s + x.taxAmount, 0) * 7.2;
  const invoiceCount = invoices.filter((i) => {
    const stl = settlements.find((s) => s.id === i.settlementId);
    return stl?.companyId === company.id;
  }).length * 18;
  const riskPoints = riskFlags.filter((r) => {
    const companyId = getTaskCompanyId(r.taskId || '');
    return (companyId === company.id || !companyId) && (r.status === 'pending' || r.status === 'reviewing');
  }).length + 5;

  const scoreOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      series: [
        {
          type: 'gauge',
          startAngle: 225,
          endAngle: -45,
          min: 0,
          max: 100,
          radius: '100%',
          center: ['50%', '55%'],
          axisLine: {
            lineStyle: {
              width: 18,
              color: [
                [complianceScore / 100, scoreColor],
                [1, 'rgba(229, 231, 235, 0.8)'],
              ],
            },
          },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          anchor: { show: false },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '-5%'],
            fontSize: 48,
            fontWeight: 'bold',
            color: scoreColor,
            formatter: '{value}',
          },
          title: {
            offsetCenter: [0, '35%'],
            fontSize: 14,
            color: '#6b7280',
          },
          data: [{ value: complianceScore, name: '合规评分' }],
        },
      ],
    }),
    [complianceScore, scoreColor]
  );

  const monthlyCostOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e5e7eb',
        textStyle: { color: '#374151' },
        axisPointer: { type: 'shadow' },
        formatter: (params: { name: string; seriesName: string; value: number }[]) => {
          let total = 0;
          let html = `<div class="font-medium mb-1">${params[0].name}</div>`;
          params.forEach((p) => {
            total += p.value;
            html += `<div class="flex justify-between gap-4 text-xs"><span>${p.seriesName}</span><span class="font-medium">¥${formatNumber(p.value)}</span></div>`;
          });
          html += `<div class="border-t border-gray-100 mt-2 pt-1 flex justify-between gap-4 text-xs font-medium"><span>合计</span><span>¥${formatNumber(total)}</span></div>`;
          return html;
        },
      },
      legend: {
        data: ['劳务报酬', '个税税额'],
        top: 0,
        right: 0,
        textStyle: { color: '#6b7280' },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '18%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        axisLabel: { color: '#6b7280', formatter: (v: number) => `¥${v / 10000}万` },
      },
      series: [
        {
          name: '劳务报酬',
          type: 'bar',
          stack: 'total',
          barWidth: '40%',
          itemStyle: {
            borderRadius: [0, 0, 0, 0],
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.6)' },
              ],
            },
          },
          data: [286000, 312000, 298000, 385000, 420000, 512000],
        },
        {
          name: '个税税额',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#f59e0b' },
                { offset: 1, color: 'rgba(245, 158, 11, 0.6)' },
              ],
            },
          },
          data: [8580, 9360, 8940, 11550, 12600, 15360],
        },
      ],
    }),
    []
  );

  const workerTypeOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e5e7eb',
        textStyle: { color: '#374151' },
        formatter: '{b}: {c}人 ({d}%)',
      },
      legend: {
        bottom: 0,
        left: 'center',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: '#6b7280', fontSize: 12 },
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '42%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{d}%', fontSize: 12, color: '#374151' },
          labelLine: { length: 8, length2: 6 },
          data: [
            { value: 68, name: '技术工种', itemStyle: { color: '#3b82f6' } },
            { value: 52, name: '仓储物流', itemStyle: { color: '#10b981' } },
            { value: 38, name: '生产制造', itemStyle: { color: '#8b5cf6' } },
            { value: 22, name: 'IT研发', itemStyle: { color: '#f59e0b' } },
            { value: 6, name: '其他', itemStyle: { color: '#ec4899' } },
          ],
        },
      ],
    }),
    []
  );

  const workerColumns: Column<{
    id: string;
    name: string;
    job: string;
    joinDate: string;
    leaveDate: string | null;
    totalHours: number;
    status: string;
    amount: number;
  }>[] = [
    { key: 'name', title: '姓名', dataIndex: 'name', width: 100 },
    {
      key: 'job',
      title: '岗位',
      dataIndex: 'job',
      render: (r) => <Badge variant="info">{r.job}</Badge>,
    },
    { key: 'joinDate', title: '入职日期', dataIndex: 'joinDate', render: (r) => formatDateOnly(r.joinDate) },
    {
      key: 'leaveDate',
      title: '离职日期',
      render: (r) => (r.leaveDate ? formatDateOnly(r.leaveDate) : <span className="text-gray-400">-</span>),
    },
    { key: 'totalHours', title: '累计工时', dataIndex: 'totalHours', render: (r) => formatDuration(r.totalHours), align: 'right' },
    {
      key: 'status',
      title: '状态',
      render: (r) =>
        r.status === 'active' ? (
          <Badge variant="success" dot>
            在用
          </Badge>
        ) : (
          <Badge variant="neutral" dot>
            已离职
          </Badge>
        ),
    },
    {
      key: 'amount',
      title: '累计报酬',
      dataIndex: 'amount',
      render: (r) => <span className="font-medium text-gray-900">{formatCurrency(r.amount)}</span>,
      align: 'right',
    },
    {
      key: 'action',
      title: '操作',
      align: 'right',
      render: () => (
        <button className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-0.5 ml-auto">
          详情 <ChevronRight size={12} />
        </button>
      ),
    },
  ];

  const workerList = useMemo(
    () =>
      users
        .filter((u) => u.role === 'worker')
        .map((u, i) => ({
          id: u.id,
          name: maskName(u.name),
          job: ['设备维修', '电子组装', '仓储分拣', '前端开发', '包装盒贴标'][i % 5],
          joinDate: `2026-0${(i % 6) + 1}-${((i * 3) % 27) + 1}`,
          leaveDate: i % 4 === 3 ? `2026-0${(i % 5) + 2}-${((i * 5) % 27) + 1}` : null,
          totalHours: 80 + (i + 1) * 24,
          status: i % 4 === 3 ? 'left' : 'active',
          amount: 3500 + (i + 1) * 820,
        })),
    []
  );

  const settlementColumns: Column<{
    id: string;
    period: string;
    workerCount: number;
    taskCount: number;
    baseAmount: number;
    taxAmount: number;
    netAmount: number;
    status: string;
  }>[] = [
    { key: 'period', title: '结算周期', dataIndex: 'period', width: 130 },
    { key: 'workerCount', title: '用工人数', dataIndex: 'workerCount', align: 'right' },
    { key: 'taskCount', title: '任务笔数', dataIndex: 'taskCount', align: 'right' },
    {
      key: 'baseAmount',
      title: '税前总额',
      render: (r) => <span className="tabular-nums">{formatCurrency(r.baseAmount)}</span>,
      align: 'right',
    },
    {
      key: 'taxAmount',
      title: '代扣税额',
      render: (r) => <span className="text-amber-600 tabular-nums">{formatCurrency(r.taxAmount)}</span>,
      align: 'right',
    },
    {
      key: 'netAmount',
      title: '实发总额',
      render: (r) => <span className="font-semibold text-gray-900 tabular-nums">{formatCurrency(r.netAmount)}</span>,
      align: 'right',
    },
    {
      key: 'status',
      title: '状态',
      render: (r) =>
        r.status === 'paid' ? (
          <Badge variant="success" dot>
            已发放
          </Badge>
        ) : r.status === 'confirmed' ? (
          <Badge variant="info" dot>
            待发放
          </Badge>
        ) : (
          <Badge variant="warning" dot>
            待确认
          </Badge>
        ),
    },
    {
      key: 'action',
      title: '操作',
      align: 'right',
      render: (r) => (
        <div className="flex items-center gap-2 ml-auto justify-end">
          <button className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-0.5">
            <Eye size={12} /> 明细
          </button>
          {r.status !== 'paid' && (
            <button className="text-gray-600 hover:text-gray-700 text-xs font-medium flex items-center gap-0.5">
              <Download size={12} /> 导出
            </button>
          )}
        </div>
      ),
    },
  ];

  const settlementList = [
    { id: 's1', period: '2026年6月 第4周', workerCount: 186, taskCount: 248, baseAmount: 512000, taxAmount: 15360, netAmount: 496640, status: 'pending' },
    { id: 's2', period: '2026年6月 第3周', workerCount: 172, taskCount: 232, baseAmount: 420000, taxAmount: 12600, netAmount: 407400, status: 'paid' },
    { id: 's3', period: '2026年6月 第2周', workerCount: 158, taskCount: 216, baseAmount: 385000, taxAmount: 11550, netAmount: 373450, status: 'paid' },
    { id: 's4', period: '2026年6月 第1周', workerCount: 142, taskCount: 198, baseAmount: 298000, taxAmount: 8940, netAmount: 289060, status: 'paid' },
    { id: 's5', period: '2026年5月 第4周', workerCount: 136, taskCount: 182, baseAmount: 312000, taxAmount: 9360, netAmount: 302640, status: 'paid' },
  ];

  const reports = [
    { id: 'r1', month: '2026年5月', workers: 142, tasks: 728, amount: 1385000, tax: 41550, invoices: 52, issuedAt: '2026-06-05', status: 'done' },
    { id: 'r2', month: '2026年4月', workers: 128, tasks: 656, amount: 1218000, tax: 36540, invoices: 46, issuedAt: '2026-05-06', status: 'done' },
    { id: 'r3', month: '2026年3月', workers: 116, tasks: 592, amount: 1082000, tax: 32460, invoices: 42, issuedAt: '2026-04-05', status: 'done' },
    { id: 'r4', month: '2026年2月', workers: 96, tasks: 468, amount: 864000, tax: 25920, invoices: 35, issuedAt: '2026-03-05', status: 'done' },
  ];

  const riskItems = riskFlags
    .filter((r) => {
      const companyId = getTaskCompanyId(r.taskId || '');
      return (companyId === company.id || !companyId) && (r.status === 'pending' || r.status === 'reviewing');
    })
    .slice(0, 4);

  const riskLevelStyle = (level: string) =>
    level === 'high'
      ? 'border-red-200 bg-red-50/50'
      : level === 'medium'
      ? 'border-amber-200 bg-amber-50/50'
      : 'border-emerald-200 bg-emerald-50/50';

  const riskBadgeStyle = (level: string) =>
    level === 'high'
      ? 'bg-red-500/10 text-red-600 border-red-500/20'
      : level === 'medium'
      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
          <div className="lg:col-span-3 flex items-start gap-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Building2 size={32} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
                <Badge variant="success" dot>
                  已认证
                </Badge>
                <Badge variant="info">A类企业</Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500 shrink-0">统一社会信用代码：</span>
                  <span className="font-mono text-gray-700">{company.licenseNo}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500 shrink-0">联系人：</span>
                  <span className="text-gray-700">{company.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Wallet size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500 shrink-0">账户余额：</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(company.balance)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500 shrink-0">注册地区：</span>
                  <span className="text-gray-700">上海市浦东新区</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex items-center gap-5 px-6 py-2 rounded-2xl bg-white/60 backdrop-blur-sm border border-white border-l-4 border-l-blue-200">
            <div className="shrink-0 w-36 h-36">
              <ReactECharts option={scoreOption} style={{ height: '100%', width: '100%' }} />
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">合规维度评分</span>
                  <span className="text-xs font-medium" style={{ color: scoreColor }}>
                    {complianceScore}/100
                  </span>
                </div>
                <ProgressBar value={complianceScore} variant="success" size="sm" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" /> 合同合规
                  </span>
                  <span className="text-gray-700 font-medium">96%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" /> 薪税申报
                  </span>
                  <span className="text-gray-700 font-medium">94%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" /> 考勤合规
                  </span>
                  <span className="text-gray-700 font-medium">89%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-amber-500" /> 风险处置
                  </span>
                  <span className="text-gray-700 font-medium">82%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="在用人数"
          value={formatNumber(activeWorkers)}
          icon={<Users size={20} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={{ value: 8, isUp: true, label: '较上月' }}
        />
        <StatCard
          title="已完成任务"
          value={formatNumber(completedTasks)}
          icon={<CheckSquare size={20} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ value: 15, isUp: true, label: '较上月' }}
        />
        <StatCard
          title="总报酬"
          value={formatCurrency(totalReward)}
          icon={<Wallet size={20} />}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          trend={{ value: 22, isUp: true, label: '较上月' }}
        />
        <StatCard
          title="已报税金额"
          value={formatCurrency(totalTaxed)}
          icon={<FileCheck2 size={20} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend={{ value: 18, isUp: true, label: '较上月' }}
        />
        <StatCard
          title="发票开具数"
          value={formatNumber(invoiceCount)}
          icon={<Receipt size={20} />}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          description={`金额 ${formatCurrency(totalReward * 0.98)}`}
        />
        <StatCard
          title="合规风险点"
          value={formatNumber(riskPoints)}
          icon={<AlertTriangle size={20} />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          trend={{ value: 3, isUp: false, label: '较上月' }}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-600" />
              <CardTitle>月度成本趋势</CardTitle>
            </div>
            <Badge variant="neutral">近6个月</Badge>
          </CardHeader>
          <CardContent>
            <ReactECharts option={monthlyCostOption} style={{ height: 300 }} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart size={18} className="text-violet-600" />
              <CardTitle>用工类型构成</CardTitle>
            </div>
            <Badge variant="info">{formatNumber(186)}人</Badge>
          </CardHeader>
          <CardContent>
            <ReactECharts option={workerTypeOption} style={{ height: 300 }} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSearch size={18} className="text-blue-600" />
            <CardTitle>合规台账</CardTitle>
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            {([
              { key: 'workers', label: '用工台账', icon: <Users size={14} /> },
              { key: 'settlements', label: '结算台账', icon: <Wallet size={14} /> },
              { key: 'reports', label: '薪税合规报告', icon: <FileCheck2 size={14} /> },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'workers' && (
            <Table
              columns={workerColumns}
              data={workerList}
              rowKey="id"
              hoverable
              striped
            />
          )}
          {activeTab === 'settlements' && (
            <Table
              columns={settlementColumns}
              data={settlementList}
              rowKey="id"
              hoverable
              striped
            />
          )}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="h-12 w-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <FileCheck2 size={22} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {r.month}薪税合规报告
                      </h4>
                      <Badge variant="success">已发布</Badge>
                    </div>
                    <div className="flex items-center gap-x-6 gap-y-1 text-xs text-gray-500 flex-wrap">
                      <span>用工 {formatNumber(r.workers)}人</span>
                      <span>任务 {formatNumber(r.tasks)}笔</span>
                      <span>报酬 {formatCurrency(r.amount)}</span>
                      <span>个税 {formatCurrency(r.tax)}</span>
                      <span>发票 {formatNumber(r.invoices)}张</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {r.issuedAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="secondary" leftIcon={<Eye size={14} />}>
                      预览
                    </Button>
                    <Button size="sm" variant="primary" leftIcon={<Download size={14} />}>
                      导出
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-600" />
            <CardTitle>风险提示</CardTitle>
            <Badge variant="danger" dot>
              {riskItems.length} 条待处理
            </Badge>
          </div>
          <button className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
            查看全部 <ChevronRight size={14} />
          </button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...riskItems, ...riskItems].slice(0, 4).map((r, idx) => (
              <div
                key={`${r.id}-${idx}`}
                className={`p-4 rounded-xl border-2 ${riskLevelStyle(r.level)} transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center border ${
                        r.level === 'high'
                          ? 'bg-red-100 text-red-600 border-red-200'
                          : r.level === 'medium'
                          ? 'bg-amber-100 text-amber-600 border-amber-200'
                          : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {r.type === 'location_abnormal' || r.type === 'overtime_risk' ? (
                        <Gauge size={18} />
                      ) : r.type === 'quality_defect' || r.type === 'quality_fluctuation' ? (
                        <FileWarning size={18} />
                      ) : (
                        <AlertTriangle size={18} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {r.type === 'location_abnormal'
                          ? '打卡地点异常'
                          : r.type === 'overtime_risk'
                          ? '超时作业风险'
                          : r.type === 'quality_defect'
                          ? '产品质量异常'
                          : r.type === 'quality_fluctuation'
                          ? '质量波动提醒'
                          : r.type === 'early_leave'
                          ? '早退异常'
                          : r.type === 'acceptance_rate_drop'
                          ? '接单率下降'
                          : '付款延迟风险'}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${riskBadgeStyle(
                            r.level
                          )}`}
                        >
                          {r.level === 'high' ? '高风险' : r.level === 'medium' ? '中风险' : '低风险'}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={10} /> {formatDate(r.triggeredAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {r.status === 'reviewing' ? (
                    <Badge variant="warning">审核中</Badge>
                  ) : (
                    <Badge variant="danger">待处理</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{r.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-black/5">
                  <span className="text-xs text-gray-500">
                    关联人员：{maskName(users.find((u) => u.id === r.workerId)?.name || '未知')}
                  </span>
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                    去处理 <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PieChart(props: { size: number; className?: string }) {
  return <div style={{ width: props.size, height: props.size }} className={props.className}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  </div>;
}
