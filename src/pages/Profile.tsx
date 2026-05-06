import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Calendar, MapPin, CreditCard, Shield, Lock,
  Monitor, Briefcase, IndianRupee, Clock, CheckCircle, Edit, Smartphone,
} from 'lucide-react';
import api from '../services/api';

interface ProfileData {
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  panNumber?: string;
  kycStatus: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  memberSince: string;
  lastLogin?: string;
  passwordChangedAt?: string;
  lastDevice?: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
}

const fmtAcct = (num: string) => num.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const h = d.getHours(), m = d.getMinutes().toString().padStart(2, '0');
  return `${date}, ${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
};
const fmtDateShort = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid #1e293b' }}>
    <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5" style={{ backgroundColor: '#111827' }}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs mb-0.5" style={{ color: '#475569' }}>{label}</p>
      <div className="text-sm font-medium text-white">{value || <span style={{ color: '#475569' }}>—</span>}</div>
    </div>
  </div>
);

const SecurityRow = ({ icon, label, sub, action, green }: {
  icon: React.ReactNode; label: string; sub: string; action: string; green?: boolean;
}) => (
  <div className="flex items-center gap-3 py-3.5" style={{ borderBottom: '1px solid #1e293b' }}>
    <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: '#111827' }}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="text-xs" style={{ color: '#475569' }}>{sub}</p>
    </div>
    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all hover:opacity-80"
      style={green
        ? { backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
        : { border: '1px solid #2563eb', color: '#60a5fa', backgroundColor: 'rgba(37,99,235,0.1)' }}>
      {action}
    </button>
  </div>
);

const SummaryCard = ({ icon, label, value, valueColor }: {
  icon: React.ReactNode; label: string; value: string; valueColor?: string;
}) => (
  <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }}>
    <div className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: '#0d1526' }}>
      {icon}
    </div>
    <div>
      <p className="text-xs" style={{ color: '#475569' }}>{label}</p>
      <p className="text-sm font-semibold mt-0.5" style={{ color: valueColor ?? '#ffffff' }}>{value}</p>
    </div>
  </div>
);

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/profile')
      .then((r) => setProfile(r.data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: '#475569' }}>Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top card */}
      <div className="rounded-xl p-6" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold text-white flex-shrink-0"
              style={{ backgroundColor: '#2563eb' }}>
              {initials(profile.fullName)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white">{profile.fullName}</h2>
                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                    <CheckCircle size={11} /> Verified
                  </span>
                )}
              </div>
              <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Account Holder</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div>
                  <p className="text-xs" style={{ color: '#475569' }}>Account Number</p>
                  <p className="text-sm font-medium text-white">{fmtAcct(profile.accountNumber)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#475569' }}>Account Type</p>
                  <p className="text-sm font-medium text-white">{profile.accountType}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#475569' }}>Member Since</p>
                  <p className="text-sm font-medium text-white">{fmtDateShort(profile.memberSince)}</p>
                </div>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 flex-shrink-0"
            style={{ border: '1px solid #1e293b', color: '#94a3b8' }}>
            <Edit size={15} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="rounded-xl p-6" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
          <h3 className="text-base font-semibold text-white mb-2">Personal Information</h3>
          <InfoRow icon={<User size={15} style={{ color: '#60a5fa' }} />} label="Full Name" value={profile.fullName} />
          <InfoRow icon={<Mail size={15} style={{ color: '#60a5fa' }} />} label="Email Address" value={profile.email} />
          <InfoRow icon={<Phone size={15} style={{ color: '#60a5fa' }} />} label="Phone Number" value={profile.phone} />
          <InfoRow icon={<Calendar size={15} style={{ color: '#60a5fa' }} />} label="Date of Birth" value={profile.dateOfBirth} />
          <InfoRow icon={<MapPin size={15} style={{ color: '#60a5fa' }} />} label="Address" value={profile.address} />
          <InfoRow icon={<CreditCard size={15} style={{ color: '#60a5fa' }} />} label="PAN Number" value={profile.panNumber} />
          <div className="flex items-center gap-3 pt-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: '#111827' }}>
              <Shield size={15} style={{ color: '#60a5fa' }} />
            </div>
            <div className="flex-1">
              <p className="text-xs mb-0.5" style={{ color: '#475569' }}>KYC Status</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                <CheckCircle size={11} /> {profile.kycStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl p-6" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
          <h3 className="text-base font-semibold text-white mb-2">Security Information</h3>
          <SecurityRow icon={<Lock size={15} style={{ color: '#60a5fa' }} />} label="Login Password"
            sub={profile.passwordChangedAt ? `Last changed on ${fmtDateShort(profile.passwordChangedAt)}` : 'Never changed'}
            action="Change" />
          <SecurityRow icon={<Smartphone size={15} style={{ color: '#60a5fa' }} />} label="Transaction PIN"
            sub={profile.passwordChangedAt ? `Last changed on ${fmtDateShort(profile.passwordChangedAt)}` : 'Never set'}
            action="Change" />
          <SecurityRow icon={<Monitor size={15} style={{ color: '#60a5fa' }} />} label="Registered Device"
            sub={profile.lastDevice ?? 'Unknown device'} action="Manage" />
          <div className="flex items-center gap-3 pt-3.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: '#111827' }}>
              <Shield size={15} style={{ color: '#60a5fa' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
              <p className="text-xs" style={{ color: '#475569' }}>
                {profile.twoFactorEnabled ? 'Enabled for extra security' : 'Currently disabled'}
              </p>
            </div>
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
              style={profile.twoFactorEnabled
                ? { backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
                : { backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="rounded-xl p-6" style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b' }}>
        <h3 className="text-base font-semibold text-white mb-4">Account Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard icon={<Briefcase size={18} style={{ color: '#60a5fa' }} />} label="Account Type" value={profile.accountType} />
          <SummaryCard icon={<IndianRupee size={18} style={{ color: '#10b981' }} />} label="Current Balance"
            value={'₹ ' + profile.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} valueColor="#10b981" />
          <SummaryCard icon={<Calendar size={18} style={{ color: '#a78bfa' }} />} label="Last Login"
            value={profile.lastLogin ? fmtDate(profile.lastLogin) : '—'} />
          <SummaryCard icon={<Clock size={18} style={{ color: '#10b981' }} />} label="Account Status"
            value="Active" valueColor="#10b981" />
        </div>
      </div>
    </div>
  );
};

export default Profile;
