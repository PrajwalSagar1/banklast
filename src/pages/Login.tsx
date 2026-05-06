import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Navigate only after React state (isLoggedIn) has actually settled
  useEffect(() => {
    if (isLoggedIn) navigate('/dashboard', { replace: true });
  }, [isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.message || 'Invalid email or password.');
    }
    // navigation is handled by the useEffect above
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#0a0f1e' }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl px-8 py-10"
          style={{
            backgroundColor: '#0d1526',
            border: '1px solid #1e293b',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex flex-col items-center mb-8">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ backgroundColor: '#2563eb' }}
            >
              <Building2 size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
              Login to access your account
            </p>
          </div>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: '#111827', border: '1px solid #1e293b' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
                  style={{ color: '#475569' }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-500"
                />
                <span className="text-sm" style={{ color: '#94a3b8' }}>Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium" style={{ color: '#2563eb' }}>
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#2563eb' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: '#1e293b' }} />
              <span className="text-xs" style={{ color: '#475569' }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#1e293b' }} />
            </div>

            <p className="text-center text-sm" style={{ color: '#94a3b8' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-medium" style={{ color: '#2563eb' }}>
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
