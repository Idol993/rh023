import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  FileText,
  Eye,
  Download,
  ShieldCheck,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  UserCircle,
  Network,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FormField } from '../../components/ui/FormField';
import { Table, Column } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { contractsApi } from '../../lib/api';
import { formatDate, maskName } from '../../utils/format';
import type { Contract } from '@shared/types';

type ContractTab = 'all' | 'pending' | 'signed' | 'deposited';

const TABS: { key: ContractTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待签署' },
  { key: 'signed', label: '已签署' },
  { key: 'deposited', label: '已存证' },
];

const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'CT202501001',
    jobId: '1',
    companyId: 'c1',
    workerId: 'w1',
    content: '',
    templateVersion: 'v2.1',
    companySigned: true,
    workerSigned: true,
    platformSigned: true,
    signedAt: '2025-01-15T09:30:00Z',
    blockchainHash: '0x7a8f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    depositNo: 'BLK2025011500123',
    status: 'deposited',
  },
  {
    id: 'CT202501002',
    jobId: '2',
    companyId: 'c1',
    workerId: 'w2',
    content: '',
    templateVersion: 'v2.1',
    companySigned: true,
    workerSigned: true,
    platformSigned: true,
    signedAt: '2025-01-16T14:20:00Z',
    blockchainHash: '0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
    depositNo: 'BLK2025011600456',
    status: 'deposited',
  },
  {
    id: 'CT202501003',
    jobId: '3',
    companyId: 'c1',
    workerId: 'w3',
    content: '',
    templateVersion: 'v2.1',
    companySigned: true,
    workerSigned: true,
    platformSigned: false,
    signedAt: '2025-01-17T10:15:00Z',
    status: 'signed',
  },
  {
    id: 'CT202501004',
    jobId: '4',
    companyId: 'c1',
    workerId: 'w4',
    content: '',
    templateVersion: 'v2.0',
    companySigned: true,
    workerSigned: false,
    platformSigned: false,
    status: 'signing',
  },
  {
    id: 'CT202501005',
    jobId: '5',
    companyId: 'c1',
    workerId: 'w5',
    content: '',
    templateVersion: 'v2.1',
    companySigned: false,
    workerSigned: false,
    platformSigned: false,
    status: 'draft',
  },
  {
    id: 'CT202501006',
    jobId: '6',
    companyId: 'c1',
    workerId: 'w6',
    content: '',
    templateVersion: 'v2.1',
    companySigned: true,
    workerSigned: false,
    platformSigned: false,
    status: 'signing',
  },
  {
    id: 'CT202501007',
    jobId: '7',
    companyId: 'c1',
    workerId: 'w7',
    content: '',
    templateVersion: 'v2.1',
    companySigned: true,
    workerSigned: true,
    platformSigned: true,
    signedAt: '2025-01-10T16:45:00Z',
    blockchainHash: '0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e',
    depositNo: 'BLK2025011000789',
    status: 'deposited',
  },
  {
    id: 'CT202501008',
    jobId: '8',
    companyId: 'c1',
    workerId: 'w8',
    content: '',
    templateVersion: 'v2.1',
    companySigned: true,
    workerSigned: true,
    platformSigned: true,
    signedAt: '2025-01-08T11:00:00Z',
    blockchainHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    depositNo: 'BLK2025010800012',
    status: 'deposited',
  },
];

const JOB_TITLES: Record<string, string> = {
  '1': '双十一电商仓库分拣员急招',
  '2': '快递驿站寒假工招聘',
  '3': '春节期间酒店餐饮服务员',
  '4': '电子厂流水线装配工（长期）',
  '5': '写字楼保洁员招聘',
  '6': '超市收银员周末兼职',
  '7': '物流中心装卸工招募',
  '8': '餐厅后厨帮工急招',
};

const WORKER_NAMES: Record<string, string> = {
  'w1': '张伟',
  'w2': '李梅',
  'w3': '王刚',
  'w4': '陈静',
  'w5': '刘强',
  'w6': '赵敏',
  'w7': '孙浩',
  'w8': '周芳',
};

const COMPANY_NAME = '上海智汇企业管理有限公司';

interface TableContract extends Contract {
  jobTitle: string;
  workerName: string;
  companyName: string;
}

function getContractStatusInfo(contract: Contract) {
  const allSigned = contract.companySigned && contract.workerSigned && contract.platformSigned;
  const anySigned = contract.companySigned || contract.workerSigned || contract.platformSigned;

  if (contract.status === 'deposited' || contract.blockchainHash) {
    return { label: '已存证', variant: 'success' as const, dot: true };
  }
  if (allSigned) {
    return { label: '已签署', variant: 'success' as const, dot: true };
  }
  if (anySigned) {
    return { label: '签署中', variant: 'warning' as const, dot: true };
  }
  return { label: '待签署', variant: 'danger' as const, dot: true };
}

