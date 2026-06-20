import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  User,
  Camera,
  Phone,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  FileText,
  Lock,
  ChevronDown,
  ChevronUp,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Star,
  MapPin,
  Calendar,
  Plus,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Trash2,
  ChevronRight,
  Download,
  Clock,
  DollarSign,
  BarChart3,
  BadgeCheck,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatCard } from '../../components/ui/StatCard';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatNumber, formatDate, formatDateOnly, maskIdCard, maskBankCard, maskPhone, maskName } from '../../utils/format';
import { settlements, contracts, users } from '../../mock/data';

type TabKey = 'profile' | 'verify' | 'bank' | 'income' | 'agreement' | 'security';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: '基本资料', icon: <User size={16} /> },
  { key: 'verify', label: '实名认证', icon: <ShieldCheck size={16} /> },
  { key: 'bank', label: '银行卡管理', icon: <CreditCard size={16} /> },
  { key: 'income', label: '收入明细', icon: <DollarSign size={16} /> },
  { key: 'agreement', label: '我的协议', icon: <FileText size={16} /> },
  { key: 'security', label: '账号安全', icon: <Lock size={16} /> },
];

export default function Me() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [expandedIncome, setExpandedIncome] = useState<string | null>('2026-06');
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [defaultBank] = useState('default-bank-1');

  const currentUser = user || users[0];

  const incomeOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e5e7eb',
        textStyle: { color: '#374151' },
        axisPointer: { type: 'shadow' },
        formatter: (params: { name: string; value: number }[]) => {
          const p = params[0];
          return `<div class="font-medium">${p.name}</div><div class="text-emerald-600 font-bold mt-1">¥${formatNumber(p.value)}</div>`;
        },
      },
      grid: { left: '2%', right: '2%', bottom: '3%', top: '5%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false },
        axisLabel: { color: '#6b7280', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [
        {
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.4)' },
              ],
            },
          },
          emphasis: {
            itemStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#059669' },
                  { offset: 1, color: 'rgba(5, 150, 105, 0.5)' },
                ],
              },
            },
          },
          data: [8650, 9280, 7820, 10560, 12380, 11850],
        },
      ],
    }),
    []
  );

  const userIncome = useMemo(
    () =>
      settlements.filter((s) => s.workerId === currentUser.id || s.workerId === 'usr1001').concat([
        ...settlements.slice(0, 2).map((s, i) => ({
          ...s,
          id: `${s.id}-ext-${i}`,
          totalBeforeTax: s.totalBeforeTax + i * 1500,
          netAmount: s.netAmount + i * 1200,
          status: 'paid' as const,
          paidAt: new Date(Date.now() - (i + 1) * 86400000 * 30).toISOString(),
          confirmedAt: new Date(Date.now() - (i + 1) * 86400000 * 28).toISOString(),
        })),
      ]),
    [currentUser.id]
  );

  const monthlyIncome = useMemo(() => {
    const map = new Map<string, { items: typeof userIncome; total: number }>();
    userIncome.forEach((s) => {
      const d = new Date(s.confirmedAt || s.paidAt || Date.now());
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { items: [], total: 0 });
      const entry = map.get(key)!;
      entry.items.push(s);
      entry.total += s.netAmount;
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [userIncome]);

  const bankCards = [
    {
      id: 'default-bank-1',
      bankName: '中国工商银行',
      cardType: '储蓄卡',
      cardNo: '6222021234567890123',
      branch: '上海张江高科技园区支行',
      isDefault: true,
      iconBg: 'bg-red-500',
    },
    {
      id: 'bank-2',
      bankName: '中国建设银行',
      cardType: '储蓄卡',
      cardNo: '6217003456789012345',
      branch: '上海漕河泾开发区支行',
      isDefault: false,
      iconBg: 'bg-blue-600',
    },
  ];

  const agreements = [
    { id: 'a1', name: '平台用户服务协议', version: 'v3.2.1', signedAt: '2026-03-15', status: 'signed' },
    { id: 'a2', name: '灵活用工劳务协议模板', version: 'v2.3.0', signedAt: '2026-06-20', status: 'signed' },
    { id: 'a3', name: '个人信息授权委托书', version: 'v1.5.0', signedAt: '2026-03-15', status: 'signed' },
    { id: 'a4', name: '薪税代征代缴协议', version: 'v2.0.0', signedAt: '2026-03-15', status: 'signed' },
  ];

  const loginDevices = [
    { id: 'd1', type: 'mobile', name: 'iPhone 15 Pro', location: '上海市浦东新区', lastLogin: '刚刚', isCurrent: true },
    { id: 'd2', type: 'desktop', name: 'Windows 11 - Chrome', location: '上海市浦东新区', lastLogin: '今天 09:25', isCurrent: false },
    { id: 'd3', type: 'mobile', name: 'iPad Air', location: '上海市徐汇区', lastLogin: '昨天 18:40', isCurrent: false },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50 border-violet-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-200/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative group shrink-0">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-violet-500/20 ring-4 ring-white">
              {currentUser.name?.charAt(0) || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-white shadow-lg shadow-gray-200 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors group-hover:scale-105">
              <Camera size={16} />
            </button>
            {currentUser.verified && (
              <div className="absolute -top-1 -left-1 h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-md border-2 border-white">
                <BadgeCheck size={14} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
              <Badge variant="info" className="bg-violet-100 text-violet-700 border-violet-200">
                {currentUser.role === 'worker'
                  ? '灵活用工'
                  : currentUser.role === 'hr'
                  ? '企业HR'
                  : currentUser.role === 'finance'
                  ? '财务专员'
                  : '平台管理员'}
              </Badge>
              <Badge variant="success" dot>
                {currentUser.acceptRate >= 0.9 ? '金牌用户' : currentUser.acceptRate >= 0.8 ? '银牌用户' : '铜牌用户'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400 shrink-0" />
                <span className="font-mono">{maskPhone(currentUser.phone)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Star size={14} className="text-amber-400 shrink-0 fill-amber-400" />
                <span>
                  信誉评分 <span className="font-semibold text-gray-900">{currentUser.rating}</span>/5.0
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                {currentUser.verified ? (
                  <>
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span className="text-emerald-600 font-medium">已实名认证</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={14} className="text-amber-500 shrink-0" />
                    <span className="text-amber-600 font-medium">未实名认证</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={14} className="text-gray-400 shrink-0" />
                <span className="truncate">{currentUser.location?.address || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Sparkles size={14} className="text-violet-500 shrink-0" />
                <span>
                  接单率 <span className="font-semibold text-gray-900">{Math.round(currentUser.acceptRate * 100)}%</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={14} className="text-gray-400 shrink-0" />
                <span>加入 186 天</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-sm">
              <div className="text-xs text-gray-500 mb-1">近6月总收入</div>
              <div className="text-2xl font-bold text-emerald-600 tabular-nums mb-2">¥{formatNumber(60540)}</div>
              <div className="w-48 h-20">
                <ReactECharts option={incomeOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="border-b border-gray-100 -mx-5 px-5">
          <div className="flex items-center gap-1 overflow-x-auto pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
        <CardContent className="pt-6">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-5">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Edit3 size={16} className="text-blue-600" /> 个人信息
                </h3>
                <FormField label="姓名" required>
                  <input
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    defaultValue={currentUser.name}
                  />
                </FormField>
                <FormField label="手机号码" required>
                  <input
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    defaultValue={currentUser.phone}
                  />
                </FormField>
                <FormField label="电子邮箱">
                  <input
                    type="email"
                    placeholder="请输入电子邮箱"
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="性别">
                    <select className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <option>男</option>
                      <option>女</option>
                      <option>保密</option>
                    </select>
                  </FormField>
                  <FormField label="出生日期">
                    <input
                      type="date"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </FormField>
                </div>
              </div>
              <div className="space-y-5">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-600" /> 其他信息
                </h3>
                <FormField label="所在地区">
                  <input
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    defaultValue={currentUser.location?.address}
                  />
                </FormField>
                <FormField label="技能标签">
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                    {(currentUser.skills || []).map((skill, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                        {skill}
                        <button className="ml-1.5 text-blue-400 hover:text-blue-600">×</button>
                      </span>
                    ))}
                    <button className="inline-flex items-center px-2.5 py-1 rounded-md bg-white text-gray-500 text-xs font-medium border border-dashed border-gray-300 hover:border-blue-300 hover:text-blue-600 transition-colors">
                      <Plus size={12} /> 添加
                    </button>
                  </div>
                </FormField>
                <FormField label="个人简介" type="textarea">
                  <textarea
                    rows={4}
                    placeholder="简单介绍一下自己吧..."
                    defaultValue={`多年灵活用工经验，做事认真负责，${(currentUser.skills || []).slice(0, 2).join('、')}等技能熟练，工作态度好，服从安排。`}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </FormField>
                <div className="flex justify-end pt-2">
                  <Button>保存修改</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="max-w-2xl">
              {currentUser.verified ? (
                <div className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200 mb-5">
                    <CheckCircle2 size={40} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1.5">恭喜您，实名认证已通过！</h3>
                  <p className="text-sm text-gray-500 mb-6">您的身份信息已完成三要素核验，可正常使用平台全部功能</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
                    <div className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-white">
                      <div className="text-xs text-gray-500 mb-1">姓名</div>
                      <div className="text-sm font-semibold text-gray-900">{currentUser.name}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-white">
                      <div className="text-xs text-gray-500 mb-1">身份证号</div>
                      <div className="text-sm font-mono text-gray-900">{maskIdCard(currentUser.idCard)}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-white">
                      <div className="text-xs text-gray-500 mb-1">手机号</div>
                      <div className="text-sm font-mono text-gray-900">{maskPhone(currentUser.phone)}</div>
                    </div>
                  </div>
                  <Badge variant="success" className="mt-6">
                    认证时间：{formatDateOnly('2026-03-15')}
                  </Badge>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-amber-800 mb-0.5">尚未完成实名认证</div>
                      <div className="text-xs text-amber-600">完成实名认证后可正常接单、结算工资，请填写真实信息</div>
                    </div>
                  </div>
                  <FormField label="真实姓名" required hint="请与身份证上保持一致">
                    <input
                      placeholder="请输入您的真实姓名"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </FormField>
                  <FormField label="身份证号码" required hint="18位居民身份证号">
                    <input
                      placeholder="请输入18位身份证号码"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </FormField>
                  <FormField label="手机号码" required hint="用于接收验证码">
                    <div className="flex gap-2">
                      <input
                        placeholder="请输入手机号"
                        defaultValue={currentUser.phone}
                        className="flex-1 block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                      />
                      <Button variant="secondary" size="md">
                        发送验证码
                      </Button>
                    </div>
                  </FormField>
                  <FormField label="短信验证码" required>
                    <input
                      placeholder="请输入6位验证码"
                      maxLength={6}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono tracking-widest"
                    />
                  </FormField>
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <input type="checkbox" defaultChecked className="mt-0.5" />
                    <span>
                      我已阅读并同意《实名认证服务协议》和《个人信息授权书》，同意平台将信息提交至权威机构进行核验
                    </span>
                  </div>
                  <Button fullWidth>提交认证</Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bankCards.map((card) => (
                  <div
                    key={card.id}
                    className={`relative p-5 rounded-2xl border-2 transition-all ${
                      card.isDefault
                        ? 'border-blue-200 bg-gradient-to-br from-blue-50/50 to-white'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    {card.isDefault && (
                      <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-600 text-white">
                        默认卡
                      </span>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`h-12 w-12 rounded-xl ${card.iconBg} flex items-center justify-center shadow-md`}>
                        <CreditCard size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{card.bankName}</div>
                        <div className="text-xs text-gray-500">{card.cardType} · {card.branch}</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="font-mono text-xl tracking-wider text-gray-800 tabular-nums">
                        {maskBankCard(card.cardNo)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      {!card.isDefault && card.id !== defaultBank && (
                        <Button size="sm" variant="secondary">
                          设为默认
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" leftIcon={<Eye size={14} />}>
                        查看完整卡号
                      </Button>
                      {!card.isDefault && (
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto" leftIcon={<Trash2 size={14} />}>
                          解绑
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <button className="p-5 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30 transition-all min-h-[180px]">
                  <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Plus size={22} />
                  </div>
                  <div className="text-sm font-medium">添加新银行卡</div>
                  <div className="text-xs text-gray-400">支持工商银行、建设银行、农业银行等主流银行</div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'income' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  title="本月收入"
                  value={formatCurrency(11850)}
                  icon={<DollarSign size={18} />}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                  trend={{ value: 5.6, isUp: false, label: '较上月' }}
                />
                <StatCard
                  title="累计收入"
                  value={formatCurrency(60540)}
                  icon={<PiggyBank size={18} />}
                  iconBg="bg-violet-50"
                  iconColor="text-violet-600"
                />
                <StatCard
                  title="已结算笔数"
                  value={formatNumber(18)}
                  icon={<CheckCircle2 size={18} />}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                />
                <StatCard
                  title="平均月薪"
                  value={formatCurrency(10090)}
                  icon={<BarChart3 size={18} />}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                />
              </div>

              <Card padding="none" className="overflow-hidden border border-gray-100">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">月度收入明细</h3>
                  <Button size="sm" variant="secondary" leftIcon={<Download size={14} />}>
                    导出全部
                  </Button>
                </div>
                <div className="divide-y divide-gray-100">
                  {monthlyIncome.map(([month, data]) => (
                    <div key={month}>
                      <button
                        onClick={() => setExpandedIncome(expandedIncome === month ? null : month)}
                        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <DollarSign size={18} className="text-emerald-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">{month.replace('-', '年')}月</div>
                            <div className="text-xs text-gray-500">{data.items.length}笔结算</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-bold text-emerald-600 tabular-nums">{formatCurrency(data.total)}</div>
                            <div className="text-xs text-gray-400">税后实收</div>
                          </div>
                          {expandedIncome === month ? (
                            <ChevronUp size={18} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={18} className="text-gray-400" />
                          )}
                        </div>
                      </button>
                      {expandedIncome === month && (
                        <div className="px-5 pb-5 bg-gray-50/50">
                          <div className="space-y-2">
                            {data.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-100"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <FileText size={16} className="text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      任务结算 #{item.id.toUpperCase()}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                      <Clock size={10} />
                                      {formatDateOnly(item.confirmedAt)}
                                      <Badge
                                        variant={
                                          item.status === 'paid'
                                            ? 'success'
                                            : item.status === 'confirmed'
                                            ? 'info'
                                            : item.status === 'failed'
                                            ? 'danger'
                                            : 'warning'
                                        }
                                      >
                                        {item.status === 'paid'
                                          ? '已发放'
                                          : item.status === 'confirmed'
                                          ? '待发放'
                                          : item.status === 'failed'
                                          ? '发放失败'
                                          : '待确认'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-gray-900 tabular-nums">
                                    {formatCurrency(item.netAmount)}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    税前 {formatCurrency(item.totalBeforeTax)} · 税 -{formatCurrency(item.taxAmount)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'agreement' && (
            <div className="space-y-3">
              {agreements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="h-11 w-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                        {a.name}
                      </h4>
                      <Badge variant="neutral">{a.version}</Badge>
                      <Badge variant="success">已签署</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> 签署日期：{formatDateOnly(a.signedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={11} className="text-emerald-500" /> 区块链存证
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="ghost" leftIcon={<Eye size={14} />}>
                      查看
                    </Button>
                    <Button size="sm" variant="ghost" leftIcon={<Download size={14} />}>
                      下载
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card padding="none" className="border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <KeyRound size={16} className="text-blue-600" /> 修改登录密码
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">定期更换密码可提高账号安全性</p>
                  </div>
                  <Badge variant="success">上次修改：35天前</Badge>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="当前密码" required>
                    <div className="relative">
                      <input
                        type={showOldPwd ? 'text' : 'password'}
                        placeholder="请输入当前密码"
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPwd((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showOldPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormField>
                  <FormField label="新密码" required hint="8-20位，包含字母和数字">
                    <div className="relative">
                      <input
                        type={showNewPwd ? 'text' : 'password'}
                        placeholder="请输入新密码"
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormField>
                  <FormField label="确认新密码" required>
                    <div className="relative">
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        placeholder="请再次输入新密码"
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormField>
                </div>
                <div className="px-5 pb-5 flex justify-end">
                  <Button>确认修改</Button>
                </div>
              </Card>

              <Card padding="none" className="border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Monitor size={16} className="text-violet-600" /> 登录设备管理
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">如发现非本人设备，请及时下线并修改密码</p>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {loginDevices.map((d) => (
                    <div key={d.id} className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                            d.type === 'mobile' ? 'bg-sky-50' : 'bg-slate-50'
                          }`}
                        >
                          {d.type === 'mobile' ? (
                            <Smartphone size={20} className="text-sky-600" />
                          ) : (
                            <Monitor size={20} className="text-slate-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-gray-900">{d.name}</span>
                            {d.isCurrent && (
                              <Badge variant="success">当前设备</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin size={11} /> {d.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} /> {d.lastLogin}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!d.isCurrent && (
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          强制下线
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Smartphone size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">手机绑定</div>
                      <div className="text-xs text-gray-500">已绑定 {maskPhone(currentUser.phone)}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary">更换</Button>
                </div>
                <div className="p-5 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Lock size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">登录保护</div>
                      <div className="text-xs text-gray-500">异地登录需短信验证</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PiggyBank(props: { size: number; className?: string }) {
  return <div style={{ width: props.size, height: props.size }} className={props.className}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2 0 .5-1.2 1-2 1z" />
      <path d="M2 9v1c0 1.1.9 2 2 2h1" />
      <path d="M16 11h.01" />
    </svg>
  </div>;
}
