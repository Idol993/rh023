import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  DollarSign,
  Calendar,
  FileText,
  Printer,
  X,
  ChevronRight,
  Zap,
  Package,
  Building2,
  Hash,
  TrendingUp,
  Users,
  Plus,
  RefreshCcw,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table, { type Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency, formatDate, maskIdCard, cn } from '../../utils/format';

interface InvoiceExt {
  id: string;
  invoiceNo: string;
  invoiceCode: string;
  settlementId: string;
  settlementNo: string;
  workerName: string;
  workerAvatar: string;
  workerIdCard: string;
  companyName: string;
  companyTaxNo: string;
  companyAddress: string;
  companyBank: string;
  project: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: 'issued' | 'pending' | 'failed' | 'void';
  issuedAt?: string;
  pdfUrl: string;
  checker: string;
  payee: string;
  remark: string;
}

const mockInvoices: InvoiceExt[] = [
  {
    id: 'inv1001',
    invoiceNo: '87654321',
    invoiceCode: '031002600311',
    settlementId: 'stl1001',
    settlementNo: 'ST-20260628-0001',
    workerName: '张三',
    workerAvatar: 'Z',
    workerIdCard: '310101199001011234',
    companyName: '宏远科技有限公司',
    companyTaxNo: '91310000MA1FL3ABCD',
    companyAddress: '上海市浦东新区张江高科技园区科苑路88号',
    companyBank: '中国工商银行上海分行 6222021234567890123',
    project: '设备维修劳务费',
    unit: '次',
    quantity: 5,
    unitPrice: 574.43,
    amount: 2872.17,
    taxRate: 0.06,
    taxAmount: 172.33,
    totalAmount: 3044.5,
    status: 'issued',
    issuedAt: '2026-06-28T14:00:00Z',
    pdfUrl: '#',
    checker: '王会计',
    payee: '李出纳',
    remark: '2026年6月设备维修劳务费结算',
  },
  {
    id: 'inv1002',
    invoiceNo: '87654322',
    invoiceCode: '031002600311',
    settlementId: 'stl1002',
    settlementNo: 'ST-20260626-0002',
    workerName: '李四',
    workerAvatar: 'L',
    workerIdCard: '320102198805052345',
    companyName: '鼎盛物流集团',
    companyTaxNo: '91310000MA1FL3EFGH',
    companyAddress: '上海市松江区九亭镇涞坊路1688号',
    companyBank: '中国农业银行上海分行 6228482345678901234',
    project: '仓储分拣服务费',
    unit: '小时',
    quantity: 84,
    unitPrice: 34.46,
    amount: 2894.72,
    taxRate: 0.06,
    taxAmount: 173.68,
    totalAmount: 3068.4,
    status: 'issued',
    issuedAt: '2026-06-26T15:30:00Z',
    pdfUrl: '#',
    checker: '陈会计',
    payee: '王出纳',
    remark: '2026年6月仓储分拣劳务费',
  },
  {
    id: 'inv1003',
    invoiceNo: '87654323',
    invoiceCode: '031002600311',
    settlementId: 'stl1003',
    settlementNo: 'ST-20260628-0003',
    workerName: '张三',
    workerAvatar: 'Z',
    workerIdCard: '310101199001011234',
    companyName: '宏远科技有限公司',
    companyTaxNo: '91310000MA1FL3ABCD',
    companyAddress: '上海市浦东新区张江高科技园区科苑路88号',
    companyBank: '中国工商银行上海分行 6222021234567890123',
    project: '电子产品组装劳务费',
    unit: '件',
    quantity: 2680,
    unitPrice: 2.37,
    amount: 6358.49,
    taxRate: 0.06,
    taxAmount: 381.51,
    totalAmount: 6740,
    status: 'issued',
    issuedAt: '2026-06-28T16:30:00Z',
    pdfUrl: '#',
    checker: '王会计',
    payee: '李出纳',
    remark: '电子产品组装计件劳务费',
  },
  {
    id: 'inv1004',
    invoiceNo: '87654324',
    invoiceCode: '031002600311',
    settlementId: 'stl1004',
    settlementNo: 'ST-20260628-0004',
    workerName: '李四',
    workerAvatar: 'L',
    workerIdCard: '320102198805052345',
    companyName: '宏远科技有限公司',
    companyTaxNo: '91310000MA1FL3ABCD',
    companyAddress: '上海市浦东新区张江高科技园区科苑路88号',
    companyBank: '中国工商银行上海分行 6222021234567890123',
    project: '电子产品组装劳务费',
    unit: '件',
    quantity: 1820,
    unitPrice: 2.0,
    amount: 3641.51,
    taxRate: 0.06,
    taxAmount: 218.49,
    totalAmount: 3860,
    status: 'pending',
    pdfUrl: '',
    checker: '',
    payee: '',
    remark: '',
  },
  {
    id: 'inv1005',
    invoiceNo: '87654325',
    invoiceCode: '031002600311',
    settlementId: 'stl1005',
    settlementNo: 'ST-20260628-0005',
    workerName: '李四',
    workerAvatar: 'L',
    workerIdCard: '320102198805052345',
    companyName: '鼎盛物流集团',
    companyTaxNo: '91310000MA1FL3EFGH',
    companyAddress: '上海市松江区九亭镇涞坊路1688号',
    companyBank: '中国农业银行上海分行 6228482345678901234',
    project: '仓储分拣服务费',
    unit: '小时',
    quantity: 52,
    unitPrice: 33.77,
    amount: 1755.85,
    taxRate: 0.06,
    taxAmount: 105.35,
    totalAmount: 1861.2,
    status: 'failed',
    pdfUrl: '',
    checker: '',
    payee: '',
    remark: '',
  },
  {
    id: 'inv1006',
    invoiceNo: '87654326',
    invoiceCode: '031002600311',
    settlementId: 'stl1006',
    settlementNo: 'ST-20260628-0006',
    workerName: '王五',
    workerAvatar: 'W',
    workerIdCard: '330103199203153456',
    companyName: '宏远科技有限公司',
    companyTaxNo: '91310000MA1FL3ABCD',
    companyAddress: '上海市浦东新区张江高科技园区科苑路88号',
    companyBank: '中国工商银行上海分行 6222021234567890123',
    project: '软件开发服务费',
    unit: '小时',
    quantity: 18,
    unitPrice: 100.75,
    amount: 1813.58,
    taxRate: 0.06,
    taxAmount: 108.82,
    totalAmount: 1922.4,
    status: 'pending',
    pdfUrl: '',
    checker: '',
    payee: '',
    remark: '',
  },
  {
    id: 'inv1007',
    invoiceNo: '87654327',
    invoiceCode: '031002600311',
    settlementId: 'stl1007',
    settlementNo: 'ST-20260625-0007',
    workerName: '王五',
    workerAvatar: 'W',
    workerIdCard: '330103199203153456',
    companyName: '宏远科技有限公司',
    companyTaxNo: '91310000MA1FL3ABCD',
    companyAddress: '上海市浦东新区张江高科技园区科苑路88号',
    companyBank: '中国工商银行上海分行 6222021234567890123',
    project: '包装盒贴标劳务费',
    unit: '件',
    quantity: 36000,
    unitPrice: 0.57,
    amount: 20694.34,
    taxRate: 0.06,
    taxAmount: 1241.66,
    totalAmount: 21936,
    status: 'pending',
    pdfUrl: '',
    checker: '',
    payee: '',
    remark: '',
  },
  {
    id: 'inv1008',
    invoiceNo: '87654320',
    invoiceCode: '031002600311',
    settlementId: 'stl1008',
    settlementNo: 'ST-20260620-0008',
    workerName: '张三',
    workerAvatar: 'Z',
    workerIdCard: '310101199001011234',
    companyName: '鼎盛物流集团',
    companyTaxNo: '91310000MA1FL3EFGH',
    companyAddress: '上海市松江区九亭镇涞坊路1688号',
    companyBank: '中国农业银行上海分行 6228482345678901234',
    project: '叉车作业服务费',
    unit: '小时',
    quantity: 160,
    unitPrice: 208.49,
    amount: 33396.23,
    taxRate: 0.06,
    taxAmount: 2003.77,
    totalAmount: 35400,
    status: 'issued',
    issuedAt: '2026-06-20T18:00:00Z',
    pdfUrl: '#',
    checker: '陈会计',
    payee: '王出纳',
    remark: '叉车司机月结算劳务费',
  },
];

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'issued', label: '已开票' },
  { key: 'pending', label: '待开票' },
  { key: 'failed', label: '开票失败' },
];

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; icon: typeof CheckCircle2 }> = {
  pending: { label: '待开票', variant: 'warning', icon: Clock },
  issued: { label: '已开票', variant: 'success', icon: CheckCircle2 },
  failed: { label: '开票失败', variant: 'danger', icon: AlertTriangle },
  void: { label: '已作废', variant: 'neutral', icon: X },
};

