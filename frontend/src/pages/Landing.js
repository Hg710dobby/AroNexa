import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    margin: 0,
    padding: 0,
  },
  navbar: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
  },
  navInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '70px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '42px',
    height: '42px',
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    boxShadow: '0 4px 15px rgba(5,150,105,0.3)',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1e293b',
  },
  logoSpan: {
    color: '#059669',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  loginBtn: {
    color: '#059669',
    textDecoration: 'none',
    fontWeight: '600',
    padding: '8px 20px',
    borderRadius: '10px',
    border: '2px solid #059669',
    transition: 'all 0.2s',
    fontSize: '14px',
  },
  getStartedBtn: {
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    textDecoration: 'none',
    fontWeight: '700',
    padding: '10px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    boxShadow: '0 4px 15px rgba(5,150,105,0.4)',
    transition: 'all 0.3s',
  },
  hero: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 24px 40px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    alignItems: 'center',
  },
  heroLeft: {},
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#dcfce7',
    color: '#166534',
    padding: '8px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '24px',
    border: '1px solid #86efac',
  },
  dot: {
    width: '8px',
    height: '8px',
    background: '#16a34a',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  h1: {
    fontSize: '52px',
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: '1.15',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroDesc: {
    fontSize: '18px',
    color: '#475569',
    lineHeight: '1.7',
    marginBottom: '32px',
  },
  ctaRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  primaryCta: {
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '14px',
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '16px',
    boxShadow: '0 8px 25px rgba(5,150,105,0.4)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
  },
  secondaryCta: {
    background: 'white',
    color: '#374151',
    padding: '16px 32px',
    borderRadius: '14px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
  },
  emergencyBox: {
    background: '#fff1f2',
    border: '2px solid #fca5a5',
    borderRadius: '14px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontWeight: '800',
    color: '#dc2626',
    fontSize: '14px',
    margin: '0 0 4px 0',
  },
  emergencyDesc: {
    color: '#ef4444',
    fontSize: '13px',
    margin: 0,
  },
  callBtn: {
    background: '#dc2626',
    color: 'white',
    padding: '10px 18px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
  },
  heroRight: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  featureCard: (active) => ({
    background: 'white',
    borderRadius: '18px',
    padding: '20px',
    border: active ? '2px solid #059669' : '2px solid #f1f5f9',
    boxShadow: active ? '0 8px 30px rgba(5,150,105,0.15)' : '0 2px 15px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    transform: active ? 'scale(1.03)' : 'scale(1)',
  }),
  featureIconBox: (color) => ({
    width: '44px',
    height: '44px',
    background: color,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    marginBottom: '12px',
  }),
  featureTitle: {
    fontWeight: '800',
    color: '#1e293b',
    fontSize: '14px',
    marginBottom: '6px',
  },
  featureDesc: {
    color: '#64748b',
    fontSize: '12px',
    lineHeight: '1.5',
  },
  statsSection: {
    maxWidth: '1200px',
    margin: '0 auto 40px',
    padding: '0 24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
  },
  statCard: {
    background: 'white',
    borderRadius: '18px',
    padding: '24px 20px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
    border: '1px solid #f1f5f9',
    transition: 'all 0.3s',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  statValue: (color) => ({
    fontSize: '32px',
    fontWeight: '900',
    color: color,
    margin: '0 0 4px 0',
  }),
  statLabel: {
    color: '#64748b',
    fontSize: '13px',
    margin: 0,
    fontWeight: '500',
  },
  howSection: {
    maxWidth: '1200px',
    margin: '0 auto 60px',
    padding: '0 24px',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '36px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 12px 0',
  },
  sectionDesc: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '16px',
    margin: '0 0 48px 0',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
  },
  stepCard: {
    textAlign: 'center',
    padding: '32px 24px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
    border: '1px solid #f1f5f9',
  },
  stepIconBox: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    margin: '0 auto 20px',
    boxShadow: '0 8px 25px rgba(5,150,105,0.3)',
  },
  stepNum: {
    color: '#059669',
    fontWeight: '800',
    fontSize: '12px',
    letterSpacing: '2px',
    margin: '0 0 8px 0',
  },
  stepTitle: {
    fontWeight: '800',
    fontSize: '18px',
    color: '#1e293b',
    margin: '0 0 10px 0',
  },
  stepDesc: {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
  },
  techSection: {
    maxWidth: '1200px',
    margin: '0 auto 60px',
    padding: '0 24px',
  },
  techCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
    border: '1px solid #f1f5f9',
    textAlign: 'center',
  },
  techTitle: {
    fontWeight: '800',
    fontSize: '20px',
    color: '#374151',
    margin: '0 0 24px 0',
  },
  techBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
  },
  techBadge: {
    background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
    border: '1px solid #86efac',
    color: '#166534',
    padding: '8px 18px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
  },
  footer: {
    background: '#1e293b',
    color: '#94a3b8',
    padding: '40px 24px',
    textAlign: 'center',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  footerTitle: {
    color: 'white',
    fontWeight: '800',
    fontSize: '20px',
    margin: 0,
  },
  footerDesc: {
    fontSize: '14px',
    margin: '0 0 8px 0',
  },
  footerDisclaimer: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
};

