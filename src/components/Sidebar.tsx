import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  History,
  User,
  LogOut,
  Building2,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/deposit', label: 'Deposit', icon: ArrowDownToLine },
  { to: '/withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
  { to: '/transfer', label: 'Transfer', icon: ArrowLeftRight },
  { to: '/transactions', label: 'Transaction History', icon: History },
  { to: '/profile', label: 'Profile', icon: User },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: '240px', backgroundColor: '#0d1526', borderRight: '1px solid #1e293b' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6" style={{ borderBottom: '1px solid #1e293b' }}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ backgroundColor: '#2563eb' }}>
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">MyBank</div>
            <div className="text-xs leading-tight" style={{ color: '#64748b' }}>Secure. Simple. Reliable.</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-3" style={{ color: '#475569' }}>
            Main Menu
          </p>
          <ul className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white hover:bg-opacity-5'
                    }`
                  }
                  style={({ isActive }) =>
                    isActive ? { backgroundColor: '#2563eb' } : {}
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #1e293b' }}>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition-all duration-150 text-slate-400 hover:text-white hover:bg-red-500 hover:bg-opacity-10 hover:text-red-400"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Bottom support */}
        <div className="px-3 pb-4">
          <div
            className="flex items-center gap-3 px-3 py-3 rounded-lg"
            style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
              style={{ backgroundColor: '#1e3a5f' }}
            >
              <Headphones size={16} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <p className="text-xs font-medium text-white">Need Help?</p>
              <p className="text-xs" style={{ color: '#60a5fa' }}>Contact Support</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
