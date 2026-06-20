import { Upload, Image, FileText, Send, Plus, X, CheckCircle2 } from 'lucide-react';

export default function TaskSubmit() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Upload className="h-7 w-7 text-blue-600" />
          任务提交
        </h1>
        <p className="mt-1 text-sm text-gray-500">提交任务完成情况，等待企业审核</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              提交信息
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">任务编号</label>
                  <input type="text" value="TK-001" readOnly className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-600" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">完成数量</label>
                  <div className="flex items-center gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">−</button>
                    <input type="number" value="420" className="flex-1 text-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white" />
                    <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">+</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">工作描述</label>
                <textarea rows={6} placeholder="详细描述今日完成的工作内容、遇到的问题等..." className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-none" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  工作凭证照片
                  <span className="ml-1 text-gray-400 font-normal">(最多9张)</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="relative group">
                      <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                        <Image className="h-8 w-8 text-blue-400" />
                      </div>
                      <button className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors">
                    <Plus className="h-6 w-6" />
                    <span className="text-xs mt-1">添加图片</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium">计件任务验收标准</p>
                    <ul className="mt-2 space-y-1 text-blue-800 text-xs">
                      <li>• 分拣准确率需达到 99% 以上</li>
                      <li>• 每小时标准分拣量 60 件</li>
                      <li>• 破损率低于 0.1%</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">费用预估</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">完成数量</span>
                <span className="font-medium text-gray-900">420 件</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">单价</span>
                <span className="font-medium text-gray-900">¥2.00/件</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">基础金额</span>
                <span className="font-medium text-gray-900">¥840.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">质量奖金</span>
                <span className="font-medium text-emerald-600">+¥50.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">预估扣款</span>
                <span className="font-medium text-rose-600">-¥0.00</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">税前合计</span>
                <span className="text-2xl font-bold text-emerald-600">¥890.00</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all">
              <Send className="h-5 w-5" />
              提交审核
            </button>
            <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Upload className="h-4 w-4" />
              保存草稿
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
