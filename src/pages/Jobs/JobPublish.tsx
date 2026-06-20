import { FilePlus, Save, Eye, MapPin, Clock, DollarSign, Users, FileText, Tag } from 'lucide-react';

export default function JobPublish() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FilePlus className="h-7 w-7 text-blue-600" />
            发布新岗位
          </h1>
          <p className="mt-1 text-sm text-gray-500">创建并发布灵活用工岗位信息</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Eye className="h-4 w-4" />
            预览
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Save className="h-4 w-4" />
            保存发布
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              基本信息
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">岗位名称</label>
                <input type="text" placeholder="如：仓库分拣员、配送骑手、数据标注员..." className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">用工类型</label>
                  <select className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white">
                    <option>小时工</option>
                    <option>计件工</option>
                    <option>临时项目</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">招聘人数</label>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <input type="number" placeholder="人数" className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white" />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">岗位描述</label>
                <textarea rows={5} placeholder="详细描述工作内容、职责要求..." className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-none" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              技能要求
            </h2>
            <div className="flex flex-wrap gap-2">
              {['无经验可培训', '吃苦耐劳', '年龄18-45岁', '会使用智能手机', '健康证'].map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                  {tag} ×
                </span>
              ))}
              <button className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-500 hover:border-blue-500 hover:text-blue-600">
                + 添加标签
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              薪资设置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">时薪/单价</label>
                <input type="text" placeholder="¥ 25.00 / 小时" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">结算周期</label>
                <select className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white">
                  <option>日结</option>
                  <option>周结</option>
                  <option>月结</option>
                  <option>项目完成结算</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              工作时间
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">开始日期</label>
                  <input type="date" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">结束日期</label>
                  <input type="date" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-rose-600" />
              工作地点
            </h2>
            <div className="space-y-3">
              <input type="text" placeholder="搜索地址..." className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white" />
              <div className="h-40 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm text-gray-500">
                地图组件占位
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
