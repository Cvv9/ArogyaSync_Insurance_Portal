// src/components/Layout.jsx — Shared app shell with sidebar + header
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/', label: 'Patient Lookup', icon: Search },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, agent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-surface-darker text-text-light font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 inset-y-0 left-0 w-64 bg-surface-dark border-r border-border-glass
          flex flex-col transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border-glass">
          <div className="w-9 h-9 rounded-lg bg-accent-cyan/15 flex items-center justify-center overflow-hidden border border-accent-cyan/20">
            <img src="/app_logo.png" alt="ArogyaSync" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <span className="text-text-white font-semibold text-base tracking-tight">ArogyaSync</span>
            <span className="block text-[11px] text-text-muted leading-tight">Insurance Portal</span>
          </div>
          {/* Mobile close */}
          <button
            className="ml-auto md:hidden text-text-muted hover:text-text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-accent-cyan/15 text-accent-cyan'
                  : 'text-text-muted hover:text-text-light hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-glass">
          <p className="text-[11px] text-text-muted">&copy; 2026 ArogyaSync</p>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 bg-surface-dark/80 backdrop-blur-md border-b border-border-glass flex items-center px-4 gap-3">
          <button
            className="md:hidden text-text-muted hover:text-text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {agent && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted mr-2">
              <div className="w-7 h-7 rounded-full bg-accent-cyan/15 flex items-center justify-center text-accent-cyan font-semibold text-xs">
                {agent.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="leading-tight">
                <span className="block text-text-light font-medium">{agent.name}</span>
                <span className="block text-[10px] text-text-muted">{agent.insurance_company}</span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-muted
              hover:text-accent-red hover:bg-accent-red/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
