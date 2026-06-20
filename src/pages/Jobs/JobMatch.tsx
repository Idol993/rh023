import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Boxes,
  Star,
  Navigation,
  UserCheck,
  ThumbsUp,
  Briefcase,
  Eye,
  Send,
  Filter,
  Sparkles,
  Zap,
  Award,
  Shield,
  Check,
  RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FormField } from '../../components/ui/FormField';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { jobsApi } from '../../lib/api';
import { formatCurrency, formatDateOnly, formatPercent, getInitials, truncateText } from '../../utils/format';
import type { MatchResult, JobPost, User } from '@shared/types';

const MOCK_JOB: JobPost = {
  id: '1',
  companyId: 'c1',
  title: '双十一电商仓库分拣员急招',
  type: 'hourly',
  content: '负责仓库货物的分拣、打包、贴标等工作，工作环境整洁，有空调。',
  startDate: '2024-11-01',
  endDate: '2024-11-20',
  hourlyRate: 28,
  workLocation: {
    lat: 31.2304,
    lng: 121.4737,
    address: '上海市浦东新区张江高科技园区博云路2号',
    radius: 500,
  },
  skills: ['分拣员', '包装工', '装卸工'],
  requirements: ['能接受加班，有健康证优先', '工作认真负责'],
  acceptanceCriteria: [],
  status: 'matched',
  createdAt: '2024-10-25T09:00:00Z',
};

const MOCK_CANDIDATES: (MatchResult & { worker: User })[] = [
  {
    id: 'm1',
    jobId: '1',
    workerId: 'w1',
    skillMatchScore: 95,
    distanceKm: 2.3,
    ratingScore: 92,
    acceptRateScore: 88,
    totalScore: 92.5,
    status: 'pending',
    worker: {
      id: 'w1',
      username: 'zhangwei',
      password: '',
      name: '张伟',
      role: 'worker',
      phone: '13800138001',
      idCard: '310101199001011234',
      avatar: '',
      verified: true,
      skills: ['分拣员', '包装工', '装卸工', '仓管员'],
      location: { lat: 31.24, lng: 121.48, address: '上海市浦东新区张江镇' },
      rating: 4.8,
      acceptRate: 0.95,
      bankAccount: '6222021234567890',
      bankName: '工商银行',
    },
  },
  {
    id: 'm2',
    jobId: '1',
    workerId: 'w2',
    skillMatchScore: 88,
    distanceKm: 1.8,
    ratingScore: 96,
    acceptRateScore: 92,
    totalScore: 91.8,
    status: 'pending',
    worker: {
      id: 'w2',
      username: 'limei',
      password: '',
      name: '李梅',
      role: 'worker',
      phone: '13800138002',
      idCard: '310101199202022345',
      avatar: '',
      verified: true,
      skills: ['分拣员', '包装工', '理货员'],
      location: { lat: 31.235, lng: 121.475, address: '上海市浦东新区花木街道' },
      rating: 4.9,
      acceptRate: 0.98,
      bankAccount: '6222022345678901',
      bankName: '建设银行',
    },
  },
  {
    id: 'm3',
    jobId: '1',
    workerId: 'w3',
    skillMatchScore: 82,
    distanceKm: 4.5,
    ratingScore: 85,
    acceptRateScore: 90,
    totalScore: 85.5,
    status: 'accepted',
    worker: {
      id: 'w3',
      username: 'wanggang',
      password: '',
      name: '王刚',
      role: 'worker',
      phone: '13800138003',
      idCard: '310101198803033456',
      avatar: '',
      verified: false,
      skills: ['分拣员', '装卸工', '搬运工'],
      location: { lat: 31.22, lng: 121.46, address: '上海市浦东新区金桥镇' },
      rating: 4.5,
      acceptRate: 0.88,
      bankAccount: '6222023456789012',
      bankName: '农业银行',
    },
  },
  {
    id: 'm4',
    jobId: '1',
    workerId: 'w4',
    skillMatchScore: 78,
    distanceKm: 0.8,
    ratingScore: 88,
    acceptRateScore: 85,
    totalScore: 83.4,
    status: 'pending',
    worker: {
      id: 'w4',
      username: 'chenjing',
      password: '',
      name: '陈静',
      role: 'worker',
      phone: '13800138004',
      idCard: '310101199504044567',
      avatar: '',
      verified: true,
      skills: ['包装工', '分拣员', '服务员'],
      location: { lat: 31.232, lng: 121.472, address: '上海市浦东新区张江镇' },
      rating: 4.6,
      acceptRate: 0.9,
      bankAccount: '6222024567890123',
      bankName: '中国银行',
    },
  },
  {
    id: 'm5',
    jobId: '1',
    workerId: 'w5',
    skillMatchScore: 75,
    distanceKm: 6.2,
    ratingScore: 78,
    acceptRateScore: 80,
    totalScore: 76.8,
    status: 'pending',
    worker: {
      id: 'w5',
      username: 'liuqiang',
      password: '',
      name: '刘强',
      role: 'worker',
      phone: '13800138005',
      idCard: '310101199105055678',
      avatar: '',
      verified: false,
      skills: ['分拣员', '包装工', '快递员'],
      location: { lat: 31.2, lng: 121.44, address: '上海市浦东新区唐镇' },
      rating: 4.2,
      acceptRate: 0.82,
      bankAccount: '6222025678901234',
      bankName: '招商银行',
    },
  },
];

