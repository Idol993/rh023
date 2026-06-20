import { MapPinCheck, MapPin, Camera, Clock, CheckCircle2, User, Calendar, AlertTriangle, Info } from 'lucide-react';

export default function CheckIn() {
  const todayRecords = [
    { type: 'checkin', time: '08:02:15', status: 'valid', location: '北京·朝阳区物流园A区门口', distance: '12m' },
    { type: 'checkout', time: '12:01:33', status: 'valid', location: '北京·朝阳区物流园A区门口', distance: '18m' },
    { type: 'checkin', time: '13:03:08', status: 'valid', location: '北京·朝阳区物流园A区门口', distance: '22m' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapPinCheck className="h-7 w-7 text-emerald-600" />
          考勤打卡
        </h1>
        <p className="mt-1 text-sm text-gray-500">位置核验打卡，保障用工安全合规</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <div className="relative rounded-3xl border border-gray-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-8 shadow-sm overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-200/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

            <div className="relative z-10 text-center">
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 shadow-xl shadow-emerald-500/30">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">14:32</p>
                    <p className="text-xs text-gray-500 mt-1">2025-01-15 周三</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-gray-700">距工作地点 15m · 位置有效</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button className="group relative flex flex-col items-center gap-2">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-xl">
                    <MapPinCheck className="h-8 w-8" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">上班打卡</span>
                </button>
                <button className="group relative flex flex-col items-center gap-2">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-xl">
                    <Camera className="h-8 w-8" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">拍照上传</span>
                </button>
                <button className="group relative flex flex-col items-center gap-2">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl">
                    <MapPinCheck className="h-8 w-8" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">下班打卡</span>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                今日打卡记录
              </h2>
              <span className="text-sm text-gray-500">共 3 条</span>
            </div>
            <div className="divide-y divide-gray-100">
              {todayRecords.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      r.type === 'checkin' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {r.type === 'checkin' ? <MapPinCheck className="h-5 w-5" /> : <MapPinCheck className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {r.type === 'checkin' ? '上班打卡' : '下班打卡'}
                        </p>
                        {r.status === 'valid' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            位置有效
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                            <AlertTriangle className="h-3 w-3" />
                            位置异常
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{r.location} · 偏差{r.distance}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-mono font-semibold text-gray-900">{r.time}</p>
                    <p className="text-xs text-gray-400">2025-01-15</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              任务信息
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">任务编号</span>
                <span className="font-mono font-medium text-gray-900">TK-001</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">任务名称</span>
                <span className="font-medium text-gray-900">仓库分拣员</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">工作时间</span>
                <span className="font-medium text-gray-900">08:00-18:00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">工作地点</span>
                <span className="font-medium text-gray-900 text-right">朝阳物流园A区</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">用时统计</span>
                <span className="font-semibold text-emerald-600">5h 59m</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900">打卡提示</h3>
                <ul className="mt-2 space-y-1 text-xs text-blue-800">
                  <li>• 请在工作地点 100m 范围内打卡</li>
                  <li>• 建议开启 GPS 和相机权限</li>
                  <li>• 异常打卡将触发风控审核</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
