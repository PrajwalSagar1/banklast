import { Menu, Bell, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/deposit': 'Deposit',
  '/withdraw': 'Withdraw',
  '/transfer': 'Transfer Money',
  '/transactions': 'Transaction History',
  '/profile': 'Profile',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const Header = ({ onMenuClick }: HeaderProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const title = pageTitles[location.pathname] ?? 'MyBank';
  const displayName = user?.fullName ?? 'User';
  const initials = getInitials(displayName);

  return (
    <header
      className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{
        backgroundColor: '#0d1526',
        borderBottom: '1px solid #1e293b',
        height: '64px',
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg transition-colors hover:bg-white hover:bg-opacity-5 lg:hidden"
          style={{ color: '#94a3b8' }}
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-white hover:bg-opacity-5"
          style={{ color: '#94a3b8' }}
        >
          <Bell size={20} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: '#ef4444' }}
          />
        </button>

        <button className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg transition-colors hover:bg-white hover:bg-opacity-5">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: '#2563eb' }}
          >
            {initials}
          </div>
          <span className="text-sm font-medium text-white hidden sm:block">{displayName}</span>
          <ChevronDown size={16} style={{ color: '#94a3b8' }} />
        </button>
      </div>
    </header>
  );
};

export default Header;
