import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Wallet,
  ShieldCheck,
  User,
  Lock,
  CheckCircle2,
  Loader2,
  Briefcase,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { UserRole, User as UserType } from '@shared/types';

interface RoleOption {
  key: UserRole;
  label: string;
  description: string;
  icon: typeof Users;
  defaultUsername: string;
}

const roleOptions: RoleOption[] = [
  {
    key: 'worker',
    label: '灵活用工者',
    description: '接单工作，按时计薪，灵活自由',
    icon: Briefcase,
    defaultUsername: 'zhangsan',
  },
  {
    key: 'hr',
    label: '企业HR',
    description: '发布岗位，匹配人员，管理合同',
    icon: Users,
    defaultUsername: 'limanager',
  },
  {
    key: 'finance',
    label: '企业财务',
    description: '结算审批，发票管理，税务申报',
    icon: Wallet,
    defaultUsername: 'wangaccountant',
  },
  {
    key: 'admin',
    label: '平台管理员',
    description: '全局监控，风控审核，纠纷处理',
    icon: ShieldCheck,
    defaultUsername: 'zhaoadmin',
  },
];

const mockUsers: Record<string, { username: string; name: string; role: UserRole }> = {
  worker: { username: 'zhangsan', name: '张三', role: 'worker' },
  hr: { username: 'limanager', name: '李经理', role: 'hr' },
  finance: { username: 'wangaccountant', name: '王会计', role: 'finance' },
  admin: { username: 'zhaoadmin', name: '赵管理员', role: 'admin' },
};

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const setSelectedRole = useAuthStore((s) => s.setSelectedRole);

  const [selectedRole, setSelectedRoleLocal] = useState<UserRole>('worker');
  const [username, setUsername] = useState('zhangsan');
  const [password, setPassword] = useState('123456');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const role = roleOptions.find((r) => r.key === selectedRole);
    if (role) {
      setUsername(role.defaultUsername);
    }
  }, [selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockUser = mockUsers[selectedRole];
    if (
      username === mockUser.username &&
      password === '123456'
    ) {
      const user: UserType = {
        id: `${selectedRole}-001`,
        username: mockUser.username,
        password: '123456',
        name: mockUser.name,
        role: mockUser.role,
        phone: '13800138000',
        idCard: '110101199001011234',
        avatar: '',
        companyId: selectedRole !== 'worker' && selectedRole !== 'admin' ? 'COMP-001' : undefined,
        verified: true,
        skills: [],
        location: {
          lat: 39.9042,
          lng: 116.4074,
          address: '北京市朝阳区',
        },
        rating: 4.8,
        acceptRate: 0.92,
        bankAccount: '6222021234567890',
        bankName: '中国工商银行',
      };

      login(user, `mock-token-${Date.now()}`);
      setSelectedRole(selectedRole);
      navigate('/');
    } else {
      setError('用户名或密码错误，请重试');
      setLoading(false);
    }
  };

  const currentRole = roleOptions.find((r) => r.key === selectedRole);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-10 text-center text-white">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-500/30">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold tracking-tight">灵活用工平台</h1>
              <p className="text-sm text-blue-200/80">Flexible Work Management System</p>
            </div>
          </div>
          <p className="mx-auto max-w-xl text-base text-blue-100/70">
            一站式灵活用工解决方案，智能匹配 · 电子签约 · 安全结算 · 合规风控
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl">
          <div className="grid lg:grid-cols-5">
            <div className="hidden bg-gradient-to-br from-blue-600/30 to-indigo-600/30 p-8 lg:col-span-2 lg:flex lg:flex-col lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">欢迎回来</h2>
                <p className="text-blue-100/70 text-sm leading-relaxed">
                  请选择您的身份角色，登录后即可体验完整的灵活用工管理平台功能。
                </p>
              </div>
              <div className="space-y-3 text-sm text-blue-100/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>智能人岗匹配算法</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>区块链存证电子合同</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>银行级资金安全通道</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>全流程合规风控体系</span>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur p-6 sm:p-8 lg:col-span-3 lg:p-10">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">选择角色登录</h3>
                <p className="text-sm text-gray-500">请选择您的身份类型</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.key;
                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => setSelectedRoleLocal(role.key)}
                      className={`group relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-300 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-200 scale-[1.02]'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-1 -right-1">
                          <CheckCircle2 className="h-5 w-5 text-blue-600 fill-white" />
                        </div>
                      )}
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div
                          className={`text-sm font-semibold ${
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                          }`}
                        >
                          {role.label}
                        </div>
                        <div className="text-xs text-gray-500 leading-tight mt-0.5 line-clamp-2">
                          {role.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    用户名
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={`默认：${currentRole?.defaultUsername}`}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码（默认：123456）"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">记住密码</span>
                  </label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                    忘记密码？
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>登录中...</span>
                    </>
                  ) : (
                    <>
                      <span>登录系统</span>
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-gray-100 pt-4 text-center">
                <p className="text-xs text-gray-500">
                  测试账号：zhangsan / limanager / wangaccountant / zhaoadmin
                </p>
                <p className="text-xs text-gray-400 mt-1">密码统一为：123456</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-blue-200/50">
          © 2025 灵活用工平台 Flexible Work Platform · 保留所有权利
        </div>
      </div>
    </div>
  );
}
