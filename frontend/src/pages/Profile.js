import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const S = {
  page: {
    maxWidth: '1000px', margin: '0 auto', padding: '28px 24px',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  header: { display: 'flex', alignItems: 'center', gap: '16px' },
  headerIcon: {
    width: '48px', height: '48px',
    background: 'linear-gradient(135deg, #0891b2, #0e7490)',
    borderRadius: '14px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '24px',
    boxShadow: '0 6px 20px rgba(8,145,178,0.35)',
  },
  savedBadge: {
    background: '#dcfce7', border: '1px solid #86efac',
    color: '#166534', padding: '8px 16px', borderRadius: '12px',
    fontSize: '13px', fontWeight: '700',
    display: 'flex', alignItems: 'center', gap: '6px',
  },
  profileHero: {
    background: 'linear-gradient(135deg, #0891b2, #059669)',
    borderRadius: '20px', padding: '28px 32px',
    color: 'white', marginBottom: '24px',
    boxShadow: '0 10px 40px rgba(8,145,178,0.3)',
    display: 'flex', alignItems: 'center', gap: '24px',
  },
  avatar: {
    width: '72px', height: '72px',
    background: 'rgba(255,255,255,0.25)',
    borderRadius: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '36px', fontWeight: '900', flexShrink: 0,
    border: '3px solid rgba(255,255,255,0.4)',
  },
  heroRight: { marginLeft: 'auto', textAlign: 'right' },
  progressBar: {
    height: '8px', background: 'rgba(255,255,255,0.25)',
    borderRadius: '999px', overflow: 'hidden', width: '120px', marginTop: '6px',
  },
  progressFill: (pct) => ({
    height: '100%', width: `${pct}%`,
    background: 'white', borderRadius: '999px', transition: 'width 1s',
  }),
  mainGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
  card: {
    background: 'white', borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '18px 24px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  cardTitle: { fontWeight: '800', color: '#1e293b', fontSize: '16px', margin: 0 },
  editBtn: {
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white', border: 'none', borderRadius: '10px',
    padding: '8px 18px', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  cancelBtn: {
    background: '#f1f5f9', color: '#374151',
    border: 'none', borderRadius: '10px', padding: '8px 14px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
    marginRight: '8px',
  },
  saveBtn: {
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white', border: 'none', borderRadius: '10px',
    padding: '8px 18px', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  cardBody: { padding: '24px' },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  fieldWrap: { marginBottom: '4px' },
  label: {
    display: 'block', fontSize: '10px', fontWeight: '800',
    color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px',
  },
  valueBox: {
    background: '#f8fafc', borderRadius: '10px', padding: '11px 14px',
    color: '#1e293b', fontSize: '14px', fontWeight: '500',
    border: '1px solid #f1f5f9', minHeight: '42px',
    display: 'flex', alignItems: 'center',
  },
  input: {
    width: '100%', border: '2px solid #e2e8f0',
    borderRadius: '10px', padding: '10px 14px',
    fontSize: '14px', color: '#1e293b',
    boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
  },
  select: {
    width: '100%', border: '2px solid #e2e8f0',
    borderRadius: '10px', padding: '10px 14px',
    fontSize: '14px', color: '#1e293b',
    boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none', background: 'white',
  },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  healthCard: {
    background: 'white', borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9',
    padding: '20px',
  },
  sectionTitle: { fontWeight: '800', color: '#1e293b', fontSize: '15px', margin: '0 0 14px 0' },
  healthLabel: { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px 0' },
  tag: (bg, border, color) => ({
    display: 'inline-block', background: bg, border: `1px solid ${border}`,
    color: color, padding: '4px 12px', borderRadius: '999px',
    fontSize: '12px', fontWeight: '600', margin: '0 5px 5px 0',
  }),
  accountCard: {
    background: 'white', borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9',
    padding: '20px',
  },
  accountRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: '1px solid #f8fafc',
    alignItems: 'center',
  },
  tipCard: {
    background: '#fffbeb', border: '1px solid #fde68a',
    borderRadius: '16px', padding: '16px',
  },
};

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setProfile(res.data.profile);
      setFormData(res.data.profile);
    } catch (e) { } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, email, created_at, updated_at, role, is_active, password_hash, ...updateData } = formData;
      await userAPI.updateProfile(updateData);
      setProfile({ ...profile, ...updateData });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Failed to update profile');
    } finally { setSaving(false); }
  };

  const completionFields = ['full_name', 'phone', 'age', 'gender', 'village', 'district', 'state', 'preferred_language', 'emergency_contact'];
  const pct = profile ? Math.round((completionFields.filter(f => profile[f]).length / completionFields.length) * 100) : 0;

  const inputFocus = e => { e.target.style.borderColor = '#0891b2'; e.target.style.boxShadow = '0 0 0 3px rgba(8,145,178,0.1)'; };
  const inputBlur = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

  if (loading) {
    return (
      <div style={S.page}>
        <div style={{ height: '140px', background: '#f1f5f9', borderRadius: '20px', marginBottom: '24px' }}></div>
        <div style={{ height: '300px', background: '#f1f5f9', borderRadius: '20px' }}></div>
      </div>
    );
  }

  const fields = [
    { label: 'Full Name', key: 'full_name', icon: '👤' },
    { label: 'Phone Number', key: 'phone', icon: '📞' },
    { label: 'Age', key: 'age', type: 'number', icon: '🎂' },
    { label: 'Village / City', key: 'village', icon: '🏘' },
    { label: 'District', key: 'district', icon: '🗺' },
    { label: 'State', key: 'state', icon: '📍' },
    { label: 'Emergency Contact', key: 'emergency_contact', icon: '🚨' },
  ];

  return (
    <div style={S.page}>
      {/* Top Row */}
      <div style={S.topRow}>
        <div style={S.header}>
          <div style={S.headerIcon}>👤</div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1e293b', margin: 0 }}>My Profile</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Manage your personal health profile</p>
          </div>
        </div>
        {saved && <div style={S.savedBadge}>✅ Profile saved successfully!</div>}
      </div>

      {/* Profile Hero */}
      <div style={S.profileHero}>
        <div style={S.avatar}>{profile?.full_name?.charAt(0) || '?'}</div>
        <div>
          <h2 style={{ fontWeight: '900', fontSize: '24px', margin: '0 0 4px 0' }}>{profile?.full_name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '0 0 4px 0' }}>Aronexa Patient Account</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>
            📍 {profile?.village || 'Location'}, {profile?.district || 'District'}
          </p>
        </div>
        <div style={S.heroRight}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '0 0 4px 0' }}>Profile Complete</p>
          <p style={{ fontWeight: '900', fontSize: '32px', margin: 0 }}>{pct}%</p>
          <div style={S.progressBar}>
            <div style={S.progressFill(pct)}></div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={S.mainGrid}>

        {/* Left - Form */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <p style={S.cardTitle}>Personal Information</p>
            {editing ? (
              <div>
                <button style={S.cancelBtn} onClick={() => { setEditing(false); setFormData(profile); }}>Cancel</button>
                <button style={S.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            ) : (
              <button style={S.editBtn} onClick={() => setEditing(true)}>✏️ Edit Profile</button>
            )}
          </div>
          <div style={S.cardBody}>
            <div style={S.fieldGrid}>
              {fields.map(f => (
                <div key={f.key} style={S.fieldWrap}>
                  <label style={S.label}>{f.icon} {f.label}</label>
                  {editing ? (
                    <input
                      type={f.type || 'text'}
                      value={formData[f.key] || ''}
                      onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      style={S.input}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  ) : (
                    <div style={S.valueBox}>
                      {profile?.[f.key] || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Not set</span>}
                    </div>
                  )}
                </div>
              ))}

              {/* Gender */}
              <div style={S.fieldWrap}>
                <label style={S.label}>⚥ Gender</label>
                {editing ? (
                  <select value={formData.gender || ''} onChange={e => setFormData({ ...formData, gender: e.target.value })} style={S.select}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div style={{ ...S.valueBox, textTransform: 'capitalize' }}>
                    {profile?.gender || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Not set</span>}
                  </div>
                )}
              </div>

              {/* Language */}
              <div style={S.fieldWrap}>
                <label style={S.label}>🌐 Preferred Language</label>
                {editing ? (
                  <select value={formData.preferred_language || 'english'} onChange={e => setFormData({ ...formData, preferred_language: e.target.value })} style={S.select}>
                    {['english', 'hindi', 'gujarati', 'tamil', 'marathi'].map(l => (
                      <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ ...S.valueBox, textTransform: 'capitalize' }}>
                    {profile?.preferred_language || 'English'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={S.rightCol}>

          {/* Health Info */}
          <div style={S.healthCard}>
            <p style={S.sectionTitle}>🏥 Health Details</p>

            <p style={S.healthLabel}>Known Diseases</p>
            <div style={{ marginBottom: '14px' }}>
              {profile?.known_diseases?.length > 0
                ? profile.known_diseases.map((d, i) => <span key={i} style={S.tag('#fee2e2', '#fca5a5', '#dc2626')}>{d}</span>)
                : <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>No information added</span>
              }
            </div>

            <p style={S.healthLabel}>Allergies</p>
            <div style={{ marginBottom: '14px' }}>
              {profile?.allergies?.length > 0
                ? profile.allergies.map((a, i) => <span key={i} style={S.tag('#fed7aa', '#fb923c', '#ea580c')}>{a}</span>)
                : <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>No information added</span>
              }
            </div>

            <p style={S.healthLabel}>Current Medicines</p>
            <div>
              {profile?.current_medicines?.length > 0
                ? profile.current_medicines.map((m, i) => <span key={i} style={S.tag('#dbeafe', '#93c5fd', '#1d4ed8')}>{m}</span>)
                : <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>No information added</span>
              }
            </div>
          </div>

          {/* Account Info */}
          <div style={S.accountCard}>
            <p style={S.sectionTitle}>⚙️ Account Details</p>
            {[
              { label: 'Email', value: profile?.email },
              { label: 'Role', value: profile?.role || 'Patient' },
              { label: 'Status', value: '✅ Active' },
            ].map((row, i) => (
              <div key={i} style={S.accountRow}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{row.label}</span>
                <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px', textTransform: 'capitalize' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Completion Tip */}
          {pct < 100 && (
            <div style={S.tipCard}>
              <p style={{ fontWeight: '800', color: '#92400e', fontSize: '14px', margin: '0 0 6px 0' }}>💡 Complete Your Health Profile</p>
              <p style={{ color: '#78350f', fontSize: '13px', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                A complete profile helps provide more personalized hospital recommendations and AI-assisted health guidance.
              </p>
              <button onClick={() => setEditing(true)}
                style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: '800', cursor: 'pointer', fontSize: '13px', padding: 0, fontFamily: 'inherit' }}>
                Update now →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;