const projectOptions = [
  '全部项目',
  '设备维修劳务费',
  '仓储分拣服务费',
  '电子产品组装劳务费',
  '软件开发服务费',
  '包装盒贴标劳务费',
  '叉车作业服务费',
];

export default function InvoiceList() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projectFilter, setProjectFilter] = useState('全部项目');
  const [viewInvoice, setViewInvoice] = useState<InvoiceExt | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [issuingLoading, setIssuingLoading] = useState(false);

  const stats = useMemo(() => {
    const thisMonth = mockInvoices.filter(i => i.status === 'issued' && i.issuedAt?.startsWith('2026-06'));
    const allIssued = mockInvoices.filter(i => i.status === 'issued');
    const pending = mockInvoices.filter(i => i.status === 'pending');
    const totalProcessed = mockInvoices.filter(i => i.status !== 'pending').length;
    const successCount = allIssued.length;
    return {
      thisMonthAmount: thisMonth.reduce((a, b) => a + b.totalAmount, 0),
      totalAmount: allIssued.reduce((a, b) => a + b.totalAmount, 0),
      pendingCount: pending.length,
      successRate: totalProcessed > 0 ? ((successCount / totalProcessed) * 100).toFixed(1) : '0',
      totalCount: allIssued.length,
    };
  }, []);

  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter(inv => {
      if (activeTab !== 'all' && inv.status !== activeTab) return false;
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        if (
          !inv.invoiceNo.toLowerCase().includes(kw) &&
          !inv.settlementNo.toLowerCase().includes(kw) &&
          !inv.workerName.toLowerCase().includes(kw) &&
          !inv.project.toLowerCase().includes(kw)
        ) return false;
      }
      if (projectFilter !== '全部项目' && inv.project !== projectFilter) return false;
      return true;
    });
  }, [activeTab, searchKeyword, projectFilter]);

  const pendingForIssue = mockInvoices.filter(i => i.status === 'pending');

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pendingIds = filteredInvoices.filter(i => i.status === 'pending').map(i => i.id);
    const allSelected = pendingIds.every(id => selectedIds.includes(id)) && pendingIds.length > 0;
    setSelectedIds(allSelected ? [] : pendingIds);
  };

  const handleBatchIssue = async () => {
    setIssuingLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setIssuingLoading(false);
    setSelectedIds([]);
    setShowIssueModal(false);
  };

  const selectedTotal = selectedIds.reduce(
    (a, id) => a + (pendingForIssue.find(p => p.id === id)?.totalAmount || 0),
    0
  );

  const columns: Column<InvoiceExt>[] = [
    {
      key: 'select',
      title: (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={
              filteredInvoices.filter(i => i.status === 'pending').length > 0 &&
              filteredInvoices.filter(i => i.status === 'pending').every(i => selectedIds.includes(i.id))
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
      key: 'invoiceNo',
      title: '发票号码',
      width: 140,
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (r.status === 'issued') setViewInvoice(r);
          }}
          className={cn(
            'text-left font-mono text-sm font-medium',
            r.status === 'issued' ? 'text-blue-600 hover:text-blue-700 hover:underline' : 'text-gray-400'
          )}
        >
          {r.invoiceCode}<br />{r.invoiceNo}
        </button>
      ),
    },
    {
      key: 'settlement',
      title: '对应结算',
      width: 150,
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs text-blue-600">{r.settlementNo}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-[10px] font-semibold">
              {r.workerAvatar}
            </div>
            <span className="text-xs text-gray-600">{r.workerName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'project',
      title: '开票项目',
      width: 160,
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{r.project}</span>
          <span className="text-xs text-gray-500 mt-0.5">
            {r.quantity} {r.unit} × {formatCurrency(r.unitPrice)}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      title: '不含税金额',
      align: 'right',
      width: 120,
      render: (r) => <span className="text-sm font-medium text-gray-900">{formatCurrency(r.amount)}</span>,
    },
    {
      key: 'taxAmount',
      title: '税额',
      align: 'right',
      width: 100,
      render: (r) => <span className="text-sm font-medium text-amber-600">{formatCurrency(r.taxAmount)}</span>,
    },
    {
      key: 'totalAmount',
      title: '价税合计',
      align: 'right',
      width: 120,
      render: (r) => <span className="text-sm font-bold text-emerald-600">{formatCurrency(r.totalAmount)}</span>,
    },
    {
      key: 'issuedAt',
      title: '开票日期',
      width: 130,
      render: (r) => (
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <Calendar size={12} className="text-gray-400" />
          {r.issuedAt ? formatDate(r.issuedAt) : '-'}
        </span>
      ),
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
          {r.status === 'issued' && (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewInvoice(r);
                }}
                leftIcon={<Eye size={14} />}
              >
                查看
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => e.stopPropagation()}
                leftIcon={<Download size={14} />}
              >
                PDF
              </Button>
            </>
          )}
          {r.status === 'pending' && (
            <Button
              size="sm"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIds([r.id]);
                setShowIssueModal(true);
              }}
              leftIcon={<Zap size={14} />}
            >
              开票
            </Button>
          )}
          {r.status === 'failed' && (
            <Button
              size="sm"
              variant="danger"
              onClick={(e) => e.stopPropagation()}
              leftIcon={<RefreshCcw size={14} />}
            >
              重试
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-indigo-600" />
            发票管理
          </h1>
          <p className="mt-1 text-sm text-gray-500">电子发票开具、查看与下载管理</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="secondary" leftIcon={<Download size={16} />}>
            批量下载
          </Button>
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowIssueModal(true)}>
            批量开票
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="本月开票金额"
          value={formatCurrency(stats.thisMonthAmount)}
          icon={<DollarSign size={22} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          description="2026年6月价税合计"
          trend={{ value: 16.8, isUp: true, label: '环比上月' }}
        />
        <StatCard
          title="累计开票"
          value={formatCurrency(stats.totalAmount)}
          icon={<TrendingUp size={22} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          description={`累计 ${stats.totalCount} 张发票`}
          trend={{ value: 22.5, isUp: true, label: '较去年同期' }}
        />
        <StatCard
          title="待开票数量"
          value={`${stats.pendingCount} 张`}
          icon={<Clock size={22} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          description={`待开票金额 ${formatCurrency(pendingForIssue.reduce((a, b) => a + b.totalAmount, 0))}`}
        />
        <StatCard
          title="开票成功率"
          value={`${stats.successRate}%`}
          icon={<CheckCircle2 size={22} />}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          description="近30天开票成功率"
          trend={{ value: 0.5, isUp: true, label: '较上月' }}
        />
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex flex-wrap items-center gap-1">
              {statusTabs.map(tab => {
                const count = tab.key === 'all'
                  ? mockInvoices.length
                  : mockInvoices.filter(i => i.status === tab.key).length;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      activeTab === tab.key
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {tab.label}
                    <span className={cn(
                      'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs',
                      activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedIds.length > 0 && (
              <Badge variant="info" dot>
                <CheckCircle2 size={12} />
                已选 {selectedIds.length} 张
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <FormField
              type="input"
              inputProps={{
                placeholder: '搜索发票号、结算单、姓名、项目...',
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
                value: projectFilter,
                onChange: e => setProjectFilter(e.target.value),
              }}
              leftIcon={<Package size={16} />}
              label="开票项目"
            >
              {projectOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </FormField>
          </div>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-indigo-700">
            <FileText size={18} />
            <span>已选择 <strong>{selectedIds.length}</strong> 张待开票发票，合计 <strong className="text-emerald-600">{formatCurrency(selectedTotal)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
              取消选择
            </Button>
            <Button size="sm" variant="primary" onClick={() => setShowIssueModal(true)} leftIcon={<Zap size={14} />}>
              立即开票
            </Button>
          </div>
        </div>
      )}

      <Table<InvoiceExt>
        columns={columns}
        data={filteredInvoices}
        rowKey="id"
        emptyText={<EmptyState compact title="暂无发票数据" description="调整筛选条件后重试" />}
      />

      <Modal
        open={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        size="xl"
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span>发票详情</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" leftIcon={<Printer size={14} />}>
                打印
              </Button>
              <Button size="sm" variant="primary" leftIcon={<Download size={14} />}>
                下载PDF
              </Button>
            </div>
          </div>
        }
      >
        {viewInvoice && (
          <div className="space-y-5">
            <div className="relative overflow-hidden rounded-xl border-2 border-red-200 bg-gradient-to-br from-white via-red-50/20 to-white p-6 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <FileText className="h-full w-full text-red-500" />
              </div>

              <div className="text-center mb-6 pb-4 border-b border-dashed border-gray-200">
                <h2 className="text-xl font-bold text-red-700 tracking-widest mb-1">增值税普通发票</h2>
                <p className="text-xs text-gray-500">电子普通发票</p>
                <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Hash size={12} className="text-gray-400" />
                    发票代码：<span className="font-mono font-medium">{viewInvoice.invoiceCode}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash size={12} className="text-gray-400" />
                    发票号码：<span className="font-mono font-medium">{viewInvoice.invoiceNo}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-gray-400" />
                    开票日期：<span className="font-medium">{formatDate(viewInvoice.issuedAt)}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                    <Building2 size={12} />
                    购买方信息
                  </p>
                  <p className="text-sm font-medium text-gray-900">{viewInvoice.companyName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    纳税人识别号：<span className="font-mono">{viewInvoice.companyTaxNo}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    地址电话：{viewInvoice.companyAddress}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    开户行及账号：{viewInvoice.companyBank}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                    <Users size={12} />
                    销售方信息
                  </p>
                  <p className="text-sm font-medium text-gray-900">灵活用工服务平台</p>
                  <p className="text-xs text-gray-500 mt-1">
                    纳税人识别号：<span className="font-mono">91310000MA1FL99999</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    收款人：{viewInvoice.workerName}（身份证：{maskIdCard(viewInvoice.workerIdCard)}）
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    地址：上海市黄浦区人民广场200号
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-red-100 to-orange-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b border-gray-200">项目名称</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border-b border-gray-200 w-16">规格</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border-b border-gray-200 w-16">单位</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b border-gray-200 w-20">数量</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b border-gray-200 w-24">单价</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b border-gray-200 w-28">金额</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border-b border-gray-200 w-16">税率</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b border-gray-200 w-24">税额</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-3 text-gray-900 font-medium">{viewInvoice.project}</td>
                      <td className="px-3 py-3 text-center text-gray-600">-</td>
                      <td className="px-3 py-3 text-center text-gray-600">{viewInvoice.unit}</td>
                      <td className="px-3 py-3 text-right text-gray-900 font-medium">{viewInvoice.quantity}</td>
                      <td className="px-3 py-3 text-right text-gray-900">{formatCurrency(viewInvoice.unitPrice)}</td>
                      <td className="px-3 py-3 text-right text-gray-900 font-medium">{formatCurrency(viewInvoice.amount)}</td>
                      <td className="px-3 py-3 text-center text-gray-900">{(viewInvoice.taxRate * 100).toFixed(0)}%</td>
                      <td className="px-3 py-3 text-right text-amber-600 font-medium">{formatCurrency(viewInvoice.taxAmount)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-500 text-xs" colSpan={5}>
                        价税合计（大写）：<span className="font-semibold text-gray-900">{toChineseAmount(viewInvoice.totalAmount)}</span>
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-semibold text-gray-700" colSpan={2}>
                        （小写）
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-emerald-600">
                        {formatCurrency(viewInvoice.totalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500 mb-1">开票人</p>
                  <p className="text-sm font-medium text-gray-900">{viewInvoice.payee || '-'}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500 mb-1">复核</p>
                  <p className="text-sm font-medium text-gray-900">{viewInvoice.checker || '-'}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500 mb-1">备注</p>
                  <p className="text-sm text-gray-600 truncate">{viewInvoice.remark || '-'}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  <p>此发票为电子发票，与纸质发票具有同等法律效力</p>
                  <p className="mt-0.5">请妥善保管，如需报销请及时下载PDF</p>
                </div>
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full border-4 border-red-100 opacity-50 animate-ping" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-400/70 bg-white/80 transform rotate-[-15deg] shadow-sm">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-red-600 leading-tight">发票专用章</p>
                      <div className="my-0.5 h-px w-12 bg-red-400 mx-auto" />
                      <p className="text-[8px] text-red-500 leading-tight">灵活用工服务平台</p>
                      <p className="text-[7px] text-red-400 leading-tight mt-0.5">91310000MA1FL99999</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            <span>批量开具发票</span>
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              共 <strong>{selectedIds.length || pendingForIssue.length}</strong> 张，
              价税合计 <strong className="text-emerald-600">{formatCurrency(selectedTotal || pendingForIssue.reduce((a, b) => a + b.totalAmount, 0))}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setShowIssueModal(false)}>
                取消
              </Button>
              <Button variant="primary" loading={issuingLoading} onClick={handleBatchIssue} leftIcon={<Send size={16} />}>
                确认开票
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="发票类型" type="select" selectProps={{ defaultValue: 'normal' }}>
              <option value="normal">增值税普通发票（电子）</option>
              <option value="special">增值税专用发票（纸质）</option>
            </FormField>
            <FormField label="开票方式" type="select" selectProps={{ defaultValue: 'auto' }}>
              <option value="auto">系统自动开具</option>
              <option value="manual">人工审核后开具</option>
            </FormField>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-900 space-y-1">
                <p className="font-medium">开票须知</p>
                <ul className="text-xs text-indigo-800 space-y-0.5">
                  <li>• 电子发票通常在提交后 5-30 分钟内开具完成</li>
                  <li>• 开票前请确保结算单信息准确无误，开票后不可修改</li>
                  <li>• 如需红冲发票请联系财务人员处理</li>
                  <li>• 发票开具后将自动发送至企业预留邮箱</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <FileText size={14} />
                待开票结算单 ({selectedIds.length > 0
                  ? pendingForIssue.filter(p => selectedIds.includes(p.id)).length
                  : pendingForIssue.length} 张)
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-white sticky top-0">
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 w-8">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length > 0
                            ? pendingForIssue.every(p => selectedIds.includes(p.id))
                            : true
                        }
                        onChange={() => {
                          if (selectedIds.length === pendingForIssue.length) {
                            setSelectedIds([]);
                          } else {
                            setSelectedIds(pendingForIssue.map(p => p.id));
                          }
                        }}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600"
                      />
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">结算单</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">工人</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">项目</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">价税合计</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(selectedIds.length > 0
                    ? pendingForIssue.filter(p => selectedIds.includes(p.id))
                    : pendingForIssue
                  ).map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id) || selectedIds.length === 0}
                          onChange={() => toggleSelect(item.id)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs font-mono text-blue-600">{item.settlementNo}</span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-[10px] font-semibold">
                            {item.workerAvatar}
                          </div>
                          <span className="text-xs text-gray-900">{item.workerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs text-gray-600">{item.project}</span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className="text-xs font-semibold text-emerald-600">{formatCurrency(item.totalAmount)}</span>
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

function toChineseAmount(num: number): string {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿'];
  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  let result = '';
  const intStr = intPart.toString();
  for (let i = 0; i < intStr.length; i++) {
    const d = parseInt(intStr[i]);
    const u = intStr.length - 1 - i;
    if (d === 0) {
      if (u === 4 || u === 8) {
        result += units[u];
      } else if (!result.endsWith('零')) {
        result += '零';
      }
    } else {
      result += digits[d] + units[u];
    }
  }
  result = result.replace(/零+/g, '零').replace(/零([万亿])/g, '$1').replace(/亿万/g, '亿').replace(/零$/g, '');

  const jiao = Math.floor(decPart / 10);
  const fen = decPart % 10;
  let decStr = '';
  if (jiao > 0) decStr += digits[jiao] + '角';
  if (fen > 0) decStr += digits[fen] + '分';

  return `人民币${result || '零'}元${decStr || '整'}`;
}