function SignStatusCell({
  signed,
  icon,
  label,
}: {
  signed: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {signed ? (
        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
      ) : (
        <Clock size={14} className="text-amber-500 shrink-0" />
      )}
      <span
        className={clsx(
          'text-xs font-medium',
          signed ? 'text-emerald-700' : 'text-amber-700'
        )}
      >
        {label}
      </span>
    </div>
  );
}

export default function ContractList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading] = useState(false);
  const [activeTab, setActiveTab] = useState<ContractTab>(
    (searchParams.get('tab') as ContractTab) || 'all'
  );
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  const contracts: TableContract[] = useMemo(
    () =>
      MOCK_CONTRACTS.map((c) => ({
        ...c,
        jobTitle: JOB_TITLES[c.jobId] || '未知需求',
        workerName: WORKER_NAMES[c.workerId] || '未知人员',
        companyName: COMPANY_NAME,
      })),
    []
  );

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      if (activeTab === 'pending') {
        if (c.status === 'deposited') return false;
        if (c.status === 'signed') return false;
        const allSigned = c.companySigned && c.workerSigned && c.platformSigned;
        if (allSigned) return false;
      }
      if (activeTab === 'signed') {
        const allSigned = c.companySigned && c.workerSigned && c.platformSigned;
        if (!allSigned) return false;
        if (c.status === 'deposited') return false;
      }
      if (activeTab === 'deposited') {
        if (c.status !== 'deposited' && !c.blockchainHash) return false;
      }

      if (keyword) {
        const k = keyword.toLowerCase();
        if (
          !c.id.toLowerCase().includes(k) &&
          !c.jobTitle.toLowerCase().includes(k) &&
          !c.workerName.toLowerCase().includes(k) &&
          !c.companyName.toLowerCase().includes(k)
        ) {
          return false;
        }
      }

      if (dateFrom && c.signedAt && c.signedAt < dateFrom) return false;
      if (dateTo && c.signedAt && c.signedAt > dateTo + 'T23:59:59') return false;

      return true;
    });
  }, [contracts, activeTab, keyword, dateFrom, dateTo]);

  const tabCounts = TABS.reduce((acc, tab) => {
    let count = contracts.length;
    if (tab.key === 'pending') {
      count = contracts.filter((c) => {
        if (c.status === 'deposited') return false;
        if (c.status === 'signed') return false;
        return !(c.companySigned && c.workerSigned && c.platformSigned);
      }).length;
    } else if (tab.key === 'signed') {
      count = contracts.filter((c) => {
        const all = c.companySigned && c.workerSigned && c.platformSigned;
        return all && c.status !== 'deposited';
      }).length;
    } else if (tab.key === 'deposited') {
      count = contracts.filter((c) => c.status === 'deposited' || c.blockchainHash).length;
    }
    acc[tab.key] = count;
    return acc;
  }, {} as Record<ContractTab, number>);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paged = filtered.slice(startIdx, startIdx + pageSize);

  const handleTabChange = (tab: ContractTab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), tab });
  };

  const resetFilters = () => {
    setKeyword('');
    setDateFrom('');
    setDateTo('');
    setActiveTab('all');
    setPage(1);
    setSearchParams({});
  };

  const columns: Column<TableContract>[] = [
    {
      key: 'id',
      title: '协议编号',
      width: 140,
      render: (r) => (
        <span
          className="font-mono text-xs font-semibold text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate(`/contracts/${r.id}`)}
        >
          {r.id}
        </span>
      ),
    },
    {
      key: 'jobTitle',
      title: '用工标题',
      width: 220,
      render: (r) => (
        <span className="text-sm text-gray-700 truncate max-w-[200px] block" title={r.jobTitle}>
          {r.jobTitle}
        </span>
      ),
    },
    {
      key: 'company',
      title: '企业',
      width: 160,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Building2 size={12} className="text-gray-400 shrink-0" />
          <span className="text-sm text-gray-700 truncate" title={r.companyName}>
            {r.companyName.length > 10 ? r.companyName.slice(0, 10) + '...' : r.companyName}
          </span>
        </div>
      ),
    },
    {
      key: 'worker',
      title: '灵活用工者',
      width: 100,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <UserCircle size={12} className="text-gray-400 shrink-0" />
          <span className="text-sm text-gray-700">{maskName(r.workerName)}</span>
        </div>
      ),
    },
    {
      key: 'signStatus',
      title: '签署状态（三方）',
      width: 220,
      render: (r) => (
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="group relative"
            title={`企业${r.companySigned ? '已签' : '未签'}`}
          >
            <SignStatusCell
              signed={r.companySigned}
              icon={<Building2 size={14} />}
              label="企业"
            />
          </div>
          <div
            className="group relative"
            title={`个人${r.workerSigned ? '已签' : '未签'}`}
          >
            <SignStatusCell
              signed={r.workerSigned}
              icon={<UserCircle size={14} />}
              label="个人"
            />
          </div>
          <div
            className="group relative"
            title={`平台${r.platformSigned ? '已签' : '未签'}`}
          >
            <SignStatusCell
              signed={r.platformSigned}
              icon={<Network size={14} />}
              label="平台"
            />
          </div>
        </div>
      ),
    },
    {
      key: 'depositStatus',
      title: '存证状态',
      width: 110,
      render: (r) => {
        if (r.status === 'deposited' || r.blockchainHash) {
          return (
            <Badge variant="success" dot>
              <span className="flex items-center gap-1">
                <ShieldCheck size={11} />
                已存证
              </span>
            </Badge>
          );
        }
        if (r.companySigned && r.workerSigned && r.platformSigned) {
          return (
            <Badge variant="info" dot>
              待存证
            </Badge>
          );
        }
        return (
          <Badge variant="neutral" dot>
            未开始
          </Badge>
        );
      },
    },
    {
      key: 'signedAt',
      title: '签署时间',
      width: 150,
      render: (r) => (
        <span className="text-sm text-gray-500">
          {r.signedAt ? formatDate(r.signedAt) : '-'}
        </span>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: 200,
      align: 'right',
      fixed: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye size={13} />}
            onClick={() => navigate(`/contracts/${r.id}`)}
          >
            预览
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Download size={13} />}
            disabled={r.status !== 'deposited' && !r.blockchainHash}
          >
            PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ShieldCheck size={13} />}
            disabled={r.status !== 'deposited' && !r.blockchainHash}
          >
            验签
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">协议管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有灵活用工协议，支持预览、下载和区块链验签</p>
        </div>
      </div>

      <Card padding="none">
        <div className="border-b border-gray-200 px-5 pt-4 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={clsx(
                    'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all',
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <FileText size={14} />
                  {tab.label}
                  <span
                    className={clsx(
                      'inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-xs font-semibold',
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {tabCounts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 space-y-4 border-b border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="搜索"
              leftIcon={<Search size={16} />}
              inputProps={{
                placeholder: '搜索协议编号、用工标题、人员姓名...',
                value: keyword,
                onChange: (e) => setKeyword(e.target.value),
                onKeyDown: (e) => e.key === 'Enter' && setPage(1),
              }}
            />
            <FormField
              label="签署日期（起）"
              type="input"
              inputProps={{
                type: 'date',
                value: dateFrom,
                onChange: (e) => setDateFrom(e.target.value),
              }}
            />
            <FormField
              label="签署日期（止）"
              type="input"
              inputProps={{
                type: 'date',
                value: dateTo,
                onChange: (e) => setDateTo(e.target.value),
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              <Filter size={12} />
              共找到 <span className="font-semibold text-gray-700">{filtered.length}</span> 份协议
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                重置
              </Button>
              <Button size="sm" onClick={() => setPage(1)} leftIcon={<Search size={14} />}>
                搜索
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-5">
          <Table<TableContract>
            columns={columns}
            data={loading ? [] : paged}
            rowKey="id"
            loading={loading}
            emptyText={
              undefined as any
            }
          />
          {!loading && paged.length === 0 && (
            <div className="py-12">
              <EmptyState
                compact
                title="暂无符合条件的协议"
                description="请调整搜索条件或切换其他标签页"
                action={{
                  label: '重置条件',
                  onClick: resetFilters,
                  variant: 'secondary',
                }}
              />
            </div>
          )}
        </CardContent>

        {total > 0 && (
          <CardFooter>
            <div className="flex items-center justify-between w-full flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                显示第 <span className="font-semibold text-gray-700">{startIdx + 1}</span> -{' '}
                <span className="font-semibold text-gray-700">
                  {Math.min(startIdx + pageSize, total)}
                </span>{' '}
                条，共 <span className="font-semibold text-gray-700">{total}</span> 条记录
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage(1)}
                  className="h-9 w-9 !p-0"
                >
                  <ChevronsLeft size={16} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="h-9 w-9 !p-0"
                >
                  <ChevronLeft size={16} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && p - arr[idx - 1] > 1 && (
                        <span className="px-1 text-gray-400">...</span>
                      )}
                      <Button
                        variant={p === currentPage ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setPage(p)}
                        className={clsx('h-9 w-9 !p-0', p === currentPage && 'ring-2 ring-blue-200')}
                      >
                        {p}
                      </Button>
                    </span>
                  ))}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className="h-9 w-9 !p-0"
                >
                  <ChevronRight size={16} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(totalPages)}
                  className="h-9 w-9 !p-0"
                >
                  <ChevronsRight size={16} />
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
