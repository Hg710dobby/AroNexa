import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hospitalAPI, triageAPI, reportAPI } from '../services/api';

const S = {
  page: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '28px 24px',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  welcomeCard: {
    background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
    borderRadius: '20px',
    padding: '28px 32px',
    color: 'white',
    marginBottom: '24px',
    boxShadow: '0 10px 40px rgba(5,150,105,0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  welcomeTitle: { fontSize: '28px', fontWeight: '900', margin: '0 0 4px 0' },
  welcomeSub: { color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  statBox: {
    background: 'rgba(255,255,255,0.18)',
    borderRadius: '14px',
    padding: '16px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
  },
  statNum: { fontSize: '28px', fontWeight: '900', margin: '0 0 4px 0' },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 },
  emergencyBanner: {
    background: '#fff1f2',
    border: '2px solid #fca5a5',
    borderRadius: '16px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  emergencyIcon: {
    width: '48px', height: '48px',
    background: '#fee2e2',
    borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', flexShrink: 0,
  },
  emergencyTitle: { fontWeight: '800', color: '#dc2626', margin: '0 0 2px 0', fontSize: '15px' },
  emergencyDesc: { color: '#ef4444', fontSize: '13px', margin: 0 },
  callBtn: {
    background: '#dc2626',
    color: 'white',
    padding: '10px 18px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '14px',
    flexShrink: 0,
    marginLeft: 'auto',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
  },
  sectionTitle: {
    fontSize: '17px', fontWeight: '800', color: '#1e293b',
    margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  actionCard: (bg, border) => ({
    background: bg,
    border: `2px solid ${border}`,
    borderRadius: '16px',
    padding: '18px',
    textDecoration: 'none',
    display: 'block',
    transition: 'all 0.3s',
    cursor: 'pointer',
  }),
  actionIconBox: (gradient) => ({
    width: '42px', height: '42px',
    background: gradient,
    borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px',
    marginBottom: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  }),
  actionTitle: { fontWeight: '800', color: '#1e293b', fontSize: '13px', margin: '0 0 4px 0' },
  actionDesc: { color: '#64748b', fontSize: '11px', margin: 0 },
  tipsCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  },
  tipItem: (color, border) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: color,
    border: `1px solid ${border}`,
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '10px',
  }),
  tipText: { color: '#374151', fontSize: '13px', margin: 0 },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  checkupCta: {
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    borderRadius: '18px',
    padding: '24px',
    textAlign: 'center',
    color: 'white',
    boxShadow: '0 8px 30px rgba(5,150,105,0.3)',
  },
  checkupBtn: {
    display: 'block',
    background: 'white',
    color: '#059669',
    fontWeight: '800',
    padding: '12px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '14px',
    marginTop: '16px',
    transition: 'all 0.2s',
  },
  historyCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  viewAll: { color: '#059669', fontSize: '12px', textDecoration: 'none', fontWeight: '600' },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: '#f8fafc',
    borderRadius: '10px',
    marginBottom: '8px',
  },
  triageGuide: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  },
  triageBadge: (bg, border, color) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: bg,
    border: `2px solid ${border}`,
    color: color,
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '8px',
  }),
  disclaimer: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '14px',
    padding: '14px 18px',
    color: '#92400e',
    fontSize: '13px',
    textAlign: 'center',
    marginTop: '24px',
  },
};

