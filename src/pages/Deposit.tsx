import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ArrowDownToLine, Info, CheckCircle, ChevronDown, Download } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const QUICK = [1000, 2000, 5000, 10000];
const fmt = (n: number) => '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
const fmtAcct = (num: string) => num.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const h = d.getHours(), m = d.getMinutes().toString().padStart(2, '0');
  return `${date}, ${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
};

interface Tx { _id: string; description: string; amount: number; createdAt: string; }

const Deposit = () => {
  const { user, setBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [recent, setRecent] = useState<Tx[]>([]);

  const balance = user?.balance ?? 0;
  const acctNum = user?.accountNumber ?? '';

  useEffect(() => {
    api.get('/transactions/deposits').then((r) => setRecent(r.data.deposits ?? [])).catch(() => {});
  }, []);

  const handleQuick = (val: number) => setAmount((p) => String((parseFloat(p) || 0) + val));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/account/deposit', { amount: Number(amount), paymentMethod: method, description });
      setBalance(data.newBalance);
      setSuccess(`Deposit of ${fmt(Number(amount))} successful!`);
      setAmount(''); setMethod(''); setDescription('');
      // refresh recent deposits
      const r = await api.get('/transactions/deposits');
      setRecent(r.data.deposits ?? []);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Balance card */}
      <div className="rounded-xl p-5 flex items-center justify-between" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
        <div>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#94a3b8' }}>Current Balance</p>
          <p className="text-2xl font-bold text-white">{fmt(balance)}</p>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Account Number: {fmtAcct(acctNum)}</p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ backgroundColor: 'rgba(37,99,235,0.15)' }}>
          <Wallet size={24} style={{ color: '#2563eb' }} />
        </div>
      </div>

      {success && (
        <div className="px-4 py-3 rounded-lg text-sm flex items-center gap-2"
          style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm"
          style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="rounded-xl p-6" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
          <h3 className="text-base font-semibold text-white mb-1">Make a Deposit</h3>
          <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>Add money to your account securely.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Amount</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#475569' }}>₹</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" required min="1"
                  className="w-full pl-8 pr-4 py-3 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>Quick Amounts</p>
              <div className="flex gap-2 flex-wrap">
                {QUICK.map((v) => (
                  <button key={v} type="button" onClick={() => handleQuick(v)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                    style={{ border: '1px solid #2563eb', color: '#60a5fa', backgroundColor: 'rgba(37,99,235,0.1)' }}>
                    +₹{v.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Payment Method</label>
              <div className="relative">
                <select value={method} onChange={(e) => setMethod(e.target.value)} required
                  className="w-full pl-4 pr-10 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
                  style={{ backgroundColor: '#111827', border: '1px solid #1e293b', color: method ? '#ffffff' : '#475569' }}>
                  <option value="" disabled>Select Payment Method</option>
                  <option value="UPI">UPI</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Debit Card">Debit / Credit Card</option>
                  <option value="NEFT">NEFT / RTGS</option>
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>
                Description <span style={{ color: '#475569' }}>(Optional)</span>
              </label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note..." rows={3}
                className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: '#2563eb' }}>
              <Download size={16} /> {loading ? 'Processing...' : 'Deposit Now'}
            </button>
          </form>
        </div>

        {/* Right */}
        <div className="space-y-5">
          <div className="rounded-xl p-5" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
            <div className="flex items-center gap-2 mb-4">
              <Info size={18} style={{ color: '#2563eb' }} />
              <h3 className="text-base font-semibold text-white">Deposit Information</h3>
            </div>
            <ul className="space-y-3">
              {['Instant credit to your account', 'Secure & encrypted transactions', '24/7 availability', 'No hidden charges'].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#cbd5e1' }}>
                  <CheckCircle size={15} style={{ color: '#10b981', flexShrink: 0 }} /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl p-5" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Recent Deposits</h3>
              <Link to="/transactions" className="text-xs font-medium" style={{ color: '#2563eb' }}>View All</Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#475569' }}>No deposits yet.</p>
            ) : (
              <ul className="space-y-3">
                {recent.map((d) => (
                  <li key={d._id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                      <ArrowDownToLine size={15} style={{ color: '#10b981' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{d.description}</p>
                      <p className="text-xs" style={{ color: '#475569' }}>{fmtDate(d.createdAt)}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: '#10b981' }}>+{fmt(d.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid #1e293b' }}>
              <Link to="/transactions" className="text-sm font-medium flex justify-center" style={{ color: '#2563eb' }}>View All Transactions →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
