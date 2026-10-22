import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getMe } from '../services/api';
import { useToast } from '../context/ToastContext';
import ThemeToggle from './ui/ThemeToggle';
import Dropdown, { DropdownItem, DropdownDivider } from './ui/Dropdown';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  Briefcase, 
  GraduationCap, 
  UserRoundCheck,
  TrendingUp,
  Target,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  Bell,
  ChevronDown,
  FileText,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function Layout() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.info('You have been signed out successfully.', 'Signed Out');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Career Matches', path: '/career-report', icon: Target },
    { name: 'AI Career Coach', path: '/chat', icon: MessageSquareText },
    { name: 'Mock Interviews', path: '/interview', icon: UserRoundCheck },
    { name: 'Salary Estimate', path: '/results', icon: TrendingUp },
    { name: 'Curated Courses', path: '/courses', icon: GraduationCap },
    { name: 'Job Matches', path: '/jobs', icon: Briefcase },
  ];

  const notifications = [
    {
      id: 1,
      title: "New high-match job available",
      desc: "Synthetix AI posted Senior Full-Stack Engineer (96% match)",
      time: "10m ago",
      unread: true
    },
    {
      id: 2,
      title: "AI Interview feedback ready",
      desc: "Your latest mock interview scored 88/100",
      time: "2h ago",
      unread: true
    },
    {
      id: 3,
      title: "Resume parsed successfully",
      desc: "6 primary skills added to your talent inventory",
      time: "1d ago",
      unread: false
    }
  ];

  const currentRouteTitle = navItems.find(i => i.path === location.pathname)?.name || 'Dashboard';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 dark:bg-sky-400/20 animate-ping absolute" />
            <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <TrendingUp className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">Loading your profile</p>
            <p className="text-xs text-slate-400 mt-1">Connecting to CareerCraft AI engine...</p>
          </div>
        </div>
      </div>
    );
  }

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Modern Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          transform transition-all duration-300 ease-in-out lg:static flex flex-col shadow-xs
          ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                CareerCraft<span className="text-sky-500">AI</span>
              </span>
            )}
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="hidden lg:flex text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            <button 
              className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI System Live Status Indicator */}
        {!isSidebarCollapsed && (
          <div className="mx-4 mt-4 px-3.5 py-2.5 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-2xl flex items-center gap-2.5 animate-fade-in">
            <div className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1 leading-none">
                <Sparkles className="w-3 h-3 text-sky-500" /> Career Intelligence
              </span>
              <p className="text-[10px] text-sky-700/80 dark:text-sky-400/80 truncate mt-0.5">Real-time matching active</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isSidebarCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Left active accent bar */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-sky-500 rounded-r-full" />
                      )}
                      <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      {!isSidebarCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Profile & Links */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {!isSidebarCollapsed && (
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Landing Page</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Link>
          )}

          {/* User Profile Card with Dropdown */}
          <Dropdown
            align={isSidebarCollapsed ? 'left' : 'right'}
            className="w-full"
            trigger={
              <div className={`flex items-center gap-3 p-2 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer ${isSidebarCollapsed ? 'justify-center p-2' : ''}`}>
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {userInitial}
                </div>
                {!isSidebarCollapsed && (
                  <div className="overflow-hidden flex-1 text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.email}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Candidate Account</p>
                  </div>
                )}
                {!isSidebarCollapsed && (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </div>
            }
          >
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.email}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Active Session
              </p>
            </div>
            <DropdownItem icon={LayoutDashboard} onClick={() => navigate('/dashboard')}>
              Dashboard Overview
            </DropdownItem>
            <DropdownItem icon={Target} onClick={() => navigate('/career-report')}>
              My Career Matches
            </DropdownItem>
            <DropdownItem icon={FileText} onClick={() => navigate('/dashboard')}>
              Resume Manager
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem 
              icon={LogOut} 
              danger 
              onClick={() => setIsLogoutModalOpen(true)}
            >
              Sign Out
            </DropdownItem>
          </Dropdown>
        </div>
      </aside>

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 transition-colors">
          <div className="flex items-center gap-3">
            <button
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-hidden rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center text-white">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">CareerCraft<span className="text-sky-500">AI</span></span>
            </Link>

            {/* Breadcrumb on Desktop */}
            <div className="hidden lg:flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500 gap-2">
              <Link to="/dashboard" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                CareerCraft AI
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold capitalize">
                {currentRouteTitle}
              </span>
            </div>
          </div>

          {/* Right Header Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Coach Link */}
            <Link
              to="/chat"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/60 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
            >
              <MessageSquareText className="w-3.5 h-3.5 text-sky-500" />
              Ask AI Coach
            </Link>

            {/* Notification Bell Dropdown */}
            <Dropdown
              align="right"
              trigger={
                <button
                  type="button"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>
              }
            >
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                {unreadNotifications > 0 && (
                  <button 
                    onClick={() => setUnreadNotifications(0)}
                    className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${n.unread ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            </Dropdown>

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* User Dropdown on Top Navbar */}
            <Dropdown
              align="right"
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 p-1 pl-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-[10px] flex items-center justify-center">
                    {userInitial}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 mr-0.5" />
                </button>
              }
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.email}</p>
                <p className="text-[10px] text-slate-400">Authenticated</p>
              </div>
              <DropdownItem icon={LayoutDashboard} onClick={() => navigate('/dashboard')}>
                Dashboard
              </DropdownItem>
              <DropdownItem icon={Target} onClick={() => navigate('/career-report')}>
                Career Matches
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem icon={LogOut} danger onClick={() => setIsLogoutModalOpen(true)}>
                Sign Out
              </DropdownItem>
            </Dropdown>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <Outlet context={{ user, setUser }} />
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sign Out"
        description="Are you sure you want to log out of your CareerCraft AI account?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleLogout} icon={LogOut}>
              Yes, Sign Out
            </Button>
          </>
        }
      >
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Your saved skills, mock interview progress, and career reports will remain securely stored for your next visit.
        </p>
      </Modal>
    </div>
  );
}
