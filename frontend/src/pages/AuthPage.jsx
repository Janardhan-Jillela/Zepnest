import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { register as registerApi, login as loginApi } from '../api/auth';
import { Eye, EyeOff, Mail, Lock, User, Phone, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

const ROLES = [
  { value: 'customer', label: '🏠 Customer', desc: 'Book home services' },
  { value: 'service_provider', label: '🔧 Service Provider', desc: 'Fulfil service requests' },
];

const defaultForm = { fullName: '', email: '', phoneNumber: '', password: '', role: 'customer' };

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(defaultForm);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (tab === 'register') {
        res = await registerApi({
          fullName: form.fullName,
          email: form.email,
          phoneNumber: form.phoneNumber || undefined,
          password: form.password,
          role: form.role,
        });
        toast.success('Account created! Welcome to Zepnest 🎉');
      } else {
        res = await loginApi({ email: form.email, password: form.password });
        const userName = res.data.data.user.fullName || res.data.data.user.name;
        toast.success(`Welcome back, ${userName}!`);
      }
      const { token, user } = res.data.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) {
        setError(apiErrors.map((e) => e.msg).join(' • '));
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setError('');
    setForm(defaultForm);
  };

  const inputIcon = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)', pointerEvents: 'none' };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="navbar-logo">Z</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Zepnest</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Home Care, At a Tap</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')} id="login-tab">
            Sign In
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')} id="register-tab">
            Create Account
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <span>⚠</span> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} id="auth-form">

          {/* REGISTER ONLY: Full Name */}
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={inputIcon} />
                <input id="fullName-input" name="fullName" type="text" className="form-input"
                  placeholder="Jane Doe" value={form.fullName} onChange={handleChange}
                  style={{ paddingLeft: '40px' }} autoComplete="name" required />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={inputIcon} />
              <input id="email-input" name="email" type="email" className="form-input"
                placeholder="you@example.com" value={form.email} onChange={handleChange}
                style={{ paddingLeft: '40px' }} autoComplete="email" required />
            </div>
          </div>

          {/* REGISTER ONLY: Phone */}
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Phone Number <span style={{ color: 'var(--color-text-dim)' }}>(optional)</span></label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={inputIcon} />
                <input id="phone-input" name="phoneNumber" type="tel" className="form-input"
                  placeholder="+91 98765 43210" value={form.phoneNumber} onChange={handleChange}
                  style={{ paddingLeft: '40px' }} autoComplete="tel" />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={inputIcon} />
              <input id="password-input" name="password" type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder={tab === 'register' ? 'Min 8 chars, 1 uppercase, 1 number' : 'Your password'}
                value={form.password} onChange={handleChange}
                style={{ paddingLeft: '40px', paddingRight: '44px' }}
                autoComplete={tab === 'register' ? 'new-password' : 'current-password'} required />
              <button type="button" onClick={() => setShowPw(!showPw)} id="toggle-password-btn"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {tab === 'register' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                Must be 8+ chars with at least one uppercase letter and one number.
              </span>
            )}
          </div>

          {/* REGISTER ONLY: Role selector */}
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">
                <Shield size={13} style={{ display: 'inline', marginRight: 4 }} />
                I am a… *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {ROLES.map(({ value, label, desc }) => (
                  <button key={value} type="button" id={`role-${value}`}
                    onClick={() => setForm((f) => ({ ...f, role: value }))}
                    style={{
                      padding: '12px', textAlign: 'left',
                      background: form.role === value ? 'rgba(59,130,246,0.15)' : 'var(--color-bg-2)',
                      border: `2px solid ${form.role === value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: form.role === value ? 'var(--color-primary)' : 'var(--color-text)' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginTop: '2px' }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}
            id="auth-submit-btn" style={{ marginTop: '8px', padding: '14px' }}>
            {loading ? <Loader size="sm" /> : null}
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}
            id="switch-auth-btn">
            {tab === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
