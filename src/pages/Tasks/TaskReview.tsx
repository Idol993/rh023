import { useState } from 'react';
import {
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Box,
  Clock,
  CheckSquare,
  Square,
  Filter,
  User,
  MapPin,
  Image as ImageIcon,
  AlertCircle,
  Download,
} from 'lucide-react';
import { clsx } from 'clsx';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatDate, formatNumber } from '../../utils/format';
import type { CheckIn, TaskSubmission } from '@shared/types';

type ReviewStatus = 'pending_review' | 'completed' | 'rejected';

interface ReviewTask {
  id: string;
  title: string;
  workerName: string;
  workerAvatar?: string;
  type: 'hourly' | 'piecework';
  status: ReviewStatus;
  reviewResult?: 'pass' | 'reject';
  submittedAt: string;
  estimatedAmount: number;
  checkIns?: CheckIn[];
  submissions?: TaskSubmission[];
  acceptanceCriteria: { text: string; checked: boolean }[];
  workHours?: number;
  actualHours?: number;
  pieceRate?: number;
  hourlyRate?: number;
  pieceCount?: number;
  submittedCount?: number;
  reviewComment?: string;
}

const mockTasks: ReviewTask[] = [
  {
    id: 'T004',
    title: '服装流水线缝纫作业',
    workerName: '赵敏',
    type: 'piecework',
    status: 'pending_review',
    submittedAt: '2026-06-20T17:00:00',
    estimatedAmount: 2400,
    pieceRate: 8,
    pieceCount: 300,
    submittedCount: 300,
    checkIns: [
      { id: 'CI1', taskId: 'T004', workerId: 'W1', type: 'checkin', timestamp: '2026-06-20T08:00:00', location: { lat: 31.23, lng: 121.47 }, locationValid: true },
      { id: 'CI2', taskId: 'T004', workerId: 'W1', type: 'checkout', timestamp: '2026-06-20T17:00:00', location: { lat: 31.23, lng: 121.47 }, locationValid: true },
    ],
    submissions: [
      { id: 'SUB1', taskId: 'T004', count: 150, images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/r1-${i}/600/400`), description: '上午完成150件', submittedAt: '2026-06-20T12:30:00' },
      { id: 'SUB2', taskId: 'T004', count: 150, images: Array.from({ length: 5 }, (_, i) => `https://picsum.photos/seed/r2-${i}/600/400`), description: '下午完成150件', submittedAt: '2026-06-20T17:00:00' },
    ],
    acceptanceCriteria: [
      { text: '针距均匀，无跳针、漏针现象', checked: true },
      { text: '缝份平直，宽度误差不超过0.1cm', checked: true },
      { text: '线头清理干净，无线毛残留', checked: true },
      { text: '尺寸符合规格要求，误差±1cm以内', checked: false },
      { text: '无明显污渍、破损或色差', checked: true },
    ],
  },
  {
    id: 'T005',
    title: '食品包装检验',
    workerName: '孙丽',
    type: 'piecework',
    status: 'pending_review',
    submittedAt: '2026-06-20T16:30:00',
    estimatedAmount: 432,
    pieceRate: 1.2,
    pieceCount: 360,
    submittedCount: 180,
    submissions: [
      { id: 'SUB3', taskId: 'T005', count: 180, images: Array.from({ length: 4 }, (_, i) => `https://picsum.photos/seed/r3-${i}/600/400`), description: '完成数量180件', submittedAt: '2026-06-20T16:30:00' },
    ],
    acceptanceCriteria: [
      { text: '包装封口完整，无破损漏气', checked: true },
      { text: '标签信息正确，印刷清晰', checked: true },
      { text: '产品摆放整齐，数量准确', checked: true },
      { text: '无过期或临近过期产品', checked: true },
    ],
  },
  {
    id: 'T011',
    title: '电子元件焊接加工',
    workerName: '刘佳',
    type: 'piecework',
    status: 'pending_review',
    submittedAt: '2026-06-20T16:00:00',
    estimatedAmount: 1800,
    pieceRate: 3,
    pieceCount: 600,
    submittedCount: 600,
    checkIns: [
      { id: 'CI3', taskId: 'T011', workerId: 'W2', type: 'checkin', timestamp: '2026-06-20T07:55:00', location: { lat: 31.23, lng: 121.47 }, locationValid: true },
      { id: 'CI4', taskId: 'T011', workerId: 'W2', type: 'checkout', timestamp: '2026-06-20T16:05:00', location: { lat: 31.23, lng: 121.47 }, locationValid: true },
    ],
    submissions: [
      { id: 'SUB4', taskId: 'T011', count: 320, images: Array.from({ length: 5 }, (_, i) => `https://picsum.photos/seed/r4-${i}/600/400`), description: '上午320件', submittedAt: '2026-06-20T12:00:00' },
      { id: 'SUB5', taskId: 'T011', count: 280, images: Array.from({ length: 4 }, (_, i) => `https://picsum.photos/seed/r5-${i}/600/400`), description: '下午280件', submittedAt: '2026-06-20T16:00:00' },
    ],
    acceptanceCriteria: [
      { text: '焊点圆润饱满，无虚焊假焊', checked: true },
      { text: '元件位置正确，极性正确', checked: true },
      { text: '引脚剪切整齐，不短路', checked: true },
      { text: '板面清洁，无残留助焊剂', checked: true },
    ],
  },
  {
    id: 'T006',
    title: '仓储物流搬运',
    workerName: '周磊',
    type: 'hourly',
    status: 'completed',
    reviewResult: 'pass',
    submittedAt: '2026-06-19T18:00:00',
    estimatedAmount: 285,
    hourlyRate: 30,
    workHours: 9.5,
    actualHours: 9.5,
    checkIns: [
      { id: 'CI5', taskId: 'T006', workerId: 'W3', type: 'checkin', timestamp: '2026-06-19T08:00:00', location: { lat: 31.23, lng: 121.47 }, locationValid: true },
      { id: 'CI6', taskId: 'T006', workerId: 'W3', type: 'checkout', timestamp: '2026-06-19T17:30:00', location: { lat: 31.23, lng: 121.47 }, locationValid: true },
    ],
    acceptanceCriteria: [
      { text: '按时到岗打卡，无迟到早退', checked: true },
      { text: '货物搬运规范，无损坏', checked: true },
      { text: '服从安排，完成分配任务', checked: true },
      { text: '工作场地整洁，有序', checked: true },
    ],
  },
  {
    id: 'T007',
    title: '零部件打磨加工',
    workerName: '吴芳',
    type: 'piecework',
    status: 'completed',
    reviewResult: 'pass',
    submittedAt: '2026-06-19T17:30:00',
    estimatedAmount: 5250,
    pieceRate: 15,
    pieceCount: 350,
    submittedCount: 350,
    submissions: [
      { id: 'SUB6', taskId: 'T007', count: 350, images: Array.from({ length: 7 }, (_, i) => `https://picsum.photos/seed/r6-${i}/600/400`), description: '全部完成', submittedAt: '2026-06-19T17:30:00' },
    ],
    acceptanceCriteria: [
      { text: '表面光滑无划痕', checked: true },
      { text: '尺寸公差符合图纸要求', checked: true },
      { text: '无毛刺、飞边', checked: true },
      { text: '表面处理均匀', checked: true },
    ],
  },
  {
    id: 'T012',
    title: '产品分类分拣',
    workerName: '陈晨',
    type: 'piecework',
    status: 'rejected',
    reviewResult: 'reject',
    reviewComment: '约30%产品分类错误，需要重新分拣后再次提交。部分产品有明显划痕。',
    submittedAt: '2026-06-19T16:00:00',
    estimatedAmount: 800,
    pieceRate: 0.8,
    pieceCount: 1000,
    submittedCount: 1000,
    submissions: [
      { id: 'SUB7', taskId: 'T012', count: 1000, images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/r7-${i}/600/400`), description: '完成1000件', submittedAt: '2026-06-19T16:00:00' },
    ],
    acceptanceCriteria: [
      { text: '分类准确，无错放', checked: false },
      { text: '外观检查，剔除瑕疵品', checked: false },
      { text: '数量清点准确', checked: true },
      { text: '包装标识清晰', checked: true },
    ],
  },
];

const tabs = [
  { key: 'pending_review' as const, label: '待验收', variant: 'warning' as const },
  { key: 'completed' as const, label: '已通过', variant: 'success' as const },
  { key: 'rejected' as const, label: '已驳回', variant: 'danger' as const },
];

export default function TaskReview() {
  const [activeTab, setActiveTab] = useState<ReviewStatus>('pending_review');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [detailTask, setDetailTask] = useState<ReviewTask | null>(null);
  const [rejectTask, setRejectTask] = useState<ReviewTask | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);

  const filteredTasks = mockTasks.filter((task) => {
    if (task.status !== activeTab) return false;
    if (searchKeyword && !task.title.includes(searchKeyword) && !task.workerName.includes(searchKeyword)) {
      return false;
    }
    if (dateFilter && !task.submittedAt.startsWith(dateFilter)) {
      return false;
    }
    return true;
  });

  const pendingCount = mockTasks.filter(t => t.status === 'pending_review').length;
  const passedCount = mockTasks.filter(t => t.status === 'completed').length;
  const rejectedCount = mockTasks.filter(t => t.status === 'rejected').length;

  const toggleSelect = (id: string) => {
    setSelectedTasks(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(t => t.id));
    }
  };

  const handleBatchPass = () => {
    alert(`批量通过 ${selectedTasks.length} 个任务`);
    setSelectedTasks([]);
  };

  const handlePass = (task: ReviewTask) => {
    alert(`已通过任务: ${task.title}`);
    setDetailTask(null);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) return;
    alert(`已驳回任务: ${rejectTask?.title}\n原因: ${rejectReason}`);
    setRejectTask(null);
    setRejectReason('');
  };

  const openPhotoViewer = (photos: string[], index: number) => {
    setCurrentPhotos(photos);
    setPhotoIndex(index);
    setShowPhotoViewer(true);
  };

  const prevPhoto = () => {
    setPhotoIndex(prev => (prev - 1 + currentPhotos.length) % currentPhotos.length);
  };

  const nextPhoto = () => {
    setPhotoIndex(prev => (prev + 1) % currentPhotos.length);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">任务验收</h1>
            <p className="text-sm text-gray-500 mt-1">审核任务完成情况，通过或驳回验收申请</p>
          </div>
          {activeTab === 'pending_review' && selectedTasks.length > 0 && (
            <Button
              variant="primary"
              size="md"
              leftIcon={<CheckSquare size={16} />}
              onClick={handleBatchPass}
            >
              批量通过 ({selectedTasks.length})
            </Button>
          )}
        </div>
      </div>

      <Card padding="none" className="mb-6 overflow-hidden">
        <div className="flex items-center border-b border-gray-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.key === 'pending_review' ? pendingCount : tab.key === 'completed' ? passedCount : rejectedCount;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedTasks([]);
                }}
                className={clsx(
                  'relative px-6 py-4 text-sm font-medium transition-all',
                  isActive
                    ? 'text-gray-900 bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{tab.label}</span>
                  <span
                    className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-semibold',
                      isActive
                        ? tab.variant === 'warning'
                          ? 'bg-amber-100 text-amber-700'
                          : tab.variant === 'success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {count}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-3 px-5 py-3">
            <div className="relative w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索任务/工人..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full h-9 pl-10 pr-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="relative w-44">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-9 pl-10 pr-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchKeyword('');
                setDateFilter('');
              }}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
            >
              <Filter size={14} />
              重置
            </button>
          </div>
        </div>
      </Card>

      {activeTab === 'pending_review' && filteredTasks.length > 0 && (
        <div className="mb-4 flex items-center gap-3 px-1">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {selectedTasks.length === filteredTasks.length ? (
              <CheckSquare size={18} className="text-blue-600" />
            ) : (
              <Square size={18} />
            )}
            <span className="font-medium">全选</span>
          </button>
          <span className="text-xs text-gray-400">
            已选 {selectedTasks.length} / {filteredTasks.length}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pb-8">
        {filteredTasks.length === 0 ? (
          <Card padding="md">
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                <Filter size={28} className="text-gray-300" />
              </div>
              <div className="text-lg font-medium text-gray-600 mb-1">暂无{tabs.find(t => t.key === activeTab)?.label}任务</div>
              <div className="text-sm text-gray-400">请尝试调整筛选条件</div>
            </div>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} padding="md" hoverable className="relative">
              {activeTab === 'pending_review' && (
                <button
                  type="button"
                  onClick={() => toggleSelect(task.id)}
                  className="absolute top-5 left-5 z-10"
                >
                  {selectedTasks.includes(task.id) ? (
                    <CheckSquare size={20} className="text-blue-600" />
                  ) : (
                    <Square size={20} className="text-gray-300 hover:text-gray-400" />
                  )}
                </button>
              )}

              <div className={clsx(activeTab === 'pending_review' && 'pl-10')}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0">
                      {task.workerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-bold text-gray-900 truncate">{task.title}</h3>
                        <Badge variant="neutral" size="sm">#{task.id}</Badge>
                        {task.type === 'hourly' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-medium">
                            <Clock size={11} />计时
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[11px] font-medium">
                            <Box size={11} />计件
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {task.workerName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(task.submittedAt)}
                        </span>
                        <MapPin size={12} className="text-gray-300" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-xs text-gray-500 mb-1">预计金额</div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(task.estimatedAmount)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  {task.checkIns && task.checkIns.length > 0 && (
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="text-xs text-blue-600 font-semibold mb-2.5 flex items-center gap-1.5">
                        <Clock size={13} />打卡记录
                      </div>
                      <div className="space-y-1.5">
                        {task.checkIns.slice(0, 2).map((ci) => (
                          <div key={ci.id} className="flex items-center justify-between text-xs">
                            <span className={clsx(
                              ci.type === 'checkin' ? 'text-emerald-700' : 'text-amber-700',
                              'font-medium'
                            )}>
                              {ci.type === 'checkin' ? '上班' : '下班'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-600 font-mono">
                                {new Date(ci.timestamp).toLocaleTimeString('zh-CN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {!ci.locationValid && (
                                <span className="text-red-500" title="位置异常">!</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.submissions && task.submissions.length > 0 && (
                    <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                      <div className="text-xs text-purple-600 font-semibold mb-2.5 flex items-center gap-1.5">
                        <Box size={13} />计件成果
                      </div>
                      <div className="space-y-1.5">
                        {task.submissions.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-700">{formatDate(sub.submittedAt, false)}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-purple-700">
                                {formatNumber(sub.count)}件
                              </span>
                              <span className="text-gray-400 flex items-center gap-0.5">
                                <ImageIcon size={11} />{sub.images.length}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                    <div className="text-xs text-amber-600 font-semibold mb-2.5 flex items-center gap-1.5">
                      <CheckSquare size={13} />验收标准
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">已符合</span>
                        <span className="font-bold text-emerald-600">
                          {task.acceptanceCriteria.filter(c => c.checked).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">待确认</span>
                        <span className="font-bold text-amber-600">
                          {task.acceptanceCriteria.filter(c => !c.checked).length}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-amber-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                          style={{
                            width: `${(task.acceptanceCriteria.filter(c => c.checked).length / task.acceptanceCriteria.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {task.status === 'rejected' && task.reviewComment && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-red-700 mb-1">驳回原因</div>
                      <div className="text-sm text-red-600">{task.reviewComment}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setDetailTask(task)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    查看详情 →
                  </button>

                  {task.status === 'pending_review' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<XCircle size={15} />}
                        onClick={() => {
                          setRejectTask(task);
                          setRejectReason('');
                        }}
                      >
                        驳回
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle size={15} />}
                        onClick={() => handlePass(task)}
                      >
                        通过
                      </Button>
                    </div>
                  )}
                  {task.status === 'completed' && (
                    <Badge variant="success" dot>
                      已通过验收
                    </Badge>
                  )}
                  {task.status === 'rejected' && (
                    <Badge variant="danger" dot>
                      已驳回
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        open={!!detailTask}
        onClose={() => setDetailTask(null)}
        size="xl"
        title={
          <div>
            <h2 className="text-lg font-bold text-gray-900">{detailTask?.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>#{detailTask?.id}</span>
              <span>·</span>
              <span>{detailTask?.workerName}</span>
              <span>·</span>
              <span>{formatDate(detailTask?.submittedAt || '')}</span>
            </div>
          </div>
        }
        footer={
          detailTask?.status === 'pending_review' ? (
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-500">
                预计金额: <span className="font-bold text-emerald-600">{formatCurrency(detailTask.estimatedAmount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setDetailTask(null)}>
                  关闭
                </Button>
                <Button
                  variant="danger"
                  leftIcon={<XCircle size={16} />}
                  onClick={() => {
                    setRejectTask(detailTask);
                    setRejectReason('');
                    setDetailTask(null);
                  }}
                >
                  驳回
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<CheckCircle size={16} />}
                  onClick={() => handlePass(detailTask)}
                >
                  通过验收
                </Button>
              </div>
            </div>
          ) : undefined
        }
      >
        {detailTask && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {detailTask.checkIns && detailTask.checkIns.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    打卡时间线
                  </h4>
                  <div className="relative pl-6">
                    <div className="absolute left-2.5 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-emerald-300 to-amber-300" />
                    {detailTask.checkIns.map((ci, idx) => (
                      <div key={ci.id} className="relative pb-5 last:pb-0">
                        <div
                          className={clsx(
                            'absolute -left-4 top-0.5 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center',
                            ci.type === 'checkin' ? 'bg-emerald-500' : 'bg-amber-500'
                          )}
                        >
                          {ci.type === 'checkin' ? (
                            <CheckCircle size={11} className="text-white" />
                          ) : (
                            <XCircle size={11} className="text-white" />
                          )}
                        </div>
                        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-gray-900">
                              {ci.type === 'checkin' ? '上班打卡' : '下班打卡'}
                            </span>
                            {!ci.locationValid && (
                              <Badge variant="danger" size="sm">位置异常</Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {formatDate(ci.timestamp)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            <MapPin size={10} className="inline mr-1" />
                            经纬度: {ci.location.lat}, {ci.location.lng}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckSquare size={16} className="text-amber-500" />
                  验收标准检查
                </h4>
                <div className="space-y-2.5">
                  {detailTask.acceptanceCriteria.map((c, idx) => (
                    <label
                      key={idx}
                      className={clsx(
                        'flex items-start gap-2.5 p-3 rounded-lg border transition-colors cursor-pointer',
                        c.checked
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-gray-100 bg-gray-50 hover:bg-amber-50/50 hover:border-amber-200'
                      )}
                    >
                      <div
                        className={clsx(
                          'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                          c.checked
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white border-2 border-gray-300'
                        )}
                      >
                        {c.checked && <CheckCircle size={12} />}
                      </div>
                      <span className={clsx(
                        'text-sm leading-relaxed',
                        c.checked ? 'text-emerald-800' : 'text-gray-600'
                      )}>
                        {c.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {detailTask.submissions && detailTask.submissions.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-purple-600" />
                    成果物照片
                  </span>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    <Download size={12} />
                    下载全部
                  </button>
                </h4>
                {detailTask.submissions.map((sub) => (
                  <div key={sub.id} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="font-semibold text-gray-700">
                          {formatNumber(sub.count)} 件
                        </span>
                        <span>·</span>
                        <span>{formatDate(sub.submittedAt)}</span>
                      </div>
                      {sub.description && (
                        <span className="text-xs text-gray-500 italic max-w-[40%] truncate">
                          {sub.description}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {sub.images.map((img, imgIdx) => (
                        <button
                          key={imgIdx}
                          type="button"
                          onClick={() => openPhotoViewer(sub.images, imgIdx)}
                          className="aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group"
                        >
                          <img
                            src={img}
                            alt={`成果 ${imgIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!rejectTask}
        onClose={() => setRejectTask(null)}
        size="md"
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle size={18} className="text-red-600" />
            </div>
            <span>驳回验收</span>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setRejectTask(null)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim()}
              leftIcon={<XCircle size={16} />}
            >
              确认驳回
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-100">
            <div className="text-sm font-semibold text-red-800 mb-1">
              即将驳回: {rejectTask?.title}
            </div>
            <div className="text-xs text-red-600">
              工人: {rejectTask?.workerName} · 金额: {formatCurrency(rejectTask?.estimatedAmount || 0)}
            </div>
          </div>

          <FormField
            label="驳回原因"
            required
            type="textarea"
            textareaProps={{
              placeholder: '请详细说明驳回原因，如：产品质量不合格、数量有误、缺少凭证等...',
              value: rejectReason,
              onChange: (e) => setRejectReason(e.target.value),
              rows: 5,
              maxLength: 500,
            }}
            hint={`${rejectReason.length}/500`}
          />

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                驳回后工人将收到通知并可修改后重新提交。请确保驳回理由清晰明确，以便工人快速修正。
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={showPhotoViewer}
        onClose={() => setShowPhotoViewer(false)}
        size="xl"
        showCloseButton={true}
      >
        <div className="relative bg-gray-900 rounded-xl overflow-hidden -mx-2 -my-2">
          <button
            type="button"
            onClick={() => setShowPhotoViewer(false)}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X size={20} />
          </button>

          {currentPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="aspect-video max-h-[70vh] flex items-center justify-center p-8">
            <img
              src={currentPhotos[photoIndex]}
              alt={`照片 ${photoIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {currentPhotos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
              {photoIndex + 1} / {currentPhotos.length}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