const quickActions = [
  { icon: '🩺', title: 'Check Symptoms', desc: 'AI triage now', link: '/symptom-checker', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', bg: '#eff6ff', border: '#bfdbfe' },
  { icon: '🏨', title: 'Find Hospital', desc: 'Nearby hospitals', link: '/hospitals', gradient: 'linear-gradient(135deg, #059669, #047857)', bg: '#f0fdf4', border: '#bbf7d0' },
  { icon: '📄', title: 'Upload Report', desc: 'Analyze reports', link: '/reports', gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)', bg: '#faf5ff', border: '#e9d5ff' },
  { icon: '📋', title: 'View History', desc: 'Past checkups', link: '/history', gradient: 'linear-gradient(135deg, #ea580c, #c2410c)', bg: '#fff7ed', border: '#fed7aa' },
  { icon: '💊', title: 'Medicine Guide', desc: 'Medicine information', link: '/symptom-checker', gradient: 'linear-gradient(135deg, #db2777, #9d174d)', bg: '#fdf2f8', border: '#fbcfe8' },
  { icon: '👤', title: 'My Profile', desc: 'Health data', link: '/profile', gradient: 'linear-gradient(135deg, #0891b2, #0e7490)', bg: '#f0fdfa', border: '#99f6e4' },
];

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({ triage: 0, reports: 0, hospitals: 10 });
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Good Morning');
    else if (hour < 17) setTimeOfDay('Good Afternoon');
    else setTimeOfDay('Good Evening');

    const loadData = async () => {
      try {
        await hospitalAPI.seedHospitals();
        const histRes = await triageAPI.getHistory();
        const history = histRes.data.history || [];
        setRecentHistory(history.slice(0, 3));
        setStats(prev => ({ ...prev, triage: history.length }));
        const repRes = await reportAPI.getAll();
        setStats(prev => ({ ...prev, reports: repRes.data.total || 0 }));
      } catch (err) {
        console.log('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getUrgencyStyle = (level) => {
    if (level === 'emergency') return { bg: '#fee2e2', color: '#dc2626', icon: '🚨' };
    if (level === 'visit-clinic') return { bg: '#fef3c7', color: '#d97706', icon: '🏥' };
    return { bg: '#dcfce7', color: '#16a34a', icon: '🏠' };
  };

  return (
    <div style={S.page}>

      {/* Welcome Card */}
      <div style={S.welcomeCard}>
        <div style={S.welcomeInner}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '0 0 6px 0' }}>
              {timeOfDay} 👋
            </p>
            <h1 style={S.welcomeTitle}>{user.full_name || 'User'}</h1>
            <p style={S.welcomeSub}>Your personal AI-assisted health companion</p>
          </div>
          <span style={{ fontSize: '56px', opacity: 0.6 }}>🏥</span>
        </div>
        <div style={S.statsRow}>
          <div style={S.statBox}>
            <p style={S.statNum}>{stats.triage}</p>
            <p style={S.statLabel}>Symptoms Checks</p>
          </div>
          <div style={S.statBox}>
            <p style={S.statNum}>{stats.reports}</p>
            <p style={S.statLabel}>Medical Reports</p>
          </div>
          <div style={S.statBox}>
            <p style={S.statNum}>{stats.hospitals}+</p>
            <p style={S.statLabel}>Hospitals Available</p>
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      <div style={S.emergencyBanner}>
        <div style={S.emergencyIcon}>🚨</div>
        <div>
          <p style={S.emergencyTitle}>24x7 Emergency Helplines</p>
          <p style={S.emergencyDesc}>Ambulance: <strong>108</strong> | Medical: <strong>102</strong> | Police: <strong>100</strong> | Fire: <strong>101</strong></p>
        </div>
        <a href="tel:108" style={S.callBtn}>📞 Call 108</a>
      </div>

      {/* Main Grid */}
      <div style={S.mainGrid}>

        {/* Left Column */}
        <div>
          <p style={S.sectionTitle}>⚡ Quick Actions</p>
          <div style={S.actionsGrid}>
            {quickActions.map((action, i) => (
              <Link key={i} to={action.link}
                style={S.actionCard(action.bg, action.border)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={S.actionIconBox(action.gradient)}>{action.icon}</div>
                <p style={S.actionTitle}>{action.title}</p>
                <p style={S.actionDesc}>{action.desc}</p>
              </Link>
            ))}
          </div>

          {/* Health Tips */}
          <div style={S.tipsCard}>
            <p style={S.sectionTitle}>💡 Healthy Living Tips</p>
            {[
              { icon: '💧', tip: 'Drink 8-10 glasses of water daily to stay hydrated', bg: '#eff6ff', border: '#bfdbfe' },
              { icon: '🥗', tip: 'Eat fresh fruits and vegetables for essential vitamins and minerals', bg: '#f0fdf4', border: '#bbf7d0' },
              { icon: '🚶', tip: 'Walk 30 minutes daily to improve cardiovascular health', bg: '#fff7ed', border: '#fed7aa' },
              { icon: '😴', tip: 'Get 7-8 hours of quality sleep for better immune function', bg: '#faf5ff', border: '#e9d5ff' },
            ].map((item, i) => (
              <div key={i} style={S.tipItem(item.bg, item.border)}>
                <span style={{ fontSize: '22px' }}>{item.icon}</span>
                <p style={S.tipText}>{item.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={S.rightCol}>

          {/* CTA */}
          <div style={S.checkupCta}>
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>🩺</div>
            <h3 style={{ fontWeight: '800', fontSize: '18px', margin: '0 0 8px 0' }}>Check Your Symptoms</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>
              Describe your symptoms and receive instant AI-assisted health guidance
            </p>
            <Link to="/symptom-checker" style={S.checkupBtn}>
              Start Checkup →
            </Link>
          </div>

          {/* Recent History */}
          <div style={S.historyCard}>
            <div style={S.historyHeader}>
              <p style={{ fontWeight: '800', color: '#1e293b', margin: 0, fontSize: '15px' }}>📋 Recent Activity</p>
              <Link to="/history" style={S.viewAll}>View all</Link>
            </div>

            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ height: '48px', background: '#f1f5f9', borderRadius: '10px', marginBottom: '8px' }}></div>
              ))
            ) : recentHistory.length > 0 ? (
              recentHistory.map((record, i) => {
                const style = getUrgencyStyle(record.urgency_level);
                return (
                  <div key={i} style={S.historyItem}>
                    <span style={{ fontSize: '20px' }}>{style.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {record.symptoms}
                      </p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                        {record.created_at
  ? new Date(record.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  : '—'}
                      </p>
                    </div>
                    <span style={{
                      background: style.bg, color: style.color,
                      padding: '3px 8px', borderRadius: '999px',
                      fontSize: '10px', fontWeight: '700', flexShrink: 0
                    }}>
                      {record.urgency_level ? record.urgency_level.replace('-', ' ') : ''}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>📭</p>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px 0' }}>No recent symptoms Checks</p>
                <Link to="/symptom-checker" style={{ color: '#059669', fontSize: '12px' }}>Check symptoms now</Link>
              </div>
            )}
          </div>

          {/* Triage Guide */}
          <div style={S.triageGuide}>
            <p style={{ fontWeight: '800', color: '#1e293b', margin: '0 0 14px 0', fontSize: '15px' }}>🎯 Triage Guide</p>
            <div style={S.triageBadge('#dcfce7', '#22c55e', '#166534')}>
              <span style={{ fontSize: '20px' }}>🏠</span>
              <div>
                <p style={{ fontWeight: '800', fontSize: '13px', margin: '0 0 2px 0' }}>Self-Care</p>
                <p style={{ fontSize: '11px', opacity: 0.8, margin: 0 }}>Mild symptoms, manage at home</p>
              </div>
            </div>
            <div style={S.triageBadge('#fef3c7', '#f59e0b', '#92400e')}>
              <span style={{ fontSize: '20px' }}>🏥</span>
              <div>
                <p style={{ fontWeight: '800', fontSize: '13px', margin: '0 0 2px 0' }}>Visit Clinic</p>
                <p style={{ fontSize: '11px', opacity: 0.8, margin: 0 }}>Moderate, see doctor soon</p>
              </div>
            </div>
            <div style={S.triageBadge('#fee2e2', '#ef4444', '#991b1b')}>
              <span style={{ fontSize: '20px' }}>🚨</span>
              <div>
                <p style={{ fontWeight: '800', fontSize: '13px', margin: '0 0 2px 0' }}>Emergency</p>
                <p style={{ fontSize: '11px', opacity: 0.8, margin: 0 }}>Severe, go to hospital NOW</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={S.disclaimer}>
        <strong>⚠️ Medical Disclaimer:</strong> AroNexa provides AI-assisted health information for educational purposes only. 
        It does not replace professional medical diagnosis or treatment.
      </div>
    </div>
  );
}

export default Dashboard;