import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  MapPinCheck,
  Receipt,
  FileCheck,
  AlertCircle,
  Briefcase,
  ClipboardList,
  CheckSquare,
  FileText,
  Calculator,
  Banknote,
  FileSpreadsheet,
  Building2,
  ShieldAlert,
  BarChart3,
  Settings,
  Users,
} from 'lucide-react';
import type { UserRole } from '@shared/types';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';

interface MenuItem {
  path: string;
  label: string;
  icon: typeof Home;
}

const menuConfig: Record<UserRole, MenuItem[]> = {
  worker: [
    { path: '/', label: '首页', icon: Home },
    { path: '/tasks/board', label: '任务看板', icon: LayoutDashboard },
    { path: '/checkin', label: '打卡中心', icon: MapPinCheck },
    { path: '/settlements', label: '结算明细', icon: Receipt },
    { path: '/contracts', label: '协议管理', icon: FileCheck },
    { path: '/disputes', label: '争议中心', icon: AlertCircle },
  ],
  hr: [
    { path: '/', label: '首页', icon: Home },
    { path: '/jobs/publish', label: '用工发布', icon: Briefcase },
    { path: '/jobs', label: '需求列表', icon: ClipboardList },
    { path: '/tasks/review', label: '任务验收', icon: CheckSquare },
    { path: '/settlements', label: '结算明细', icon: Receipt },
    { path: '/invoices', label: '发票管理', icon: FileText },
    { path: '/disputes', label: '争议中心', icon: AlertCircle },
  ],
  finance: [
    { path: '/', label: '首页', icon: Home },
    { path: '/settlements', label: '结算中心', icon: Calculator },
    { path: '/payouts', label: '发放中心', icon: Banknote },
    { path: '/invoices', label: '发票管理', icon: FileSpreadsheet },
    { path: '/tax', label: '税务申报', icon: FileText },
    { path: '/enterprise', label: '企业看板', icon: Building2 },
  ],
  admin: [
    { path: '/', label: '首页', icon: Home },
    { path: '/companies/audit', label: '企业审核', icon: Users },
    { path: '/risk', label: '风控中心', icon: ShieldAlert },
    { path: '/disputes', label: '争议处理', icon: AlertCircle },
    { path: '/monitor', label: '监管大屏', icon: BarChart3 },
    { path: '/settings', label: '系统配置', icon: Settings },
  ],
};

const roleLabels: Record<UserRole, string> = {
  worker: '灵活就业人员',
  hr: '企业HR',
  finance: '财务人员',
  admin: '平台管理员',
};

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const selectedRole = useAuthStore((s) => s.selectedRole);
  const menuItems = menuConfig[selectedRole] || menuConfig.worker;

  return (
    <aside
      className={clsx(
        'flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <LayoutDashboard size={18} />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">薪税结算平台</span>
            <span className="text-xs text-gray-500">{roleLabels[selectedRole]}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                clsx(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  collapsed && 'justify-center'
                )
              }
            >
              <Icon
                size={18}
                className={clsx(
                  'shrink-0 transition-colors',
                  'text-inherit'
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-gray-200 p-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-600">当前角色</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {roleLabels[selectedRole]}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
