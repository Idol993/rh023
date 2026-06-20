import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  User,
  LogOut,
  Home,
  ChevronRight,
  Menu,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '@shared/types';
import { clsx } from 'clsx';

const roleBadgeConfig: Record<UserRole, { label: string; className: string }> = {
  worker: { label: '灵活就业人员', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  hr: { label: '企业HR', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  finance: { label: '财务人员', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  admin: { label: '平台管理员', className: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'worker', label: '灵活就业人员' },
  { value: 'hr', label: '企业HR' },
  { value: 'finance', label: '财务人员' },
  { value: 'admin', label: '平台管理员' },
];

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const selectedRole = useAuthStore((s) => s.selectedRole);
  const setSelectedRole = useAuthStore((s) => s.setSelectedRole);
  const logout = useAuthStore((s) => s.logout);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setRoleMenuOpen(false);
    navigate('/');
  };

  const roleBadge = roleBadgeConfig[selectedRole];

  const breadcrumbItems = location.pathname
    .split('/')
    .filter(Boolean)
    .map((seg) => ({
      label: decodeURIComponent(seg).charAt(0).toUpperCase() + decodeURIComponent(seg).slice(1),
      path: '/' + seg,
    }));

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Home size={16} className="text-gray-400" />
          <ChevronRight size={16} className="text-gray-300" />
          {breadcrumbItems.length === 0 ? (
            <span className="text-gray-900 font-medium">首页</span>
          ) : (
            breadcrumbItems.map((item, idx) => (
              <span key={item.path} className="flex items-center gap-1">
                <span
                  className={clsx(
                    idx === breadcrumbItems.length - 1
                      ? 'font-medium text-gray-900'
                      : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                  )}
                >
                  {item.label}
                </span>
                {idx < breadcrumbItems.length - 1 && (
                  <ChevronRight size={16} className="text-gray-300" />
                )}
              </span>
            ))
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="relative" ref={roleMenuRef}>
          <button
            type="button"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className={clsx(
              'hidden items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium md:inline-flex',
              roleBadge.className
            )}
          >
            <Shield size={12} />
            {roleBadge.label}
            <ChevronDown size={12} />
          </button>
          {roleMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {roleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleRoleChange(opt.value)}
                  className={clsx(
                    'block w-full px-4 py-2 text-left text-sm transition-colors',
                    selectedRole === opt.value
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">通知中心</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {[
                  { title: '新的任务分配', desc: '您有一个新的灵活用工任务待处理', time: '5分钟前', unread: true },
                  { title: '结算已完成', desc: '任务 #T202401001 结算已到账', time: '1小时前', unread: true },
                  { title: '合同待签署', desc: '您有一份电子合同待签署', time: '3小时前', unread: false },
                ].map((notif, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'border-b border-gray-100 px-4 py-3 last:border-0',
                      notif.unread && 'bg-blue-50/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                      {notif.unread && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{notif.desc}</p>
                    <p className="mt-1 text-xs text-gray-400">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 px-4 py-2 text-center">
                <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  查看全部
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-medium text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {user?.name || '未登录'}
              </p>
              <p className="text-xs text-gray-500 leading-tight">
                {user?.username || ''}
              </p>
            </div>
            <ChevronDown size={16} className="hidden text-gray-400 md:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name || '未登录'}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{user?.phone || ''}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <User size={16} />
                个人中心
              </button>
              <div className="my-1 h-px bg-gray-100" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
