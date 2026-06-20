import { Kanban, Clock, User, CheckCircle2, AlertTriangle, MoreHorizontal, MapPin } from 'lucide-react';

export default function TaskBoard() {
  const columns = [
    {
      id: 'pending',
      title: '待开始',
      color: 'bg-gray-500',
      tasks: [
        { id: 'TK-001', title: '朝阳区仓库分拣', worker: '刘师傅', time: '08:00-18:00', location: '朝阳物流园A区', priority: 'normal' },
        { id: 'TK-002', title: '海淀片区外卖配送', worker: '王大哥', time: '10:00-20:00', location: '中关村周边', priority: 'high' },
      ],
    },
    {
      id: 'in_progress',
      title: '进行中',
      color: 'bg-blue-500',
      tasks: [
        { id: 'TK-003', title: '展会现场协助', worker: '张阿姨', time: '09:00-17:00', location: '顺义新国展', priority: 'high' },
      ],
    },
    {
      id: 'pending_review',
      title: '待审核',
      color: 'bg-amber-500',
      tasks: [
        { id: 'TK-004', title: '餐饮门店服务', worker: '李先生', time: '11:00-21:00', location: '东城王府井', priority: 'normal' },
      ],
    },
    {
      id: 'completed',
      title: '已完成',
      color: 'bg-emerald-500',
      tasks: [
        { id: 'TK-005', title: '数据标注任务', worker: '赵小姐', time: '远程8小时', location: '居家办公', priority: 'low' },
        { id: 'TK-006', title: '商超理货员', worker: '孙师傅', time: '07:00-15:00', location: '丰台永辉', priority: 'normal' },
      ],
    },
  ];

  const priorityMap: Record<string, { label: string; color: string }> = {
    high: { label: '高', color: 'bg-rose-100 text-rose-700' },
    normal: { label: '中', color: 'bg-amber-100 text-amber-700' },
    low: { label: '低', color: 'bg-gray-100 text-gray-600' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Kanban className="h-7 w-7 text-indigo-600" />
            任务看板
          </h1>
          <p className="mt-1 text-sm text-gray-500">按状态查看所有任务进展</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <div key={col.id} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                <h3 className="font-semibold text-gray-900">{col.title}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 shadow-sm">
                  {col.tasks.length}
                </span>
              </div>
              <button className="p-1 rounded-lg hover:bg-white text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {col.tasks.map((task) => {
                const pr = priorityMap[task.priority];
                return (
                  <div key={task.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-600">{task.id}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${pr.color}`}>{pr.label}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">{task.title}</h4>
                    <div className="space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>{task.worker}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{task.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{task.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
