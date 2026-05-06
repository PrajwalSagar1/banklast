import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, ChevronDown, ChevronRight,
  MessageSquare, Send, CheckCircle, User, Plus, X, Trash2, Building,
  CreditCard, Hash,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const QUICK = [1000, 2000, 5000, 10000];
const fmt = (n: number) => '₹ ' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const fmtAcct = (num: string) => num.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const h = d.getHours(), m = d.getMinutes().toString().padStart(2, '0');
  return `${date}, ${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
};

const COLORS = ['#7c3aed', '#10b981', '#f97316', '#2563eb', '#ec4899', '#0891b2'];
const colorFor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];
const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

interface Beneficiary {
  _id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode?: string;
}
interface Transfer { _id: string; type: 'credit' | 'debit'; description: string; amount: number; createdAt: string; }

const emptyForm = { name: '', accountNumber: '', bankName: '', ifscCode: '' };

const Transfer = () => {
  const { user, setBalance } = useAuth();

  // Transfer form
  const [selectedId, setSelectedId] = useState('');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Data
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<Transfer[]>([]);

  // Add beneficiary modal
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState(emptyForm);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const balance = user?.balance ?? 0;
  const acctNum = user?.accountNumber ?? '';

  const loadBeneficiaries = async () => {
    try {
      const r = await api.get('/beneficiaries');
      setBeneficiaries(r.data.beneficiaries ?? []);
    } catch { /* handled by interceptor */ }
  };

  const loadRecentTransfers = async () => {
    try {
      const r = await api.get('/transactions/transfers');
      setRecentTransfers(r.data.recentTransfers ?? []);
    } catch { /* handled by interceptor */ }
  };

  useEffect(() => {
    loadBeneficiaries();
    loadRecentTransfers();
  }, []);

  const selectedBeneficiary = beneficiaries.find((b) => b._id === selectedId);

  const handleQuick = (val: number) => setAmount((p) => String((parseFloat(p) || 0) + val));

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiary) { setError('Please select a beneficiary'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/account/transfer', {
        beneficiaryAccount: selectedBeneficiary.accountNumber,
        beneficiaryName: selectedBeneficiary.name,
        beneficiaryBank: selectedBeneficiary.bankName,
        amount: Number(amount),
        remarks,
      });
      setBalance(data.newBalance);
      setSuccess(`₹ ${Number(amount).toLocaleString('en-IN')} transferred to ${selectedBeneficiary.name} successfully!`);
      setAmount(''); setRemarks(''); setSelectedId('');
      await loadRecentTransfers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(''); setModalLoading(true);
    try {
      await api.post('/beneficiaries', modalForm);
      setShowModal(false);
      setModalForm(emptyForm);
      await loadBeneficiaries();
    } catch (err: unknown) {
      setModalError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to add beneficiary'
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/beneficiaries/${id}`);
      if (selectedId === id) setSelectedId('');
      await loadBeneficiaries();
    } catch { /* handled by interceptor */ }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalForm(emptyForm);
    setModalError('');
  };

  return (
    <>
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
          {/* Transfer form */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
            <h3 className="text-base font-semibold text-white mb-1">Transfer Money</h3>
            <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>Send money securely to any account.</p>
            <form onSubmit={handleTransfer} className="space-y-5">
              {/* Beneficiary select */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Beneficiary</label>
                <div className="relative">
                  <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                  <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required
                    className="w-full pl-10 pr-10 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
                    style={{ backgroundColor: '#111827', border: '1px solid #1e293b', color: selectedId ? '#ffffff' : '#475569' }}>
                    <option value="" disabled>Select beneficiary</option>
                    {beneficiaries.map((b) => (
                      <option key={b._id} value={b._id}>{b.name} — {b.bankName}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
                </div>
                <button type="button" onClick={() => setShowModal(true)}
                  className="flex items-center gap-1 text-xs mt-1.5 font-medium transition-opacity hover:opacity-80"
                  style={{ color: '#2563eb' }}>
                  <Plus size={13} /> Add New Beneficiary
                </button>
              </div>

              {/* Amount */}
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

              {/* Quick amounts */}
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

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>
                  Remarks <span style={{ color: '#475569' }}>(Optional)</span>
                </label>
                <div className="relative">
                  <MessageSquare size={15} className="absolute left-3.5 top-3.5" style={{ color: '#475569' }} />
                  <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks..." rows={3}
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                    style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                style={{ backgroundColor: '#2563eb' }}>
                <Send size={16} /> {loading ? 'Processing...' : 'Transfer Now'}
              </button>
            </form>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Beneficiaries card */}
            <div className="rounded-xl p-5" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">Your Beneficiaries</h3>
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: '#2563eb' }}>
                  <Plus size={13} /> Add New
                </button>
              </div>

              {beneficiaries.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm mb-3" style={{ color: '#475569' }}>No beneficiaries yet.</p>
                  <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium mx-auto transition-all hover:opacity-80"
                    style={{ backgroundColor: 'rgba(37,99,235,0.1)', border: '1px solid #2563eb', color: '#60a5fa' }}>
                    <Plus size={15} /> Add Your First Beneficiary
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {beneficiaries.map((b) => (
                    <li key={b._id}
                      onClick={() => setSelectedId(b._id)}
                      className="group flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all"
                      style={{
                        backgroundColor: selectedId === b._id ? 'rgba(37,99,235,0.15)' : 'transparent',
                        border: selectedId === b._id ? '1px solid rgba(37,99,235,0.4)' : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => { if (selectedId !== b._id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={(e) => { if (selectedId !== b._id) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <div className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 text-xs font-bold text-white"
                        style={{ backgroundColor: colorFor(b.name) }}>
                        {initials(b.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{b.name}</p>
                        <p className="text-xs" style={{ color: '#475569' }}>
                          {b.bankName} .... {b.accountNumber.slice(-4)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDelete(b._id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-500 hover:bg-opacity-20"
                          style={{ color: '#ef4444' }}
                          title="Remove beneficiary">
                          <Trash2 size={14} />
                        </button>
                        <ChevronRight size={16} style={{ color: selectedId === b._id ? '#60a5fa' : '#475569' }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Transfers */}
            <div className="rounded-xl p-5" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">Recent Transfers</h3>
                <Link to="/transactions" className="text-xs font-medium" style={{ color: '#2563eb' }}>View All</Link>
              </div>
              {recentTransfers.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#475569' }}>No transfers yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentTransfers.map((t) => (
                    <li key={t._id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
                        style={{ backgroundColor: t.type === 'debit' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)' }}>
                        {t.type === 'debit'
                          ? <ArrowUpFromLine size={15} style={{ color: '#ef4444' }} />
                          : <ArrowDownToLine size={15} style={{ color: '#10b981' }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{t.description}</p>
                        <p className="text-xs" style={{ color: '#475569' }}>{fmtDate(t.createdAt)}</p>
                      </div>
                      <span className="text-sm font-semibold flex-shrink-0"
                        style={{ color: t.type === 'debit' ? '#ef4444' : '#10b981' }}>
                        {t.type === 'debit' ? '-' : '+'}{fmt(t.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid #1e293b' }}>
                <Link to="/transactions" className="text-sm font-medium flex justify-center" style={{ color: '#2563eb' }}>
                  View All Transactions →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Beneficiary Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="rounded-2xl w-full max-w-md"
            style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #1e293b' }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ backgroundColor: 'rgba(37,99,235,0.15)' }}>
                  <Plus size={18} style={{ color: '#2563eb' }} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Add New Beneficiary</h3>
                  <p className="text-xs" style={{ color: '#475569' }}>Save an account to send money quickly</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg transition-colors hover:bg-white hover:bg-opacity-10"
                style={{ color: '#475569' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleAddBeneficiary} className="px-6 py-5 space-y-4">
              {modalError && (
                <div className="px-4 py-3 rounded-lg text-sm"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                  {modalError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                  <input type="text" value={modalForm.name}
                    onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    placeholder="e.g. Ravi Shankar" required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }} />
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Account Number</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                  <input type="text" value={modalForm.accountNumber}
                    onChange={(e) => setModalForm({ ...modalForm, accountNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="12-digit account number" required maxLength={12}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }} />
                </div>
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Bank Name</label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                  <select value={modalForm.bankName}
                    onChange={(e) => setModalForm({ ...modalForm, bankName: e.target.value })} required
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ backgroundColor: '#111827', border: '1px solid #1e293b', color: modalForm.bankName ? '#ffffff' : '#475569' }}>
                    <option value="" disabled>Select bank</option>
                    {['HDFC Bank', 'ICICI Bank', 'SBI Bank', 'Axis Bank', 'Kotak Bank',
                      'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'IndusInd Bank', 'Yes Bank', 'MyBank'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
                </div>
              </div>

              {/* IFSC Code */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>
                  IFSC Code <span style={{ color: '#475569' }}>(Optional)</span>
                </label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                  <input type="text" value={modalForm.ifscCode}
                    onChange={(e) => setModalForm({ ...modalForm, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0001234"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-5"
                  style={{ border: '1px solid #1e293b', color: '#94a3b8' }}>
                  Cancel
                </button>
                <button type="submit" disabled={modalLoading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#2563eb' }}>
                  {modalLoading ? 'Saving...' : 'Add Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Transfer;
