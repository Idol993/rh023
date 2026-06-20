import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Users,
  Edit3,
  MapPin,
  Calendar,
  Clock,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Briefcase,
  TrendingUp,
  CheckCircle,
  FileText,
  XCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FormField } from '../../components/ui/FormField';
import { EmptyState } from '../../components/ui/EmptyState';
import { jobsApi } from '../../lib/api';
import { formatCurrency, formatDateOnly, timeAgo } from '../../utils/format';
import type { JobPost, JobPost as Job } from '@shared/types';

type StatusTab = 'all' | 'draft' | 'published' | 'matched' | 'in_progress' | 'completed';

const STATUS_TABS: { key: StatusTab; label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }[] = [
  { key: 'all', label: '全部', variant: 'neutral' },
  { key: 'draft', label: '草稿', variant: 'neutral' },
  { key: 'published', label: '已发布', variant: 'info' },
  { key: 'matched', label: '匹配中', variant: 'warning' },
  { key: 'in_progress', label: '进行中', variant: 'success' },
  { key: 'completed', label: '已完成', variant: 'success' },
];

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: '草稿', variant: 'neutral' },
  published: { label: '已发布', variant: 'info' },
  matched: { label: '匹配中', variant: 'warning' },
  in_progress: { label: '进行中', variant: 'success' },
  completed: { label: '已完成', variant: 'success' },
};

const MOCK_JOBS: JobPost[] = [
  {
    id: '1',
    companyId: 'c1',
    title: '双十一电商仓库分拣员急招',
    type: 'hourly',
    content: '负责仓库货物的分拣、打包、贴标等工作，工作环境整洁，有空调。',
    startDate: '2024-11-01',
    endDate: '2024-11-20',
    hourlyRate: 28,
    workLocation: { lat: 31.23, lng: 121.47, address: '上海市浦东新区张江高科技园区博云路2号', radius: 500 },
    skills: ['分拣员', '包装工'],
    requirements: ['能接受加班，有健康证优先', '工作认真负责'],
    acceptanceCriteria: [],
    status: 'published',
    createdAt: '2024-10-25T09:00:00Z',
  },
  {
    id: '2',
    companyId: 'c1',
    title: '快递驿站寒假工招聘',
    type: 'piecework',
    content: '负责快递件的扫码入库、出库、派送等工作，按件结算多劳多得。',
    startDate: '2025-01-15',
    endDate: '2025-02-15',
    pieceRate: 1.2,
    workLocation: { lat: 31.22, lng: 121.45, address: '上海市徐汇区漕河泾开发区桂平路333号', radius: 300 },
    skills: ['快递员', '分拣员', '装卸工'],
    requirements: ['熟悉智能手机操作', '能承受一定工作强度'],
    acceptanceCriteria: ['快递件完整无破损', '签收信息准确无误'],
    status: 'matched',
    createdAt: '2024-12-10T14:30:00Z',
  },
  {
    id: '3',
    companyId: 'c1',
    title: '春节期间酒店餐饮服务员',
    type: 'hourly',
    content: '负责酒店餐厅的顾客接待、传菜、清洁等工作，管两餐。',
    startDate: '2025-01-28',
    endDate: '2025-02-08',
    hourlyRate: 35,
    workLocation: { lat: 31.24, lng: 121.49, address: '上海市黄浦区南京东路100号', radius: 200 },
    skills: ['服务员', '清洁工'],
    requirements: ['形象气质佳，有服务意识', '有餐饮经验优先'],
    acceptanceCriteria: [],
    status: 'in_progress',
    createdAt: '2024-12-20T10:15:00Z',
  },
  {
    id: '4',
    companyId: 'c1',
    title: '电子厂流水线装配工（长期）',
    type: 'piecework',
    content: '电子产品的流水线组装、检测、包装等工作，环境恒温25度。',
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    pieceRate: 0.85,
    workLocation: { lat: 31.21, lng: 121.58, address: '上海市浦东新区康桥工业区康桥东路888号', radius: 1000 },
    skills: ['装配工', '包装工'],
    requirements: ['能适应两班倒', '无不良记录，身体健康'],
    acceptanceCriteria: ['产品合格率≥99%', '不良品不计入计件'],
    status: 'completed',
    createdAt: '2024-11-15T16:45:00Z',
  },
  {
    id: '5',
    companyId: 'c1',
    title: '写字楼保洁员招聘',
    type: 'hourly',
    content: '负责写字楼公共区域、卫生间的日常清洁工作，上午班。',
    startDate: '2025-02-01',
    endDate: '2025-12-31',
    hourlyRate: 22,
    workLocation: { lat: 31.23, lng: 121.47, address: '上海市静安区南京西路1266号恒隆广场', radius: 500 },
    skills: ['清洁工'],
    requirements: ['有相关保洁工作经验', '工作细致认真'],
    acceptanceCriteria: [],
    status: 'draft',
    createdAt: '2025-01-05T11:20:00Z',
  },
  {
    id: '6',
    companyId: 'c1',
    title: '超市收银员周末兼职',
    type: 'hourly',
    content: '负责超市收银台的顾客接待、商品扫码、收款找零等工作。',
    startDate: '2025-02-10',
    endDate: '2025-05-10',
    hourlyRate: 26,
    workLocation: { lat: 31.2, lng: 121.43, address: '上海市闵行区虹梅南路1755号大润发超市', radius: 400 },
    skills: ['收银员'],
    requirements: ['反应敏捷，数字敏感', '有收银经验优先'],
    acceptanceCriteria: [],
    status: 'published',
    createdAt: '2025-01-15T08:30:00Z',
  },
];

