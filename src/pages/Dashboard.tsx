import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const fmt = (n: number) => '₹ ' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const fmtAcct = (num: string) => num.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const h = d.getHours(), m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${date}, ${h % 12 || 12}:${m} ${ampm}`;
};

interface RecentTx {
  _id: string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  createdAt: string;
}

interface DashboardData {
  balance: number;
  accountNumber: string;
  accountType: string;
  totalCredited: number;
  totalDebited: number;
  recentTransactions: RecentTx[];
}

interface ChartPoint { date: string; balance: number; }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: '#1a2235', border: '1px solid #1e293b' }}>
        <p style={{ color: '#94a3b8' }}>{label}</p>
        <p className="font-semibold text-white">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, sub, icon, iconBg, subColor }: {
  title: string; value: string; sub: string; icon: React.ReactNode; iconBg: string; subColor: string;
}) => (
  <div className="rounded-xl p-5 flex items-center gap-4" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
    <div className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0" style={{ backgroundColor: iconBg }}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium mb-0.5" style={{ color: '#94a3b8' }}>{title}</p>
      <p className="text-lg font-bold text-white truncate">{value}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color: subColor }}>{sub}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, setBalance } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, chartRes] = await Promise.all([
          api.get('/account/dashboard'),
          api.get('/transactions/balance-overview'),
        ]);
        setData(dashRes.data);
        setChartData(chartRes.data.chartData ?? []);
        setBalance(dashRes.data.balance);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: '#475569' }}>Loading dashboard...</div>
      </div>
    );
  }

  const balance = data?.balance ?? user?.balance ?? 0;
  const acctNum = data?.accountNumber ?? user?.accountNumber ?? '';
  const firstName = user?.fullName?.split(' ')[0] ?? 'User';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white">Welcome back, {firstName}! 👋</h2>
        <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Here's an overview of your account.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Current Balance" value={fmt(balance)} sub="Available Balance"
          iconBg="rgba(37,99,235,0.15)" subColor="#60a5fa"
          icon={<Wallet size={22} style={{ color: '#2563eb' }} />}
        />
        <StatCard
          title="Total Deposits" value={fmt(data?.totalCredited ?? 0)} sub="This Month"
          iconBg="rgba(16,185,129,0.15)" subColor="#10b981"
          icon={<ArrowDownToLine size={22} style={{ color: '#10b981' }} />}
        />
        <StatCard
          title="Total Withdrawals" value={fmt(data?.totalDebited ?? 0)} sub="This Month"
          iconBg="rgba(239,68,68,0.15)" subColor="#ef4444"
          icon={<ArrowUpFromLine size={22} style={{ color: '#ef4444' }} />}
        />
        <StatCard
          title="Account Number" value={fmtAcct(acctNum)} sub="View Details"
          iconBg="rgba(124,58,237,0.15)" subColor="#a78bfa"
          icon={<CreditCard size={22} style={{ color: '#7c3aed' }} />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Balance Chart */}
        <div className="rounded-xl p-6" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-white">Balance Overview</h3>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: '#111827', border: '1px solid #1e293b', color: '#94a3b8' }}>
              This Month <ChevronDown size={14} />
            </button>
          </div>
          <div className="mb-1">
            <p className="text-2xl font-bold" style={{ color: '#60a5fa' }}>{fmt(balance)}</p>
            <p className="text-xs" style={{ color: '#475569' }}>Current Balance</p>
          </div>
          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={45} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2.5}
                  fill="url(#bg)" dot={false}
                  activeDot={{ r: 5, fill: '#2563eb', stroke: '#0d1526', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-around mt-4 pt-4" style={{ borderTop: '1px solid #1e293b' }}>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} style={{ color: '#10b981' }} />
              <div>
                <p className="text-xs font-semibold text-white">{fmt(data?.totalCredited ?? 0)}</p>
                <p className="text-xs" style={{ color: '#10b981' }}>Total Credited</p>
              </div>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: '#1e293b' }} />
            <div className="flex items-center gap-2">
              <TrendingDown size={16} style={{ color: '#ef4444' }} />
              <div>
                <p className="text-xs font-semibold text-white">{fmt(data?.totalDebited ?? 0)}</p>
                <p className="text-xs" style={{ color: '#ef4444' }}>Total Debited</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl p-6" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-white">Recent Transactions</h3>
            <Link to="/transactions" className="text-xs font-medium" style={{ color: '#2563eb' }}>View All</Link>
          </div>
          {data?.recentTransactions.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#475569' }}>No transactions yet.</p>
          ) : (
            <ul className="space-y-4">
              {(data?.recentTransactions ?? []).map((tx) => (
                <li key={tx._id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tx.type === 'credit' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                    {tx.type === 'credit'
                      ? <ArrowDownToLine size={16} style={{ color: '#10b981' }} />
                      : <ArrowUpFromLine size={16} style={{ color: '#ef4444' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                    <p className="text-xs" style={{ color: '#475569' }}>{fmtDate(tx.createdAt)}</p>
                  </div>
                  <span className="text-sm font-semibold flex-shrink-0"
                    style={{ color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
                    {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid #1e293b' }}>
            <Link to="/transactions" className="text-sm font-medium flex items-center justify-center" style={{ color: '#2563eb' }}>
              View All Transactions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
