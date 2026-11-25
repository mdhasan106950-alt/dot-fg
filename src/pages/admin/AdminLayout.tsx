import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  TicketPercent,
  ShoppingBag,
  Package,
  ShieldAlert,
  FileEdit,
  ArrowLeft,
  LogOut,
  Shield,
  Server,
  Lock,
  Users,
  Gavel,
  CreditCard,
  Handshake,
  Settings,
  ScrollText,
  Megaphone,
  Radio,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAuthorized = Boolean(
    user && (user.role === 'OWNER' || user.role === 'ADMIN' || (user.role as string).toLowerCase() === 'admin')
  );

  // If user is not admin, provide a clean, secure login prompt
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#080310] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-zinc-800 bg-zinc-950/90 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center mx-auto text-purple-400">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Staff Authentication Required</h2>
            <p className="text-xs text-zinc-400 leading-relaxed mt-2">
              This area is restricted to IRON CLOUD MC administrators and network leadership. Please log in with your authorized credentials to access administrative controls.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              to="/login"
              state={{ from: { pathname: '/admin' } }}
              className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl bg-[#7b2cbf] hover:bg-[#9d4edd] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-purple-950/50"
            >
              Sign In to Access Admin Dashboard
            </Link>
            <div className="flex items-center justify-center gap-4 pt-1 text-xs">
              <Link
                to="/"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Return to Public Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navGroups = [
    {
      category: 'Overview',
      items: [
        { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" />, end: true },
      ],
    },
    {
      category: 'Moderation & Players',
      items: [
        { to: '/admin/players', label: 'Players', icon: <Users className="w-3.5 h-3.5" /> },
        { to: '/admin/reports', label: 'Reports', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
        { to: '/admin/punishments', label: 'Punishments', icon: <Gavel className="w-3.5 h-3.5" /> },
      ],
    },
    {
      category: 'Store & Commerce',
      items: [
        { to: '/admin/orders', label: 'Orders', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
        { to: '/admin/products', label: 'Products', icon: <Package className="w-3.5 h-3.5" /> },
        { to: '/admin/coupons', label: 'Coupons', icon: <TicketPercent className="w-3.5 h-3.5" /> },
        { to: '/admin/payments', label: 'Payments', icon: <CreditCard className="w-3.5 h-3.5" /> },
      ],
    },
    {
      category: 'Community & CMS',
      items: [
        { to: '/admin/staff', label: 'Staff', icon: <Shield className="w-3.5 h-3.5" /> },
        { to: '/admin/partnerships', label: 'Partnerships', icon: <Handshake className="w-3.5 h-3.5" /> },
        { to: '/admin/content', label: 'Content', icon: <FileEdit className="w-3.5 h-3.5" /> },
        { to: '/admin/announcements', label: 'Announcements', icon: <Megaphone className="w-3.5 h-3.5" /> },
      ],
    },
    {
      category: 'Infrastructure',
      items: [
        { to: '/admin/server', label: 'Server', icon: <Radio className="w-3.5 h-3.5" /> },
        { to: '/admin/settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
        { to: '/admin/audit-logs', label: 'Audit Logs', icon: <ScrollText className="w-3.5 h-3.5" /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#06020d] text-zinc-200 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-950/95 border-b md:border-b-0 md:border-r border-zinc-800/90 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Admin Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="Iron Cloud MC"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight font-mono">
                  IRON CLOUD MC
                </div>
                <div className="text-[10px] text-purple-400 font-mono">ADMIN CONTROL</div>
              </div>
            </div>
            <Link
              to="/"
              className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white"
              title="Return to Public Site"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 custom-scrollbar">
            {navGroups.map((group) => (
              <div key={group.category} className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 py-0.5 font-bold">
                  {group.category}
                </div>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#7b2cbf] text-white shadow-sm shadow-purple-950/60 font-semibold'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-900/60 flex items-center justify-center text-xs font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div className="truncate max-w-[110px]">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-emerald-400 font-mono">Staff Online</div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