interface ScoreRingProps {
  score: number;
  size?: number;
}

function ScoreRing({ score, size = 96 }: ScoreRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 90) return 'stroke-emerald-500';
    if (s >= 80) return 'stroke-blue-500';
    if (s >= 70) return 'stroke-amber-500';
    return 'stroke-gray-400';
  };

  const getTextColor = (s: number) => {
    if (s >= 90) return 'text-emerald-600';
    if (s >= 80) return 'text-blue-600';
    if (s >= 70) return 'text-amber-600';
    return 'text-gray-600';
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={clsx(getColor(score), 'transition-all duration-700 ease-out')}
          strokeWidth={strokeWidth}
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={clsx('text-2xl font-bold', getTextColor(score))}>
          {score.toFixed(1)}
        </span>
        <span className="text-[10px] text-gray-400 -mt-0.5">综合分</span>
      </div>
    </div>
  );
}

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = getInitials(name);
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-cyan-500',
  ];
  const colorIndex = (name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % colors.length;

  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full font-bold text-white shadow-sm',
        colors[colorIndex]
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

export default function JobMatch() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [job] = useState<JobPost>(MOCK_JOB);
  const [candidates, setCandidates] = useState<(MatchResult & { worker: User })[]>(MOCK_CANDIDATES);

  const [minScore, setMinScore] = useState(0);
  const [maxDistance, setMaxDistance] = useState(20);
  const [skillMatchFilter, setSkillMatchFilter] = useState(false);
  const [inviteSentMap, setInviteSentMap] = useState<Record<string, boolean>>({});

  const filteredCandidates = candidates
    .filter((c) => c.totalScore >= minScore)
    .filter((c) => c.distanceKm <= maxDistance)
    .filter((c) => (skillMatchFilter ? c.skillMatchScore >= 80 : true))
    .sort((a, b) => b.totalScore - a.totalScore);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const handleSendInvite = (id: string) => {
    setInviteSentMap((prev) => ({ ...prev, [id]: true }));
  };

  const avgScore =
    candidates.length > 0
      ? (candidates.reduce((s, c) => s + c.totalScore, 0) / candidates.length).toFixed(1)
      : '0';
  const topScore = candidates.length > 0 ? Math.max(...candidates.map((c) => c.totalScore)).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/jobs')}
          leftIcon={<ArrowLeft size={16} />}
        >
          返回列表
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">智能匹配</h1>
          <p className="text-sm text-gray-500 mt-0.5">为您的用工需求匹配最合适的灵活用工人员</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleRefresh}
          loading={refreshing}
          leftIcon={<RefreshCw size={14} />}
        >
          重新匹配
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Briefcase size={18} className="text-blue-600" />
                  需求概览
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                {job.title}
              </h3>
              <div className="flex gap-2">
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
                <Badge variant="warning" dot>
                  {job.type === 'hourly'
                    ? `${formatCurrency(job.hourlyRate || 0)}/小时`
                    : `${formatCurrency(job.pieceRate || 0)}/件`}
                </Badge>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">{job.workLocation.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar size={15} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">
                    {formatDateOnly(job.startDate)} ~ {formatDateOnly(job.endDate)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">所需技能</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">工作内容</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {truncateText(job.content, 100)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  匹配统计
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-blue-50">
                  <p className="text-2xl font-bold text-blue-600">{candidates.length}</p>
                  <p className="text-xs text-blue-700 mt-0.5">候选人数</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-50">
                  <p className="text-2xl font-bold text-emerald-600">{topScore}</p>
                  <p className="text-xs text-emerald-700 mt-0.5">最高分</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-50">
                  <p className="text-2xl font-bold text-amber-600">{avgScore}</p>
                  <p className="text-xs text-amber-700 mt-0.5">平均分</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Filter size={12} />
                  筛选条件
                </p>

                <FormField
                  label="最低综合评分"
                  type="select"
                  selectProps={{
                    value: String(minScore),
                    onChange: (e) => setMinScore(parseInt(e.target.value)),
                  }}
                >
                  <option value="0">不限</option>
                  <option value="70">≥ 70 分</option>
                  <option value="80">≥ 80 分</option>
                  <option value="90">≥ 90 分</option>
                </FormField>

                <FormField
                  label={`距离范围：${maxDistance}km 以内`}
                  type="input"
                  inputProps={{
                    type: 'range',
                    min: 1,
                    max: 20,
                    step: 1,
                    value: String(maxDistance),
                    onChange: (e) => setMaxDistance(parseInt(e.target.value)),
                  }}
                />

                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={skillMatchFilter}
                    onChange={(e) => setSkillMatchFilter(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  仅显示技能高度匹配（≥80%）
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="text-sm text-gray-600">
              共找到 <span className="font-semibold text-gray-900">{filteredCandidates.length}</span> 位匹配候选人
              {filteredCandidates.length > 0 && (
                <span className="text-gray-400 ml-2">
                  按综合评分从高到低排序
                </span>
              )}
            </div>
          </div>

          {filteredCandidates.length === 0 ? (
            <EmptyState
              title="暂无匹配候选人"
              description="请调整筛选条件，或重新执行匹配以寻找更多候选人"
              action={{
                label: '清除筛选条件',
                onClick: () => {
                  setMinScore(0);
                  setMaxDistance(20);
                  setSkillMatchFilter(false);
                },
                variant: 'secondary',
              }}
            />
          ) : (
            filteredCandidates.map((c, idx) => {
              const inviteSent = inviteSentMap[c.id] || c.status === 'accepted';
              const isTop = idx < 2;

              return (
                <Card
                  key={c.id}
                  hoverable
                  className={clsx(
                    'relative overflow-hidden transition-all',
                    isTop && 'ring-1 ring-amber-200 bg-gradient-to-br from-amber-50/50 to-transparent'
                  )}
                >
                  {isTop && (
                    <div className="absolute top-0 right-0">
                      <div
                        className={clsx(
                          'flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-bl-xl',
                          idx === 0 ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
                        )}
                      >
                        <Award size={12} />
                        TOP {idx + 1}
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="relative shrink-0">
                          <Avatar name={c.worker.name} size={56} />
                          {c.worker.verified && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white">
                              <Shield size={10} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {c.worker.name}
                            </h3>
                            {c.worker.verified && (
                              <Badge variant="info" dot>
                                已实名认证
                              </Badge>
                            )}
                            {c.status === 'accepted' && (
                              <Badge variant="success" dot>
                                已接受邀请
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Star size={12} className="text-amber-400 fill-amber-400" />
                              <span className="font-semibold text-gray-700">{c.worker.rating.toFixed(1)}</span>
                              <span>/5.0</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <UserCheck size={12} className="text-emerald-500" />
                              接单率 <span className="font-semibold text-gray-700">{formatPercent(c.worker.acceptRate)}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Navigation size={12} className="text-blue-500" />
                              <span className="font-semibold text-gray-700">{c.distanceKm.toFixed(1)}km</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {c.worker.skills.slice(0, 5).map((s) => {
                              const matched = job.skills.includes(s);
                              return (
                                <span
                                  key={s}
                                  className={clsx(
                                    'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border',
                                    matched
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-gray-50 text-gray-600 border-gray-200'
                                  )}
                                >
                                  {matched && <Check size={10} className="mr-0.5" />}
                                  {s}
                                </span>
                              );
                            })}
                            {c.worker.skills.length > 5 && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500 border border-gray-200">
                                +{c.worker.skills.length - 5}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-500 flex items-center gap-1">
                                  <Zap size={10} />
                                  技能匹配度
                                </span>
                                <span className="font-semibold text-gray-700">{c.skillMatchScore}%</span>
                              </div>
                              <ProgressBar value={c.skillMatchScore} variant="success" size="sm" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-500 flex items-center gap-1">
                                  <Navigation size={10} />
                                  距离评分
                                </span>
                                <span className="font-semibold text-gray-700">
                                  {Math.max(0, 100 - c.distanceKm * 5)}%
                                </span>
                              </div>
                              <ProgressBar value={Math.max(0, 100 - c.distanceKm * 5)} variant="primary" size="sm" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-500 flex items-center gap-1">
                                  <ThumbsUp size={10} />
                                  历史评分
                                </span>
                                <span className="font-semibold text-gray-700">{c.ratingScore}%</span>
                              </div>
                              <ProgressBar value={c.ratingScore} variant="warning" size="sm" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-500 flex items-center gap-1">
                                  <UserCheck size={10} />
                                  接单率
                                </span>
                                <span className="font-semibold text-gray-700">{c.acceptRateScore}%</span>
                              </div>
                              <ProgressBar value={c.acceptRateScore} variant={c.acceptRateScore >= 90 ? 'success' : 'primary'} size="sm" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-3 sm:border-l sm:border-gray-100 sm:pl-5">
                        <ScoreRing score={c.totalScore} size={100} />
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye size={14} />}
                            onClick={() => navigate(`/workers/${c.workerId}`)}
                            fullWidth
                          >
                            查看详情
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<Send size={14} />}
                            disabled={inviteSent}
                            onClick={() => handleSendInvite(c.id)}
                            fullWidth
                          >
                            {inviteSent ? (
                              <span className="flex items-center gap-1">
                                <Check size={14} />
                                {c.status === 'accepted' ? '已接受' : '已发送'}
                              </span>
                            ) : (
                              '发送邀请'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
