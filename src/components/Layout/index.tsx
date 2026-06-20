import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { clsx } from 'clsx';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <div className="hidden shrink-0 lg:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
        />
        <main
          className={clsx(
            'flex-1 overflow-y-auto',
            'scroll-smooth'
          )}
        >
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      <button
        type="button"
        onClick={() => setSidebarCollapsed((v) => !v)}
        className="fixed bottom-6 left-6 z-30 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-md ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:text-gray-900 lg:flex"
        title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
      >
        <svg
          className={clsx(
            'h-5 w-5 transition-transform',
            sidebarCollapsed && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
}

export default AppLayout;