export default function JobList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<JobPost[]>(MOCK_JOBS);
  const [loading, setLoading] = useState(false);
  const [statusTab, setStatusTab] = useState<StatusTab>((searchParams.get('status') as StatusTab) || 'all');
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'hourly' | 'piecework'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  const filteredJobs = jobs.filter((job) => {
    if (statusTab !== 'all' && job.status !== statusTab) return false;
    if (typeFilter !== 'all' && job.type !== typeFilter) return false;
    if (keyword) {
      const lower = keyword.toLowerCase();
      if (
        !job.title.toLowerCase().includes(lower) &&
        !job.content.toLowerCase().includes(lower) &&
        !job.workLocation.address.toLowerCase().includes(lower)
      ) {
        return false;
      }
    }
    if (dateFrom && job.endDate < dateFrom) return false;
    if (dateTo && job.startDate > dateTo) return false;
    return true;
  });

  const total = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pagedJobs = filteredJobs.slice(startIdx, startIdx + pageSize);

  const tabCounts = STATUS_TABS.reduce((acc, tab) => {
    if (tab.key === 'all') acc[tab.key] = jobs.length;
    else acc[tab.key] = jobs.filter((j) => j.status === tab.key).length;
    return acc;
  }, {} as Record<StatusTab, number>);

  const handleTabChange = (tab: StatusTab) => {
    setStatusTab(tab);
    setPage(1);
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), status: tab });
  };

  const handleSearch = () => {
    setPage(1);
  };

  const resetFilters = () => {
    setKeyword('');
    setTypeFilter('all');
    setDateFrom('');
    setDateTo('');
    setStatusTab('all');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用工需求管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理您发布的所有用工需求</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/jobs/publish')}>
          发布用工需求
        </Button>
      </div>

      <Card padding="none">
        <div className="border-b border-gray-200 px-5 pt-4 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {STATUS_TABS.map((tab) => {
              const isActive = statusTab === tab.key;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
              label="搜索关键词"
              leftIcon={<Search size={16} />}
              inputProps={{
                placeholder: '搜索标题、内容、地址...',
                value: keyword,
                onChange: (e) => setKeyword(e.target.value),
                onKeyDown: (e) => e.key === 'Enter' && handleSearch(),
              }}
            />
            <FormField
              label="用工类型"
              type="select"
              selectProps={{
                value: typeFilter,
                onChange: (e) => setTypeFilter(e.target.value as typeof typeFilter),
              }}
            >
              <option value="all">全部类型</option>
              <option value="hourly">计时用工</option>
              <option value="piecework">计件用工</option>
            </FormField>
            <FormField
              label="开始日期（起）"
              type="input"
              inputProps={{
                type: 'date',
                value: dateFrom,
                onChange: (e) => setDateFrom(e.target.value),
              }}
            />
            <FormField
              label="结束日期（止）"
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
              共筛选出 <span className="font-semibold text-gray-700">{filteredJobs.length}</span> 条需求
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                重置筛选
              </Button>
              <Button size="sm" onClick={handleSearch} leftIcon={<Search size={14} />}>
                应用筛选
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : pagedJobs.length === 0 ? (
            <EmptyState
              compact
              title="暂无符合条件的需求"
              description="试试调整筛选条件，或创建新的用工需求"
              action={{
                label: '发布新需求',
                onClick: () => navigate('/jobs/publish'),
                variant: 'primary',
              }}
            />
          ) : (
            pagedJobs.map((job) => {
              const statusCfg = STATUS_CONFIG[job.status] || { label: job.status, variant: 'neutral' as const };
              return (
                <Card
                  key={job.id}
                  hoverable
                  className="border-gray-200 transition-all"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <h3
                            className="text-base font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
                            {job.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={statusCfg.variant} dot>
                            {statusCfg.label}
                          </Badge>
                          <Badge variant={job.type === 'hourly' ? 'info' : 'warning'}>
                            {job.type === 'hourly' ? (
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                计时
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Boxes size={11} />
                                计件
                              </span>
                            )}
                          </Badge>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            发布于 {timeAgo(job.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {job.type === 'hourly' ? (
                          <div>
                            <span className="text-2xl font-bold text-emerald-600">
                              {formatCurrency(job.hourlyRate || 0)}
                            </span>
                            <span className="text-xs text-gray-500">/小时</span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-2xl font-bold text-emerald-600">
                              {formatCurrency(job.pieceRate || 0)}
                            </span>
                            <span className="text-xs text-gray-500">/件</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">
                          {job.workLocation.address.length > 20
                            ? job.workLocation.address.slice(0, 20) + '...'
                            : job.workLocation.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} className="text-gray-400 shrink-0" />
                        <span>
                          {formatDateOnly(job.startDate)} ~ {formatDateOnly(job.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase size={14} className="text-gray-400 shrink-0" />
                        <span>
                          需求 <span className="font-semibold">{job.skills.length}</span> 类技能
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={12} className="text-emerald-500" />
                          <span>热度 高</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye size={14} />}
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          查看详情
                        </Button>
                        {(job.status === 'published' || job.status === 'matched') && (
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Users size={14} />}
                            onClick={() => navigate(`/jobs/${job.id}/match`)}
                          >
                            查看匹配
                          </Button>
                        )}
                        {(job.status === 'draft' || job.status === 'published') && (
                          <Button
                            size="sm"
                            leftIcon={<Edit3 size={14} />}
                            onClick={() => navigate(`/jobs/${job.id}/edit`)}
                          >
                            编辑
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </CardContent>

        {total > 0 && (
          <CardFooter>
            <div className="flex items-center justify-between w-full flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                显示第 <span className="font-semibold text-gray-700">{startIdx + 1}</span> -{' '}
                <span className="font-semibold text-gray-700">{Math.min(startIdx + pageSize, total)}</span> 条，
                共 <span className="font-semibold text-gray-700">{total}</span> 条记录
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
