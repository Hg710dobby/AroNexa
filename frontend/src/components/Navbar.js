import React, { useState,useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const S = {
  nav: {
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
  },
  logoIcon: {
    width: '38px', height: '38px',
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px',
    boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
  },
  logoText: { fontSize: '20px', fontWeight: '800', color: '#1e293b' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '4px' },
  navLink: (active) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 12px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: active ? '700' : '500',
    color: active ? '#059669' : '#64748b',
    background: active ? '#f0fdf4' : 'transparent',
    transition: 'all 0.2s',
    border: active ? '1px solid #bbf7d0' : '1px solid transparent',
  }),
  adminNavLink: (active) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 12px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: active ? '700' : '500',
    color: active ? '#7c3aed' : '#64748b',
    background: active ? '#faf5ff' : 'transparent',
    transition: 'all 0.2s',
    border: active ? '1px solid #e9d5ff' : '1px solid transparent',
  }),
  rightSection: { display: 'flex', alignItems: 'center', gap: '10px' },
  userBadge: (isAdmin) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    background: isAdmin ? '#faf5ff' : '#f0fdf4',
    border: `1px solid ${isAdmin ? '#e9d5ff' : '#bbf7d0'}`,
    padding: '6px 14px',
    borderRadius: '999px',
  }),
  userAvatar: (isAdmin) => ({
    width: '26px', height: '26px',
    background: isAdmin
      ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
      : 'linear-gradient(135deg, #059669, #0891b2)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: '12px', fontWeight: '800',
  }),
  userName: (isAdmin) => ({
    color: isAdmin ? '#6d28d9' : '#166534',
    fontSize: '13px', fontWeight: '600',
  }),
  roleBadge: (isAdmin) => ({
    background: isAdmin ? '#7c3aed' : '#059669',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '9px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }),
  emergencyBtn: {
    background: '#dc2626',
    color: 'white',
    padding: '7px 14px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '7px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
};

const patientLinks = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/symptom-checker', icon: '🩺', label: 'Symptoms' },
  { path: '/hospitals', icon: '🏨', label: 'Hospitals' },
  { path: '/reports', icon: '📄', label: 'Reports' },
  { path: '/history', icon: '📋', label: 'History' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

const adminLinks = [
  { path: '/admin', icon: '📊', label: 'Dashboard' },
  { path: '/symptom-checker', icon: '🩺', label: 'Triage' },
  { path: '/hospitals', icon: '🏨', label: 'Hospitals' },
  { path: '/reports', icon: '📄', label: 'Reports' },
  { path: '/history', icon: '📋', label: 'History' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 900);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  const isAdmin = user?.role === 'admin';
  const navLinks = isAdmin ? adminLinks : patientLinks;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        {/* Logo */}
        <Link to={isAdmin ? '/admin' : '/dashboard'} style={S.logo}>
          <div style={S.logoIcon}>🏥</div>
          <span style={S.logoText}>
            AroNexa
          </span>
        </Link>

        {/* Nav Links - Desktop */}
        <div style={{ ...S.navLinks,display: isMobile ? 'none' : 'flex'  }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={isAdmin
                ? S.adminNavLink(location.pathname === link.path)
                : S.navLink(location.pathname === link.path)
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right */}
        <div style={S.rightSection}>
          <div style={S.userBadge(isAdmin)}>
            <div style={S.userAvatar(isAdmin)}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <span style={S.userName(isAdmin)}>
              {user?.full_name?.split(' ')[0] || 'User'}
            </span>
            <span style={S.roleBadge(isAdmin)}>
              {isAdmin ? 'ASHA' : 'Patient'}
            </span>
          </div>

          <a href="tel:108" style={S.emergencyBtn}>
            🚨 108
          </a>

          <button onClick={handleLogout} style={S.logoutBtn}>
            ↩ Logout
          </button>
          {isMobile && (
  <button
    onClick={() => setMobileOpen(!mobileOpen)}
    style={S.logoutBtn}
  >
    ☰
  </button>
)}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 24px',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              style={{
                ...(isAdmin ? S.adminNavLink(location.pathname === link.path) : S.navLink(location.pathname === link.path)),
                display: 'flex',
                marginBottom: '4px',
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;