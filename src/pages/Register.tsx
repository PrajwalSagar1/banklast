import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, Eye, EyeOff, CreditCard, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ name: string; accountNumber: string } | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSuccess({
        name: data.user.fullName,
        accountNumber: data.user.accountNumber,
      });
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0a0f1e' }}>
        <div className="rounded-2xl px-8 py-10 text-center max-w-md w-full"
          style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4"
            style={{ backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid #10b981' }}>
            <CheckCircle size={32} style={{ color: '#10b981' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-sm mb-1" style={{ color: '#94a3b8' }}>
            Welcome, <span className="text-white font-medium">{success.name}</span>!
          </p>
          <p className="text-xs mb-1" style={{ color: '#475569' }}>Your account number:</p>
          <p className="text-base font-bold mb-6" style={{ color: '#60a5fa' }}>
            {success.accountNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#2563eb' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#0a0f1e' }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl px-8 py-10"
          style={{ backgroundColor: '#0d1526', border: '1px solid #1e293b', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ backgroundColor: '#2563eb' }}>
              <Building2 size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Fill in the details below to get started.</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Full Name</label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                  placeholder="Enter your full name" required
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Email Address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="Enter your email" required
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="Create a password" required minLength={6}
                  className="w-full pl-10 pr-10 py-3 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-white" style={{ color: '#475569' }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Confirm Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  placeholder="Confirm your password" required
                  className="w-full pl-10 pr-10 py-3 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-white" style={{ color: '#475569' }}>
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Account Number (auto-generated) */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Account Number</label>
              <div className="relative">
                <CreditCard size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#334155' }} />
                <input type="text" disabled placeholder="Account number will be generated automatically"
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm placeholder-slate-600 cursor-not-allowed"
                  style={{ backgroundColor: '#0a0f1e', border: '1px solid #1e293b', color: '#475569' }} />
              </div>
              <p className="text-xs mt-1.5" style={{ color: '#475569' }}>
                A unique 12-digit account number will be assigned to you.
              </p>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required
                className="w-4 h-4 rounded mt-0.5 accent-blue-500 flex-shrink-0" />
              <span className="text-sm" style={{ color: '#94a3b8' }}>
                I agree to the{' '}
                <a href="#" style={{ color: '#2563eb' }}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" style={{ color: '#2563eb' }}>Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: '#2563eb' }}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: '#1e293b' }} />
              <span className="text-xs" style={{ color: '#475569' }}>OR</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#1e293b' }} />
            </div>

            <p className="text-center text-sm" style={{ color: '#94a3b8' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-medium" style={{ color: '#2563eb' }}>Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
