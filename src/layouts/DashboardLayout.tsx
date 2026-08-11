import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  HardDrive,
  UserCircle,
  QrCode,
  LogOut,
  Menu,
  X,
  Printer,
  ChevronRight,
  Megaphone,
} from 'lucide-react';
import { supabase } from '@/supabase/client';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

import {
  MessageSquare,
} from 'lucide-react';

const currentNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { to: '/dashboard/orders', label: 'Print Queue', icon: <ClipboardList size={20} /> },
  { to: '/dashboard/qr', label: 'Portal Link', icon: <QrCode size={20} /> },
  { to: '/dashboard/storage', label: 'Cloud Drive', icon: <HardDrive size={20} /> },
  { to: '/dashboard/profile', label: 'Identity', icon: <UserCircle size={20} /> },
  { to: '/dashboard/settings', label: 'System Settings', icon: <Settings size={20} /> },
  { to: '/dashboard/support', label: 'Helpdesk', icon: <MessageSquare size={20} /> },
];

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [announcement, setAnnouncement] = useState<{ message: string; type: string } | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { data } = await supabase
          .from('announcements')
          .select('message, type')
          .eq('is_active', true)
          .limit(1)
          .single();
          
        if (data) {
          setAnnouncement(data);
        }
      } catch (err) {
        // Silently ignore if no announcement
      }
    };
    
    fetchAnnouncement();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPage = currentNavItems.find(item => {
    if (item.to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(item.to);
  });

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden selection:bg-indigo-500/30 text-white font-sans relative">
      {/* Background ambient light */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Floating Glass Dock Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col my-4 ml-4 rounded-3xl
          bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl shadow-black
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'}
          lg:translate-x-0
          ${sidebarCollapsed ? 'w-[80px]' : 'w-[260px]'}
        `}
      >
        {/* Logo Area */}
        <div className={`flex items-center gap-3 px-6 py-6 border-b border-white/5 ${sidebarCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] shrink-0">
            <Printer size={20} className="text-indigo-400" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col whitespace-nowrap overflow-hidden">
              <span className="text-lg font-bold text-white tracking-tight">
                Printify
              </span>
              <span className="text-[9px] text-indigo-400/80 font-mono tracking-[0.2em] uppercase">
                Terminal
              </span>
            </div>
          )}

          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${sidebarCollapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/90'
                }`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <div className="relative">
                {item.icon}
              </div>
              {!sidebarCollapsed && <span className="tracking-wide">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-white/5 space-y-2">
          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setSidebarCollapsed(prev => !prev)}
            className={`hidden lg:flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium
              text-white/40 hover:bg-white/5 hover:text-white/80
              transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight size={20} className={`transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium
              text-red-400/70 hover:bg-red-500/10 hover:text-red-400 shadow-[inset_0_0_0_1px_rgba(239,68,68,0)] hover:shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]
              transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}
            title="Logout"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Terminate Session</span>}
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-[112px]' : 'lg:pl-[292px]'} pr-4 py-4`}>
        
        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-3xl shadow-2xl relative">
          
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-black/20">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors border border-white/10"
              >
                <Menu size={20} />
              </button>

              {/* Page title */}
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                  {currentPage?.label || 'Terminal'}
                </h1>
              </div>
            </div>

            {/* Status indicators */}
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM ONLINE
              </span>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide relative">
            
            {/* Announcement Banner */}
            {announcement && (
              <div className={`
                flex items-center gap-3 px-6 py-3 border-b border-white/5 
                ${announcement.type === 'warning' ? 'bg-amber-500/10 text-amber-300' : ''}
                ${announcement.type === 'error' ? 'bg-red-500/10 text-red-300' : ''}
                ${announcement.type === 'success' ? 'bg-emerald-500/10 text-emerald-300' : ''}
                ${announcement.type === 'info' ? 'bg-indigo-500/10 text-indigo-300' : ''}
                ${!['warning', 'error', 'success', 'info'].includes(announcement.type) ? 'bg-indigo-500/10 text-indigo-300' : ''}
              `}>
                <Megaphone size={18} className="shrink-0 animate-pulse" />
                <p className="text-sm font-medium tracking-wide">{announcement.message}</p>
              </div>
            )}

            <div className="flex-1 p-6 relative">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