const features = [
  { icon: '🩺', title: 'AI Symptom Checker', desc: 'Rule-based AI classifies urgency into 3 tiers instantly', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  { icon: '🏨', title: 'Hospital Locator', desc: 'GPS-powered nearest hospital & PHC finder', color: 'linear-gradient(135deg, #059669, #047857)' },
  { icon: '📄', title: 'Report Analyzer', desc: 'Upload lab reports for AI-powered analysis', color: 'linear-gradient(135deg, #7c3aed, #5b21b6)' },
  { icon: '🗣️', title: 'Voice Support', desc: 'Speak symptoms in Hindi, Tamil, Telugu & more', color: 'linear-gradient(135deg, #ea580c, #c2410c)' },
];

const stats = [
  { icon: '🎯', value: '85%', label: 'Triage Accuracy', color: '#2563eb' },
  { icon: '🏥', value: '10+', label: 'Hospitals in DB', color: '#059669' },
  { icon: '🌐', value: '5', label: 'Languages', color: '#7c3aed' },
  { icon: '⚡', value: '<2s', label: 'Response Time', color: '#ea580c' },
];

function Landing() {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIcon}>🏥</div>
            <span style={styles.logoText}>
              AroNexa
            </span>
          </Link>
          <div style={styles.navRight}>
            <Link to="/login" style={styles.loginBtn}>Login</Link>
            <Link to="/register" style={styles.getStartedBtn}>Get Started →</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        ...styles.hero,
        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr'
      }}>
        {/* Left */}
        <div>
          <div style={styles.badge}>
            <div style={styles.dot}></div>
            AI-Powered Rural Healthcare
          </div>
          <h1 style={styles.h1}>
            Your Health,<br />
            <span style={styles.gradientText}>Our Priority</span>
          </h1>
          <p style={styles.heroDesc}>
            AroNexa bridges the rural healthcare gap with AI-powered symptom checking,
            multilingual support, and instant hospital locator. Healthcare for everyone, anywhere.
          </p>
          <div style={styles.ctaRow}>
            <Link to="/register" style={styles.primaryCta}>
              🚀 Start Free Now
            </Link>
            <Link to="/login" style={styles.secondaryCta}>
              Login to Account
            </Link>
          </div>
          <div style={styles.emergencyBox}>
            <span style={{ fontSize: '28px' }}>🚨</span>
            <div style={styles.emergencyText}>
              <p style={styles.emergencyTitle}>Medical Emergency?</p>
              <p style={styles.emergencyDesc}>Ambulance: <strong>108</strong> | Medical: <strong>102</strong> | Police: <strong>100</strong></p>
            </div>
            <a href="tel:108" style={styles.callBtn}>📞 Call 108</a>
          </div>
        </div>

        {/* Right - Feature Cards */}
        <div style={styles.heroRight}>
          {features.map((f, i) => (
            <div
              key={i}
              style={styles.featureCard(activeFeature === i)}
              onClick={() => setActiveFeature(i)}
            >
              <div style={styles.featureIconBox(f.color)}>
                {f.icon}
              </div>
              <p style={styles.featureTitle}>{f.title}</p>
              <p style={styles.featureDesc}>{f.desc}</p>
              {activeFeature === i && (
                <p style={{ color: '#059669', fontSize: '11px', fontWeight: '700', marginTop: '8px' }}>✓ Active</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsSection}>
        {stats.map((s, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statIcon}>{s.icon}</div>
            <p style={styles.statValue(s.color)}>{s.value}</p>
            <p style={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div style={styles.howSection}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <p style={styles.sectionDesc}>3 simple steps to get AI health guidance</p>
        <div style={styles.stepsGrid}>
          {[
            { step: '01', icon: '📝', title: 'Register & Profile', desc: 'Create account with health history, location, and preferred language' },
            { step: '02', icon: '🩺', title: 'Describe Symptoms', desc: 'Type or speak symptoms. Upload medical reports for analysis' },
            { step: '03', icon: '✅', title: 'Get AI Guidance', desc: 'Receive triage level, nearby hospitals, and medicine recommendations' },
          ].map((item, i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepIconBox}>{item.icon}</div>
              <p style={styles.stepNum}>STEP {item.step}</p>
              <p style={styles.stepTitle}>{item.title}</p>
              <p style={styles.stepDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div style={styles.techSection}>
        <div style={styles.techCard}>
          <p style={styles.techTitle}>⚙️ Powered by Cloud Technologies</p>
          <div style={styles.techBadges}>
            {['React.js','Python FastAPI','MongoDB Atlas','AWS EC2','Docker','Nginx','JWT Auth','Web Speech API','AWS S3','CloudWatch','Gujarati NLP','Hindi NLP','Haversine GPS','REST API'].map(tech => (
              <span key={tech} style={styles.techBadge}>{tech}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>
          <span style={{ fontSize: '28px' }}>🏥</span>
          <p style={styles.footerTitle}>AroNexa</p>
        </div>
        <p style={styles.footerDesc}>AI-Powered Rural Health Assistant | Cloud Computing Project</p>
        <p style={styles.footerDisclaimer}>⚠️ Not for medical diagnosis. Always consult a qualified doctor.</p>
      </footer>
    </div>
  );
}

export default Landing;