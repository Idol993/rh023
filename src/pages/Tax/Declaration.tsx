import { useState, useMemo } from 'react';
import {
  FileBarChart,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Upload,
  Download,
  ArrowRight,
  DollarSign,
  Percent,
  Users,
  Search,
  Eye,
  Printer,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  FileText,
  Shield,
  Building2,
  UserCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  RefreshCw,
  Stamp,
  CreditCard,
  Award,
  FileCheck,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table, { type Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency, formatDate, formatDateOnly, maskIdCard, cn } from '../../utils/format';
import type { TaxDeclaration } from '../../../shared/types';

interface DeclarationDetail {
  id: string;
  workerName: string;
  idCard: string;
  totalIncome: number;
  deductions: number;
  taxableIncome: number;
  taxRate: number;
  quickDeduction: number;
  taxAmount: number;
}

interface DeclarationExt {
  id: string;
  period: string;
  periodType: 'monthly' | 'quarterly' | 'yearly';
  companyName: string;
  companyTaxNo: string;
  companyAddress: string;
  taxpayerName: string;
  taxpayerId: string;
  workerCount: number;
  totalIncome: number;
  totalDeductions: number;
  totalTaxableIncome: number;
  totalTaxAmount: number;
  paidTaxAmount: number;
  unpaidTaxAmount: number;
  status: 'draft' | 'pending' | 'declared' | 'paid' | 'failed';
  declaredAt?: string;
  paidAt?: string;
  deadline: string;
  details: DeclarationDetail[];
}

const mockDeclarations: DeclarationExt[] = [
  {
    id: 'tax-decl-202606',
    period: '2026年6月',
    periodType: 'monthly',
    companyName: '上海锐合人力资源有限公司',
    companyTaxNo: '91310115MA1K3X8P2N',
    companyAddress: '上海市浦东新区张江高科技园区博云路2号',
    taxpayerName: '上海锐合人力资源有限公司',
    taxpayerId: '91310115MA1K3X8P2N',
    workerCount: 128,
    totalIncome: 1256800,
    totalDeductions: 352180,
    totalTaxableIncome: 904620,
    totalTaxAmount: 45231,
    paidTaxAmount: 45231,
    unpaidTaxAmount: 0,
    status: 'paid',
    declaredAt: '2026-07-08T10:30:00Z',
    paidAt: '2026-07-10T14:20:00Z',
    deadline: '2026-07-15',
    details: [
      { id: 'd1', workerName: '张三', idCard: '310101199001011234', totalIncome: 12500, deductions: 3500, taxableIncome: 9000, taxRate: 0.1, quickDeduction: 210, taxAmount: 690 },
      { id: 'd2', workerName: '李四', idCard: '320102198805052345', totalIncome: 9800, deductions: 2800, taxableIncome: 7000, taxRate: 0.1, quickDeduction: 210, taxAmount: 490 },
      { id: 'd3', workerName: '王五', idCard: '330103199203153456', totalIncome: 18600, deductions: 5200, taxableIncome: 13400, taxRate: 0.2, quickDeduction: 1410, taxAmount: 1270 },
      { id: 'd4', workerName: '赵六', idCard: '440104198512124567', totalIncome: 7200, deductions: 2100, taxableIncome: 5100, taxRate: 0.1, quickDeduction: 210, taxAmount: 300 },
      { id: 'd5', workerName: '孙七', idCard: '510107199108085678', totalIncome: 15800, deductions: 4500, taxableIncome: 11300, taxRate: 0.1, quickDeduction: 210, taxAmount: 920 },
    ],
  },
  {
    id: 'tax-decl-202605',
    period: '2026年5月',
    periodType: 'monthly',
    companyName: '上海锐合人力资源有限公司',
    companyTaxNo: '91310115MA1K3X8P2N',
    companyAddress: '上海市浦东新区张江高科技园区博云路2号',
    taxpayerName: '上海锐合人力资源有限公司',
    taxpayerId: '91310115MA1K3X8P2N',
    workerCount: 142,
    totalIncome: 1425600,
    totalDeductions: 398240,
    totalTaxableIncome: 1027360,
    totalTaxAmount: 51368,
    paidTaxAmount: 51368,
    unpaidTaxAmount: 0,
    status: 'paid',
    declaredAt: '2026-06-08T09:15:00Z',
    paidAt: '2026-06-10T11:45:00Z',
    deadline: '2026-06-15',
    details: [
      { id: 'd6', workerName: '周八', idCard: '610103199002026789', totalIncome: 11200, deductions: 3200, taxableIncome: 8000, taxRate: 0.1, quickDeduction: 210, taxAmount: 590 },
      { id: 'd7', workerName: '吴九', idCard: '370102198707077890', totalIncome: 22000, deductions: 6100, taxableIncome: 15900, taxRate: 0.2, quickDeduction: 1410, taxAmount: 1770 },
      { id: 'd8', workerName: '郑十', idCard: '420106199303038901', totalIncome: 8500, deductions: 2400, taxableIncome: 6100, taxRate: 0.1, quickDeduction: 210, taxAmount: 400 },
    ],
  },
  {
    id: 'tax-decl-2026Q2',
    period: '2026年第二季度',
    periodType: 'quarterly',
    companyName: '上海锐合人力资源有限公司',
    companyTaxNo: '91310115MA1K3X8P2N',
    companyAddress: '上海市浦东新区张江高科技园区博云路2号',
    taxpayerName: '上海锐合人力资源有限公司',
    taxpayerId: '91310115MA1K3X8P2N',
    workerCount: 156,
    totalIncome: 4182400,
    totalDeductions: 1172000,
    totalTaxableIncome: 3010400,
    totalTaxAmount: 150520,
    paidTaxAmount: 150520,
    unpaidTaxAmount: 0,
    status: 'declared',
    declaredAt: '2026-07-12T16:00:00Z',
    deadline: '2026-07-15',
    details: [
      { id: 'd9', workerName: '陈十一', idCard: '320104199006069012', totalIncome: 45000, deductions: 12600, taxableIncome: 32400, taxRate: 0.25, quickDeduction: 2660, taxAmount: 5440 },
      { id: 'd10', workerName: '林十二', idCard: '350102198911110123', totalIncome: 36800, deductions: 10300, taxableIncome: 26500, taxRate: 0.2, quickDeduction: 1410, taxAmount: 3890 },
    ],
  },
  {
    id: 'tax-decl-202607',
    period: '2026年7月',
    periodType: 'monthly',
    companyName: '上海锐合人力资源有限公司',
    companyTaxNo: '91310115MA1K3X8P2N',
    companyAddress: '上海市浦东新区张江高科技园区博云路2号',
    taxpayerName: '上海锐合人力资源有限公司',
    taxpayerId: '91310115MA1K3X8P2N',
    workerCount: 135,
    totalIncome: 1328500,
    totalDeductions: 371980,
    totalTaxableIncome: 956520,
    totalTaxAmount: 47826,
    paidTaxAmount: 0,
    unpaidTaxAmount: 47826,
    status: 'pending',
    deadline: '2026-08-15',
    details: [
      { id: 'd11', workerName: '黄十三', idCard: '440301199204041234', totalIncome: 14500, deductions: 4100, taxableIncome: 10400, taxRate: 0.1, quickDeduction: 210, taxAmount: 830 },
      { id: 'd12', workerName: '刘十四', idCard: '110105199409092345', totalIncome: 9600, deductions: 2700, taxableIncome: 6900, taxRate: 0.1, quickDeduction: 210, taxAmount: 480 },
    ],
  },
  {
    id: 'tax-decl-202604',
    period: '2026年4月',
    periodType: 'monthly',
    companyName: '上海锐合人力资源有限公司',
    companyTaxNo: '91310115MA1K3X8P2N',
    companyAddress: '上海市浦东新区张江高科技园区博云路2号',
    taxpayerName: '上海锐合人力资源有限公司',
    taxpayerId: '91310115MA1K3X8P2N',
    workerCount: 118,
    totalIncome: 1098200,
    totalDeductions: 307496,
    totalTaxableIncome: 790704,
    totalTaxAmount: 39535,
    paidTaxAmount: 38535,
    unpaidTaxAmount: 1000,
    status: 'failed',
    declaredAt: '2026-05-08T13:00:00Z',
    deadline: '2026-05-15',
    details: [
      { id: 'd13', workerName: '杨十五', idCard: '500105199105053456', totalIncome: 13200, deductions: 3700, taxableIncome: 9500, taxRate: 0.1, quickDeduction: 210, taxAmount: 740 },
    ],
  },
  {
    id: 'tax-decl-202608',
    period: '2026年8月',
    periodType: 'monthly',
    companyName: '上海锐合人力资源有限公司',
    companyTaxNo: '91310115MA1K3X8P2N',
    companyAddress: '上海市浦东新区张江高科技园区博云路2号',
    taxpayerName: '上海锐合人力资源有限公司',
    taxpayerId: '91310115MA1K3X8P2N',
    workerCount: 0,
    totalIncome: 0,
    totalDeductions: 0,
    totalTaxableIncome: 0,
    totalTaxAmount: 0,
    paidTaxAmount: 0,
    unpaidTaxAmount: 0,
    status: 'draft',
    deadline: '2026-09-15',
    details: [],
  },
  {
    id: 'tax-decl-2025',
    period: '2025年度',
    periodType: 'yearly',
    companyName: '上海锐合人力资源有限公司',
    companyTaxNo: '91310115MA1K3X8P2N',
    companyAddress: '上海市浦东新区张江高科技园区博云路2号',
    taxpayerName: '上海锐合人力资源有限公司',
    taxpayerId: '91310115MA1K3X8P2N',
    workerCount: 186,
    totalIncome: 16528000,
    totalDeductions: 4627840,
    totalTaxableIncome: 11900160,
    totalTaxAmount: 595008,
    paidTaxAmount: 595008,
    unpaidTaxAmount: 0,
    status: 'paid',
    declaredAt: '2026-05-31T11:00:00Z',
    paidAt: '2026-06-02T15:30:00Z',
    deadline: '2026-06-30',
    details: [
      { id: 'd14', workerName: '何十六', idCard: '130102198606064567', totalIncome: 186000, deductions: 52080, taxableIncome: 133920, taxRate: 0.1, quickDeduction: 2520, taxAmount: 10872 },
    ],
  },
];

const statusConfig: Record<string, { label: string; color: string; dotColor: string; icon: any }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-700 border-gray-200', dotColor: 'bg-gray-400', icon: Clock },
  pending: { label: '待申报', color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500', icon: Clock },
  declared: { label: '已申报', color: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500', icon: FileCheck },
  paid: { label: '已缴纳', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500', icon: CheckCircle2 },
  failed: { label: '缴纳异常', color: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500', icon: AlertTriangle },
};

const periodTypeConfig = {
  monthly: { label: '月报', shortLabel: '月' },
  quarterly: { label: '季报', shortLabel: '季' },
  yearly: { label: '年报', shortLabel: '年' },
};

const taxBracketColors: Record<number, { bg: string; text: string; border: string }> = {
  0.03: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  0.1: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  0.2: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  0.25: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  0.3: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  0.35: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  0.45: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export default function Declaration() {
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('tax-decl-202606');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedDeclaration, setSelectedDeclaration] = useState<DeclarationExt | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDeclarations = useMemo(() => {
    return mockDeclarations.filter(d => {
      const matchPeriod = d.periodType === periodType;
      const matchSearch = !searchText || 
        d.period.toLowerCase().includes(searchText.toLowerCase()) ||
        d.companyName.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchPeriod && matchSearch && matchStatus;
    });
  }, [periodType, searchText, statusFilter]);

  const stats = useMemo(() => {
    const monthlyDecls = mockDeclarations.filter(d => d.periodType === 'monthly');
    const pending = monthlyDecls.filter(d => d.status === 'pending' || d.status === 'draft').length;
    const declared = monthlyDecls.filter(d => d.status === 'declared' || d.status === 'paid').length;
    const totalTax = monthlyDecls.reduce((sum, d) => sum + d.totalTaxAmount, 0);
    const unpaid = monthlyDecls.reduce((sum, d) => sum + d.unpaidTaxAmount, 0);
    return { pending, declared, totalTax, unpaid };
  }, []);

  const handleViewDetails = (decl: DeclarationExt) => {
    setSelectedDeclaration(decl);
    setShowDetailModal(true);
  };

  const handleViewCertificate = (decl: DeclarationExt) => {
    setSelectedDeclaration(decl);
    setShowCertificateModal(true);
  };

  const handleExport = (id: string) => {
    setExportingId(id);
    setTimeout(() => setExportingId(null), 1500);
  };

  const handlePrint = (id: string) => {
    setPrintingId(id);
    setTimeout(() => {
      setPrintingId(null);
      const decl = mockDeclarations.find(d => d.id === id);
      if (decl) handleViewCertificate(decl);
    }, 1000);
  };

  const getTaxBracketColor = (rate: number) => {
    return taxBracketColors[rate] || taxBracketColors[0.1];
  };

  const detailColumns: Column<DeclarationDetail>[] = [
    {
      key: 'workerName',
      title: '姓名',
      width: 'w-28',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
            {row.workerName.charAt(0)}
          </div>
          <span className="font-medium text-gray-900">{row.workerName}</span>
        </div>
      ),
    },
    {
      key: 'idCard',
      title: '身份证号',
      width: 'w-44',
      render: (row) => <span className="font-mono text-sm text-gray-600">{maskIdCard(row.idCard)}</span>,
    },
    {
      key: 'totalIncome',
      title: '收入额',
      width: 'w-32',
      align: 'right',
      render: (row) => <span className="font-medium text-gray-900">{formatCurrency(row.totalIncome)}</span>,
    },
    {
      key: 'deductions',
      title: '扣除额',
      width: 'w-32',
      align: 'right',
      render: (row) => <span className="text-emerald-600">-{formatCurrency(row.deductions)}</span>,
    },
    {
      key: 'taxableIncome',
      title: '应纳税所得额',
      width: 'w-40',
      align: 'right',
      render: (row) => <span className="font-semibold text-indigo-600">{formatCurrency(row.taxableIncome)}</span>,
    },
    {
      key: 'taxRate',
      title: '税率',
      width: 'w-24',
      align: 'center',
      render: (row) => {
        const colors = getTaxBracketColor(row.taxRate);
        return (
          <span className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border',
            colors.bg, colors.text, colors.border
          )}>
            {(row.taxRate * 100).toFixed(0)}%
          </span>
        );
      },
    },
    {
      key: 'quickDeduction',
      title: '速算扣除数',
      width: 'w-32',
      align: 'right',
      render: (row) => <span className="text-amber-600">-{formatCurrency(row.quickDeduction)}</span>,
    },
    {
      key: 'taxAmount',
      title: '应纳税额',
      width: 'w-32',
      align: 'right',
      render: (row) => (
        <span className="font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
          {formatCurrency(row.taxAmount)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileBarChart className="h-7 w-7 text-amber-600" />
            税务申报
          </h1>
          <p className="mt-1 text-sm text-gray-500">个人所得税代扣代缴申报管理 · 电子税务局对接</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" leftIcon={<RefreshCw className="h-4 w-4" />}>
            同步数据
          </Button>
          <Button variant="primary" size="md" leftIcon={<Upload className="h-4 w-4" />}>
            发起申报
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-amber-900">本期申报提醒</h2>
              <p className="mt-1 text-sm text-amber-800">
                2026年7月个税申报截止日期为 <span className="font-semibold">2026-08-15</span>，
                当前有 <span className="font-bold text-amber-900">135人</span> 待申报，
                预计应纳税额 <span className="font-bold text-amber-900">{formatCurrency(47826)}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-100/60 px-3 py-2 rounded-xl">
              <Clock className="h-4 w-4" />
              剩余 <span className="font-bold">23天</span>
            </div>
            <Button variant="primary" size="md" leftIcon={<Upload className="h-4 w-4" />} className="bg-amber-600 hover:bg-amber-700">
              立即申报
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="本期应申报"
          value={stats.pending.toString()}
          unit="个期间"
          icon={<Calendar className="h-5 w-5" />}
          iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
          iconColor="text-white"
          trend={{ value: '1.2%', direction: 'up', label: '较上月' }}
        />
        <StatCard
          label="已申报/已缴纳"
          value={stats.declared.toString()}
          unit="个期间"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
          iconColor="text-white"
          trend={{ value: '5.8%', direction: 'up', label: '较上月' }}
        />
        <StatCard
          label="申报税额合计"
          value={formatCurrency(stats.totalTax)}
          icon={<DollarSign className="h-5 w-5" />}
          iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
          iconColor="text-white"
          trend={{ value: '8.3%', direction: 'up', label: '较上月' }}
        />
        <StatCard
          label="待缴纳税额"
          value={formatCurrency(stats.unpaid)}
          icon={<CreditCard className="h-5 w-5" />}
          iconBg="bg-gradient-to-br from-red-500 to-rose-500"
          iconColor="text-white"
          trend={{ value: stats.unpaid > 0 ? '需缴纳' : '无欠缴', direction: 'neutral', label: '当前状态' }}
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1">
                {(['monthly', 'quarterly', 'yearly'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPeriodType(type)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                      periodType === type
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {periodTypeConfig[type].label}
                  </button>
                ))}
              </div>
              <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block" />
              <div className="flex items-center gap-1">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'pending', label: '待申报' },
                  { key: 'declared', label: '已申报' },
                  { key: 'paid', label: '已缴纳' },
                  { key: 'failed', label: '异常' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={cn(
                      'px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                      statusFilter === tab.key
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <FormField
                type="input"
                placeholder="搜索期间或企业名称"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                className="min-w-[260px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredDeclarations.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-gray-300" />}
          title="暂无申报记录"
          description="当前期间类型下还没有申报数据，请切换其他期间类型"
        />
      ) : (
        <div className="space-y-4">
          {filteredDeclarations.map((decl) => {
            const statusCfg = statusConfig[decl.status];
            const StatusIcon = statusCfg.icon;
            const isExpanded = expandedId === decl.id;
            const progressPercent = decl.totalTaxAmount > 0
              ? Math.round((decl.paidTaxAmount / decl.totalTaxAmount) * 100)
              : decl.status === 'draft' ? 0 : 100;
            const progressVariant = decl.status === 'paid' ? 'success'
              : decl.status === 'failed' ? 'danger'
              : decl.status === 'declared' ? 'info' : 'warning';

            return (
              <div
                key={decl.id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        decl.status === 'paid' ? 'bg-emerald-100' :
                        decl.status === 'declared' ? 'bg-blue-100' :
                        decl.status === 'failed' ? 'bg-red-100' :
                        decl.status === 'pending' ? 'bg-amber-100' : 'bg-gray-100'
                      )}>
                        <FileBarChart className={cn(
                          'h-6 w-6',
                          decl.status === 'paid' ? 'text-emerald-600' :
                          decl.status === 'declared' ? 'text-blue-600' :
                          decl.status === 'failed' ? 'text-red-600' :
                          decl.status === 'pending' ? 'text-amber-600' : 'text-gray-500'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{decl.period}</h3>
                          <Badge variant={
                            decl.status === 'paid' ? 'success' :
                            decl.status === 'declared' ? 'info' :
                            decl.status === 'failed' ? 'danger' :
                            decl.status === 'pending' ? 'warning' : 'neutral'
                          } dot>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusCfg.label}
                          </Badge>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                            {periodTypeConfig[decl.periodType].label}
                          </span>
                          {decl.status !== 'draft' && decl.status !== 'paid' && decl.unpaidTaxAmount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                              <AlertTriangle className="h-3 w-3" />
                              待缴纳 {formatCurrency(decl.unpaidTaxAmount)}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate">{decl.companyName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            <span>申报人数 <b className="text-gray-900">{decl.workerCount}</b> 人</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>截止 {decl.deadline}</span>
                          </div>
                          {decl.declaredAt && (
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />
                              <span>申报于 {formatDateOnly(decl.declaredAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="h-4 w-4" />}
                          onClick={() => handleViewDetails(decl)}
                        >
                          明细
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Download className="h-4 w-4" />}
                          onClick={() => handleExport(decl.id)}
                          loading={exportingId === decl.id}
                        >
                          {exportingId === decl.id ? '导出中' : '导出'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Printer className="h-4 w-4" />}
                          onClick={() => handlePrint(decl.id)}
                          loading={printingId === decl.id}
                          disabled={decl.status !== 'paid' && decl.status !== 'declared'}
                        >
                          完税凭证
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100">
                      <div className="text-xs font-medium text-gray-500 mb-1.5">收入总额</div>
                      <div className="text-xl font-bold text-gray-900">{formatCurrency(decl.totalIncome)}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                      <div className="text-xs font-medium text-emerald-600 mb-1.5">扣除合计</div>
                      <div className="text-xl font-bold text-emerald-700">-{formatCurrency(decl.totalDeductions)}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                      <div className="text-xs font-medium text-indigo-600 mb-1.5">应纳税所得额</div>
                      <div className="text-xl font-bold text-indigo-700">{formatCurrency(decl.totalTaxableIncome)}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
                      <div className="text-xs font-medium text-red-600 mb-1.5">应纳税额</div>
                      <div className="text-xl font-bold text-red-700">{formatCurrency(decl.totalTaxAmount)}</div>
                    </div>
                  </div>

                  {decl.status !== 'draft' && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5" />
                          缴纳进度
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">
                            已缴: <b className="text-emerald-600">{formatCurrency(decl.paidTaxAmount)}</b>
                          </span>
                          <span className="text-gray-300">/</span>
                          <span className="text-gray-500">
                            应缴: <b className="text-gray-900">{formatCurrency(decl.totalTaxAmount)}</b>
                          </span>
                          <span className={cn(
                            'font-semibold',
                            progressPercent === 100 ? 'text-emerald-600' : decl.unpaidTaxAmount > 0 ? 'text-red-600' : 'text-amber-600'
                          )}>
                            {progressPercent}%
                          </span>
                        </div>
                      </div>
                      <ProgressBar
                        progress={progressPercent}
                        variant={progressVariant as any}
                        size="md"
                        showLabel={false}
                      />
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : decl.id)}
                      className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      {isExpanded ? (
                        <><ChevronUp className="h-4 w-4" /> 收起申报人员明细</>
                      ) : (
                        <><ChevronDown className="h-4 w-4" /> 展开申报人员明细（{decl.details.length}人）</>
                      )}
                    </button>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Shield className="h-3.5 w-3.5" />
                      数据已加密存储，符合税务监管要求
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    {decl.details.length === 0 ? (
                      <div className="p-8 text-center">
                        <EmptyState
                          icon={<Users className="h-10 w-10 text-gray-300" />}
                          title="暂无申报人员"
                          description="该期间尚未导入申报人员数据"
                          compact
                        />
                      </div>
                    ) : (
                      <div className="p-4">
                        <Table
                          columns={detailColumns}
                          data={decl.details}
                          rowKey="id"
                          hoverable
                          striped
                        />
                        {decl.details.length < decl.workerCount && (
                          <div className="mt-3 py-2.5 px-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-sm">
                            <span className="text-indigo-700 flex items-center gap-1.5">
                              <Users className="h-4 w-4" />
                              共 {decl.workerCount} 人，此处展示前 {decl.details.length} 条明细记录
                            </span>
                            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                              查看全部 {decl.workerCount} 人
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showDetailModal && selectedDeclaration && (
        <Modal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="申报明细详情"
          subtitle={`${selectedDeclaration.period} · ${selectedDeclaration.companyName}`}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="h-4 w-4 text-emerald-500" />
                数据来源：电子税务局系统
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={() => handleExport(selectedDeclaration.id)}
                >
                  导出申报表
                </Button>
                <Button variant="primary" onClick={() => setShowDetailModal(false)}>
                  关闭
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-1">申报期间</div>
                <div className="text-lg font-bold text-gray-900">{selectedDeclaration.period}</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                <div className="text-xs font-medium text-blue-600 mb-1">申报人数</div>
                <div className="text-lg font-bold text-blue-700">{selectedDeclaration.workerCount} 人</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                <div className="text-xs font-medium text-indigo-600 mb-1">应纳税所得额</div>
                <div className="text-lg font-bold text-indigo-700">{formatCurrency(selectedDeclaration.totalTaxableIncome)}</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
                <div className="text-xs font-medium text-red-600 mb-1">应纳税额合计</div>
                <div className="text-lg font-bold text-red-700">{formatCurrency(selectedDeclaration.totalTaxAmount)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-gray-200 bg-white">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  企业信息
                </h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">企业名称</span>
                    <span className="font-medium text-gray-900">{selectedDeclaration.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">统一社会信用代码</span>
                    <span className="font-mono text-gray-700">{selectedDeclaration.companyTaxNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">注册地址</span>
                    <span className="text-gray-700 text-right max-w-[60%]">{selectedDeclaration.companyAddress}</span>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-xl border border-gray-200 bg-white">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-gray-500" />
                  申报状态
                </h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">申报状态</span>
                    <Badge variant={
                      selectedDeclaration.status === 'paid' ? 'success' :
                      selectedDeclaration.status === 'declared' ? 'info' :
                      selectedDeclaration.status === 'failed' ? 'danger' : 'warning'
                    }>
                      {statusConfig[selectedDeclaration.status].label}
                    </Badge>
                  </div>
                  {selectedDeclaration.declaredAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">申报时间</span>
                      <span className="text-gray-700">{formatDate(selectedDeclaration.declaredAt)}</span>
                    </div>
                  )}
                  {selectedDeclaration.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">缴纳时间</span>
                      <span className="text-gray-700">{formatDate(selectedDeclaration.paidAt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">申报截止日期</span>
                    <span className={cn(
                      'font-medium',
                      selectedDeclaration.status === 'paid' || selectedDeclaration.status === 'declared' ? 'text-emerald-600' : 'text-amber-600'
                    )}>
                      {selectedDeclaration.deadline}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  申报人员明细
                </h4>
                <span className="text-xs text-gray-500">共 {selectedDeclaration.workerCount} 条记录</span>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                <Table
                  columns={detailColumns}
                  data={selectedDeclaration.details}
                  rowKey="id"
                  hoverable
                  striped
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showCertificateModal && selectedDeclaration && (
        <Modal
          open={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          title="电子完税证明预览"
          subtitle={`${selectedDeclaration.period} 个人所得税完税证明`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                此为电子完税证明，与纸质凭证具有同等法律效力
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />}>
                  下载PDF
                </Button>
                <Button variant="primary" leftIcon={<Printer className="h-4 w-4" />}>
                  打印凭证
                </Button>
              </div>
            </div>
          }
        >
          <div className="bg-gradient-to-br from-red-50/30 via-orange-50/30 to-amber-50/30 p-6 rounded-xl border border-amber-200/50">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200">
              <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-5 px-6 text-center">
                <div className="text-white text-xl font-bold tracking-widest">
                  中华人民共和国
                </div>
                <div className="text-white text-2xl font-bold tracking-[0.3em] mt-1">
                  税收完税证明
                </div>
                <div className="text-white/80 text-sm mt-2 font-medium">
                  （电子凭证） 票证式样：TAX-PAYMENT-E-2025
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-gray-500">凭证字号：</span>
                      <span className="font-mono font-semibold text-gray-900">
                        ({new Date(selectedDeclaration.declaredAt || selectedDeclaration.paidAt || Date.now()).getFullYear()})沪税电证完 {selectedDeclaration.id.toUpperCase().slice(-8)}号
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">填开日期：</span>
                    <span className="font-medium text-gray-900">
                      {formatDateOnly(selectedDeclaration.paidAt || selectedDeclaration.declaredAt || Date.now().toString())}
                    </span>
                  </div>
                </div>

                <div className="border-t-2 border-b-2 border-dashed border-amber-300 py-4 grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">纳税人识别号</div>
                      <div className="font-mono text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                        {selectedDeclaration.taxpayerId}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">纳税人名称</div>
                      <div className="font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                        {selectedDeclaration.taxpayerName}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">税务机关</div>
                      <div className="font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                        国家税务总局上海市浦东新区税务局
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">征收项目</div>
                      <div className="font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                        个人所得税 — 工资薪金所得/劳务报酬所得
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">税款所属期</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">收入总额</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">扣除合计</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">应纳税所得额</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">实缴税额</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3.5 font-medium text-gray-900">{selectedDeclaration.period}</td>
                        <td className="px-4 py-3.5 text-right text-gray-700">{formatCurrency(selectedDeclaration.totalIncome)}</td>
                        <td className="px-4 py-3.5 text-right text-emerald-600">-{formatCurrency(selectedDeclaration.totalDeductions)}</td>
                        <td className="px-4 py-3.5 text-right text-indigo-600 font-medium">{formatCurrency(selectedDeclaration.totalTaxableIncome)}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-red-600 bg-red-50">{formatCurrency(selectedDeclaration.paidTaxAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-amber-700 mb-1">金额大写（人民币）</div>
                    <div className="text-lg font-bold text-amber-900 tracking-wide">
                      {toChineseAmount(selectedDeclaration.paidTaxAmount)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">小写合计</div>
                    <div className="text-2xl font-bold text-red-600">
                      ¥ {selectedDeclaration.paidTaxAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">申报人数</div>
                    <div className="font-bold text-gray-900 text-lg">{selectedDeclaration.workerCount} 人</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">税款缴纳日期</div>
                    <div className="font-bold text-gray-900">{selectedDeclaration.paidAt ? formatDateOnly(selectedDeclaration.paidAt) : '—'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="text-xs text-emerald-600 mb-1">缴款状态</div>
                    <div className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      已全额缴纳
                    </div>
                  </div>
                </div>

                <div className="relative pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>
                      <div className="mb-1">填票人： <span className="text-gray-700 font-medium">电子税务局系统</span></div>
                      <div>复核人： <span className="text-gray-700 font-medium">系统自动核验</span></div>
                    </div>
                    <div className="text-right">
                      <div className="mb-1">本凭证与纸质凭证具有同等法律效力</div>
                      <div className="font-mono">查询码： {btoa(selectedDeclaration.id).slice(0, 16).toUpperCase()}</div>
                    </div>
                  </div>

                  <div className="absolute right-8 bottom-0 pointer-events-none">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 rounded-full border-4 border-red-600/70 flex items-center justify-center transform -rotate-12">
                        <div className="text-center leading-tight">
                          <div className="text-[10px] text-red-700/80 font-semibold tracking-wider">国家税务总局</div>
                          <div className="text-[11px] text-red-700 font-bold my-1">上海市浦东新区</div>
                          <div className="text-[10px] text-red-700/80 font-semibold tracking-wider">税务局</div>
                          <div className="w-12 h-12 mt-0.5 mx-auto rounded-full bg-red-600/10 flex items-center justify-center">
                            <Stamp className="h-6 w-6 text-red-600/70" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-red-400/30 animate-ping" style={{ animationDuration: '3s' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-slate-50 py-3 px-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-emerald-500" />
                    已通过电子印章系统验证
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-blue-500" />
                    区块链存证：SHA-256 {btoa(selectedDeclaration.id).slice(0, 20)}...
                  </span>
                </div>
                <span>凭证编号：{selectedDeclaration.id.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function toChineseAmount(num: number): string {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '万', '亿'];

  if (num === 0) return '零元整';

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  let result = '';
  const intStr = intPart.toString();
  const len = intStr.length;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(intStr[i]);
    const pos = len - i - 1;
    const unitIdx = pos % 4;
    const bigUnitIdx = Math.floor(pos / 4);

    if (digit === 0) {
      if (unitIdx === 0 && bigUnitIdx > 0) {
        let allZero = true;
        for (let j = i - 3; j <= i; j++) {
          if (j >= 0 && parseInt(intStr[j]) !== 0) {
            allZero = false;
            break;
          }
        }
        if (!allZero) result += bigUnits[bigUnitIdx];
      } else if (result.length > 0 && result[result.length - 1] !== '零') {
        result += '零';
      }
    } else {
      result += digits[digit] + units[unitIdx];
      if (unitIdx === 0) result += bigUnits[bigUnitIdx];
    }
  }

  result = result.replace(/零+/g, '零').replace(/零$/, '');
  result += '元';

  if (decPart === 0) {
    result += '整';
  } else {
    const jiao = Math.floor(decPart / 10);
    const fen = decPart % 10;
    if (jiao > 0) result += digits[jiao] + '角';
    if (fen > 0) result += digits[fen] + '分';
  }

  return result;
}
