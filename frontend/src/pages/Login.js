import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5, #f0fdfa)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  container: { width: '100%', maxWidth: '440px' },
  logoSection: { textAlign: 'center', marginBottom: '32px' },
  logoIcon: {
    width: '64px', height: '64px',
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    borderRadius: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '32px', margin: '0 auto 16px',
    boxShadow: '0 8px 25px rgba(5,150,105,0.35)',
  },
  logoTitle: { fontSize: '28px', fontWeight: '900', color: '#1e293b', margin: '0 0 6px 0' },
  logoSub: { color: '#64748b', fontSize: '14px', margin: 0 },
  card: {
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    border: '1px solid #f1f5f9',
  },
  roleTabs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0',
  },
  roleTab: (active, isAdmin) => ({
    padding: '18px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '14px',
    fontFamily: 'inherit',
    border: 'none',
    transition: 'all 0.3s',
    background: active
      ? (isAdmin ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : 'linear-gradient(135deg, #059669, #0891b2)')
      : '#f8fafc',
    color: active ? 'white' : '#94a3b8',
    borderBottom: active ? 'none' : '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }),
  cardBody: { padding: '28px' },
  errorBox: {
    background: '#fff1f2',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  roleInfoBox: (isAdmin) => ({
    background: isAdmin ? '#faf5ff' : '#f0fdf4',
    border: `1px solid ${isAdmin ? '#e9d5ff' : '#bbf7d0'}`,
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: isAdmin ? '#6d28d9' : '#166534',
  }),
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
  },
  inputWrap: { marginBottom: '20px' },
  input: {
    width: '100%',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '15px',
    color: '#1e293b',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
  },
  submitBtn: (isAdmin) => ({
    width: '100%',
    background: isAdmin
      ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
      : 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: isAdmin
      ? '0 6px 20px rgba(124,58,237,0.4)'
      : '0 6px 20px rgba(5,150,105,0.4)',
    transition: 'all 0.3s',
    marginBottom: '20px',
    fontFamily: 'inherit',
  }),
  linkRow: { textAlign: 'center', color: '#64748b', fontSize: '14px' },
  link: { color: '#059669', fontWeight: '700', textDecoration: 'none' },
  emergencyBox: {
    background: '#fff1f2',
    border: '1px solid #fca5a5',
    borderRadius: '14px',
    padding: '12px 16px',
    textAlign: 'center',
    marginTop: '16px',
    color: '#dc2626',
    fontSize: '13px',
    fontWeight: '600',
  },
  disclaimer: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '11px',
    marginTop: '16px',
  },
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('patient'); // 'patient' or 'admin'

  const isAdmin = role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login({ email, password });
      const userData = response.data.user;

      // Check if user role matches selected role tab
      if (isAdmin && userData.role !== 'admin') {
        setError('This account is not registered as an ASHA Worker. Please use the Patient login.');
        setLoading(false);
        return;
      }
      if (!isAdmin && userData.role === 'admin') {
        setError('This is an ASHA Worker account. Please use the ASHA Worker login tab.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Route based on role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const focusColor = isAdmin ? '#7c3aed' : '#059669';

  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={S.logoSection}>
          <div style={S.logoIcon}>🏥</div>
          <h1 style={S.logoTitle}>AroNexa</h1>
          <p style={S.logoSub}>AI-Assisted Smart Healthcare Platform</p>
        </div>

        <div style={S.card}>
          {/* Role Tabs */}
          <div style={S.roleTabs}>
            <button
              style={S.roleTab(role === 'patient', false)}
              onClick={() => { setRole('patient'); setError(''); }}
            >
              <span>🧑‍🤝‍🧑</span> Patient Login
            </button>
            <button
              style={S.roleTab(role === 'admin', true)}
              onClick={() => { setRole('admin'); setError(''); }}
            >
              <span>👩‍⚕️</span> ASHA Worker Login
            </button>
          </div>

          <div style={S.cardBody}>
            {/* Role Info */}
            <div style={S.roleInfoBox(isAdmin)}>
              <span style={{ fontSize: '20px' }}>{isAdmin ? '👩‍⚕️' : '🧑‍🤝‍🧑'}</span>
              <span>
                {isAdmin
                  ? 'Access patient records, community health insights, and healthcare tools'
                  : 'Access symptom checks, medical reports, hospitals, and your health profile'
                }
              </span>
            </div>

            {error && (
              <div style={S.errorBox}>⚠️ {error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={S.inputWrap}>
                <label style={S.label}>📧 Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={S.input}
                  placeholder="Enter your email"
                  required
                  onFocus={e => e.target.style.borderColor = focusColor}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={S.inputWrap}>
                <label style={S.label}>🔒 Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={S.input}
                  placeholder="Enter your password"
                  required
                  onFocus={e => e.target.style.borderColor = focusColor}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ ...S.submitBtn(isAdmin), opacity: loading ? 0.7 : 1 }}
              >
                {loading
                  ? '⏳ Logging in...'
                  : isAdmin ? '🔐 Continue as ASHA Worker' : '🚀 Continue as Patient'
                }
              </button>
            </form>

            <div style={S.linkRow}>
              Don't have an account?{' '}
              <Link to="/register" style={S.link}>Create Patient Account</Link>
            </div>
          </div>
        </div>

        <div style={S.emergencyBox}>
          🚨 Medical Emergency? Call <strong>108</strong>
        </div>
        <p style={S.disclaimer}>⚠️ AI-assisted information only. Always consut a qualified healthcare professional.</p>
      </div>
    </div>
  );
}

export default Login;