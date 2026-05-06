import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, Calendar, ChevronDown, Filter, ArrowLeftRight, ArrowDownToLine,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const fmt = (n: number) => {
  const abs = Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  return (n < 0 ? '-' : '+') + '₹ ' + abs;
};
const fmtAcct = (num: string) => num.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const h = d.getHours(), m = d.getMinutes().toString().padStart(2, '0');
  return `${date}, ${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
};

interface Tx {
  _id: string;
  type: 'credit' | 'debit';
  category: string;
  description: string;
  amount: number;
  balanceAfter: number;
  beneficiaryBank?: string;
  paymentMethod?: string;
  createdAt: string;
}

const Transactions = () => {
  const { user } = useAuth();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('all');
  const [pendingType, setPendingType] = useState('all');
  const [loading, setLoading] = useState(true);

  const balance = user?.balance ?? 0;
  const acctNum = user?.accountNumber ?? '';

  const load = useCallback(async (page: number, type: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (type !== 'all') params.set('type', type);
      const r = await api.get(`/transactions?${params}`);
      setTxs(r.data.transactions);
      setTotalPages(r.data.totalPages);
      setTotalCount(r.data.totalCount);
    } catch { /* handled by interceptor */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(currentPage, typeFilter); }, [currentPage, typeFilter]);

  const handleFilter = () => {
    setCurrentPage(1);
    setTypeFilter(pendingType);
  };

  const subDesc = (tx: Tx) => {
    if (tx.category === 'deposit') return tx.paymentMethod || 'UPI/Net Banking';
    if (tx.category === 'atm' || tx.category === 'withdrawal') return tx.paymentMethod || 'ATM/Cash';
    return tx.beneficiaryBank || '';
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="rounded-xl p-5 flex items-center justify-between" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
        <div>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#94a3b8' }}>Current Balance</p>
          <p className="text-2xl font-bold text-white">₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Account Number: {fmtAcct(acctNum)}</p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ backgroundColor: 'rgba(37,99,235,0.15)' }}>
          <Wallet size={24} style={{ color: '#2563eb' }} />
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-5" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Date Range</label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
              <button className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm text-left transition-all"
                style={{ backgroundColor: '#111827', border: '1px solid #1e293b', color: '#cbd5e1' }}>
                All Time
              </button>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
            </div>
          </div>
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Transaction Type</label>
            <div className="relative">
              <select value={pendingType} onChange={(e) => setPendingType(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-lg text-sm appearance-none outline-none transition-all"
                style={{ backgroundColor: '#111827', border: '1px solid #1e293b', color: '#cbd5e1' }}>
                <option value="all">All Transactions</option>
                <option value="credit">Credit Only</option>
                <option value="debit">Debit Only</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
            </div>
          </div>
          <button onClick={handleFilter}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#2563eb' }}>
            <Filter size={15} /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1e293b' }}>
          <h3 className="text-base font-semibold text-white">Transaction History</h3>
          <span className="text-xs" style={{ color: '#475569' }}>{totalCount} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                {['Date & Time', 'Description', 'Type', 'Amount', 'Balance'].map((col) => (
                  <th key={col} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#475569', backgroundColor: '#111827' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: '#475569' }}>Loading...</td>
                </tr>
              ) : txs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: '#475569' }}>No transactions found.</td>
                </tr>
              ) : txs.map((tx, idx) => (
                <tr key={tx._id} style={{ borderBottom: idx < txs.length - 1 ? '1px solid #1e293b' : 'none' }}
                  className="transition-colors hover:bg-white hover:bg-opacity-3">
                  <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: '#94a3b8' }}>{fmtDate(tx.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tx.type === 'credit' ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)' }}>
                        {tx.type === 'credit'
                          ? <ArrowDownToLine size={15} style={{ color: '#10b981' }} />
                          : <ArrowLeftRight size={15} style={{ color: '#7c3aed' }} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{tx.description}</p>
                        <p className="text-xs" style={{ color: '#475569' }}>{subDesc(tx)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={tx.type === 'credit'
                        ? { backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }
                        : { backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                      {tx.type === 'credit' ? 'Credit' : 'Debit'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold whitespace-nowrap"
                    style={{ color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
                    {fmt(tx.type === 'credit' ? tx.amount : -tx.amount)}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-white whitespace-nowrap">
                    ₹ {tx.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid #1e293b' }}>
          <p className="text-xs" style={{ color: '#475569' }}>Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-white hover:bg-opacity-5 disabled:opacity-40"
              style={{ color: '#94a3b8', border: '1px solid #1e293b' }}>
              <ChevronLeft size={14} /> Previous
            </button>
            {pages.map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                style={currentPage === page
                  ? { backgroundColor: '#2563eb', color: '#ffffff' }
                  : { color: '#94a3b8', border: '1px solid #1e293b' }}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-white hover:bg-opacity-5 disabled:opacity-40"
              style={{ color: '#94a3b8', border: '1px solid #1e293b' }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
