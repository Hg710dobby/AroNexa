import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';

const S = {
  page: {
    maxWidth: '1200px', margin: '0 auto', padding: '28px 24px',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  welcomeCard: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)',
    borderRadius: '20px', padding: '28px 32px', color: 'white',
    marginBottom: '24px', boxShadow: '0 10px 40px rgba(124,58,237,0.35)',
    position: 'relative', overflow: 'hidden',
  },
  welcomeInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  welcomeTitle: { fontSize: '28px', fontWeight: '900', margin: '0 0 4px 0' },
  welcomeSub: { color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
    marginBottom: '24px',
  },
  statCard: (gradient) => ({
    background: 'white', borderRadius: '18px', padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
    position: 'relative', overflow: 'hidden',
  }),
  statCardAccent: (color) => ({
    position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
    background: color,
  }),
  mainGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' },
  card: {
    background: 'white', borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9',
    overflow: 'hidden',
  },
  cardHeader: (gradient) => ({
    background: gradient, padding: '16px 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  }),
  cardHeaderTitle: { color: 'white', fontWeight: '800', fontSize: '15px', margin: 0 },
  cardBody: { padding: '20px 24px' },
  patientItem: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px 16px', borderRadius: '14px', marginBottom: '10px',
    border: '1px solid #f1f5f9', transition: 'all 0.2s', cursor: 'pointer',
  },
  avatar: (color) => ({
    width: '42px', height: '42px', borderRadius: '12px',
    background: color, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: 'white', fontWeight: '800',
    fontSize: '16px', flexShrink: 0,
  }),
  urgencyDot: (level) => ({
    width: '8px', height: '8px', borderRadius: '50%',
    background: level === 'emergency' ? '#dc2626' : level === 'visit-clinic' ? '#d97706' : '#16a34a',
    flexShrink: 0,
  }),
  triageBar: {
    display: 'flex', borderRadius: '10px', overflow: 'hidden',
    height: '28px', marginBottom: '12px',
  },
  triageSeg: (color, pct) => ({
    height: '100%', width: `${pct}%`, background: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', fontWeight: '800', color: 'white',
    minWidth: pct > 5 ? '30px' : '0',
  }),
  villageItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 14px', borderRadius: '12px', marginBottom: '8px',
    background: '#f8fafc', border: '1px solid #f1f5f9',
  },
  emptyState: { textAlign: 'center', padding: '40px 20px', color: '#94a3b8' },
  quickActionGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
    marginBottom: '24px',
  },
  quickAction: (bg, border) => ({
    background: bg, border: `2px solid ${border}`, borderRadius: '16px',
    padding: '18px', textDecoration: 'none', display: 'block',
    transition: 'all 0.3s', cursor: 'pointer', textAlign: 'center',
  }),
  detailModal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 2000, padding: '24px',
  },
  detailCard: {
    background: 'white', borderRadius: '24px', maxWidth: '700px',
    width: '100%', maxHeight: '85vh', overflow: 'auto',
    boxShadow: '0 25px 80px rgba(0,0,0,0.2)',
  },
};

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [villages, setVillages] = useState([]);
  const [emergencyPatients, setEmergencyPatients] = useState([]);
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [patientDetail, setPatientDetail] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

useEffect(() => {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  return () => document.head.removeChild(style);
}, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, patientsRes, trendsRes, villagesRes, emergencyRes] =
  await Promise.allSettled([
    adminAPI.getStats(),
    adminAPI.getPatients(0, 50),
    adminAPI.getTriageTrends(),
    adminAPI.getVillageStats(),
    adminAPI.getEmergency(),
  ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats);
      if (patientsRes.status === 'fulfilled') setPatients(patientsRes.value.data.patients || []);
      if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value.data.trends || {});
      if (villagesRes.status === 'fulfilled') setVillages(villagesRes.value.data.villages || []);
      if (emergencyRes.status === 'fulfilled')
  setEmergencyPatients(emergencyRes.value.data.patients || []);
    } catch (err) {
      console.log('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewPatient = async (patientId) => {
    setDetailLoading(true);
    setSelectedPatient(patientId);
    try {
      const res = await adminAPI.getPatientDetail(patientId);
      setPatientDetail(res.data);
    } catch (err) {
      console.log('Patient detail error:', err);
    } finally {
      setDetailLoading(false);
    }
  };
  const updateFollowup = async (patientId, status) => {
  try {
    await adminAPI.updateFollowup(patientId, status);
    setSuccessMsg("✅ Follow-up updated successfully");
    setTimeout(() => setSuccessMsg(''), 2500);

    await loadData();

    const res = await adminAPI.getPatientDetail(patientId);
    setPatientDetail(res.data);

  } catch (err) {
    console.log(err);
  }
};


  const totalTriage = (trends.emergency || 0) + (trends['visit-clinic'] || 0) + (trends['self-care'] || 0);
  const emergencyPct = totalTriage ? ((trends.emergency || 0) / totalTriage * 100) : 0;
  const clinicPct = totalTriage ? ((trends['visit-clinic'] || 0) / totalTriage * 100) : 0;
  const selfCarePct = totalTriage ? ((trends['self-care'] || 0) / totalTriage * 100) : 0;

  const filteredPatients = patients.filter(p =>
    !searchText || p.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    p.village?.toLowerCase().includes(searchText.toLowerCase()) ||
    p.phone?.includes(searchText)
  );

  const getUrgencyStyle = (level) => {
    if (level === 'emergency') return { bg: '#fee2e2', color: '#dc2626', icon: '🚨', label: 'Emergency' };
    if (level === 'visit-clinic') return { bg: '#fef3c7', color: '#d97706', icon: '🏥', label: 'Visit Clinic' };
    return { bg: '#dcfce7', color: '#16a34a', icon: '🏠', label: 'Self-Care' };
  };

  const avatarColors = [
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #059669, #047857)',
    'linear-gradient(135deg, #7c3aed, #5b21b6)',
    'linear-gradient(135deg, #ea580c, #c2410c)',
    'linear-gradient(135deg, #db2777, #9d174d)',
    'linear-gradient(135deg, #0891b2, #0e7490)',
  ];

  return (
    <div style={S.page}>
      {/* Welcome Card */}
      <div style={S.welcomeCard}>
        <div style={S.welcomeInner}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 6px 0' }}>
              👩‍⚕️ ASHA Worker Dashboard
            </p>
            <h1 style={S.welcomeTitle}>{user.full_name || 'Admin'}</h1>
            <p style={S.welcomeSub}>Manage patients, monitor health trends, and coordinate care</p>
          </div>
          <span style={{ fontSize: '56px', opacity: 0.5 }}>🏥</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={S.quickActionGrid}>
        {[
          { icon: '🩺', title: 'Check Symptoms', desc: 'Triage a patient', link: '/symptom-checker', bg: '#eff6ff', border: '#bfdbfe' },
          { icon: '🏨', title: 'Find Hospital', desc: 'Nearby facilities', link: '/hospitals', bg: '#f0fdf4', border: '#bbf7d0' },
          { icon: '📄', title: 'Upload Report', desc: 'Analyze reports', link: '/reports', bg: '#faf5ff', border: '#e9d5ff' },
        ].map((a, i) => (
          <Link key={i} to={a.link} style={S.quickAction(a.bg, a.border)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{ fontSize: '28px' }}>{a.icon}</span>
            <p style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px', margin: '8px 0 2px 0' }}>{a.title}</p>
            <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div style={S.statsGrid}>
          {[
            { value: stats.total_patients, label: 'Total Patients', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', icon: '🧑‍🤝‍🧑' },
            { value: stats.total_triage_sessions, label: 'Triage Sessions', color: 'linear-gradient(135deg, #059669, #047857)', icon: '🩺' },
            { value: stats.triage_distribution?.emergency || 0, label: 'Emergencies', color: 'linear-gradient(135deg, #dc2626, #b91c1c)', icon: '🚨' },
            { value: stats.total_reports, label: 'Reports Analyzed', color: 'linear-gradient(135deg, #7c3aed, #5b21b6)', icon: '📄' },
          ].map((s, i) => (
            <div key={i} style={S.statCard()}>
              <div style={S.statCardAccent(s.color)}></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                <div>
                  <p style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', margin: '0 0 4px 0' }}>{s.value}</p>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{s.label}</p>
                </div>
                <span style={{ fontSize: '28px', opacity: 0.6 }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Triage Distribution Bar */}
      {totalTriage > 0 && (
        <div style={{ ...S.card, marginBottom: '24px' }}>
          <div style={{ padding: '20px 24px' }}>
            <p style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px', margin: '0 0 14px 0' }}>📊 Triage Distribution</p>
            <div style={S.triageBar}>
              {emergencyPct > 0 && <div style={S.triageSeg('#dc2626', emergencyPct)}>{Math.round(emergencyPct)}%</div>}
              {clinicPct > 0 && <div style={S.triageSeg('#d97706', clinicPct)}>{Math.round(clinicPct)}%</div>}
              {selfCarePct > 0 && <div style={S.triageSeg('#16a34a', selfCarePct)}>{Math.round(selfCarePct)}%</div>}
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#dc2626' }}></span>
                Emergency ({trends.emergency || 0})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#d97706' }}></span>
                Visit Clinic ({trends['visit-clinic'] || 0})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#16a34a' }}></span>
                Self-Care ({trends['self-care'] || 0})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={S.mainGrid}>
        {/* Patients List */}
        <div style={S.card}>
          <div style={S.cardHeader('linear-gradient(135deg, #7c3aed, #5b21b6)')}>
            <p style={S.cardHeaderTitle}>🧑‍🤝‍🧑 Patients ({patients.length})</p>
          </div>
          <div style={S.cardBody}>
            {/* Search */}
            <input
              type="text"
              placeholder="🔍 Search patients by name, village, phone..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{
                width: '100%', border: '2px solid #e2e8f0', borderRadius: '12px',
                padding: '10px 16px', fontSize: '13px', color: '#1e293b',
                outline: 'none', fontFamily: 'inherit', marginBottom: '16px',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />

            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: '60px', background: '#f1f5f9', borderRadius: '12px', marginBottom: '10px' }}></div>
              ))
            ) : filteredPatients.length === 0 ? (
              <div style={S.emptyState}>
                <p style={{ fontSize: '40px', margin: '0 0 8px 0' }}>📭</p>
                <p style={{ fontWeight: '700', color: '#374151' }}>No patients found</p>
              </div>
            ) : (
              filteredPatients.map((p, i) => {
                const urgStyle = p.latest_triage ? getUrgencyStyle(p.latest_triage.urgency_level) : null;
                return (
                  <div key={i} style={S.patientItem}
                    onClick={() => viewPatient(p.id)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.background = '#faf5ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = 'white'; }}
                  >
                    <div style={S.avatar(avatarColors[i % avatarColors.length])}>
                      {p.full_name?.charAt(0) || 'P'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px', margin: '0 0 2px 0' }}>{p.full_name}</p>
                      <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>
                        {p.age ? `${p.age}y · ` : ''}{p.gender || ''}{p.village ? ` · ${p.village}` : ''}{p.phone ? ` · ${p.phone}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span style={{ background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '700' }}>
                        {p.triage_count} checkups
                        {p.followup_status === "visited" ? (
  <span style={{
    background:"#dcfce7",
    color:"#166534",
    padding:"2px 8px",
    borderRadius:"8px",
    fontSize:"10px",
    fontWeight:"700"
  }}>
    ✅ Visited
  </span>
) : (
  <span style={{
    background:"#fef3c7",
    color:"#92400e",
    padding:"2px 8px",
    borderRadius:"8px",
    fontSize:"10px",
    fontWeight:"700"
  }}>
    ⏳ Pending
  </span>
)}

                      </span>
                      {urgStyle && (
                        <span style={{ background: urgStyle.bg, color: urgStyle.color, padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '700' }}>
                          {urgStyle.icon} {urgStyle.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Village Stats */}
          <div style={S.card}>
            <div style={S.cardHeader('linear-gradient(135deg, #059669, #047857)')}>
              <p style={S.cardHeaderTitle}>🏘 Village Distribution</p>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {villages.length === 0 ? (
                <div style={S.emptyState}>
                  <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>🏘</p>
                  <p style={{ fontSize: '13px' }}>No village data yet</p>
                </div>
              ) : (
                villages.map((v, i) => (
                  <div key={i} style={S.villageItem}>
                    <div>
                      <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '13px', margin: '0 0 2px 0' }}>
                        {v.village || 'Unknown'}
                      </p>
                      <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>{v.district || ''}</p>
                    </div>
                    <span style={{
                      background: '#dcfce7', color: '#166534', padding: '4px 10px',
                      borderRadius: '999px', fontSize: '12px', fontWeight: '700'
                    }}>
                      {v.patient_count} patients
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Emergency Patients */}
<div style={{
  background: '#fef2f2',
  border: '2px solid #fecaca',
  borderRadius: '18px',
  padding: '18px'
}}>
  <p style={{
    fontWeight: '800',
    color: '#dc2626',
    fontSize: '15px',
    margin: '0 0 12px 0'
  }}>
    🚨 Emergency Patients
  </p>

  {emergencyPatients.length === 0 ? (
    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
      No emergency cases
    </p>
  ) : (
    emergencyPatients.map((p, i) => (
      <div key={i} style={{
        background: 'white',
        borderRadius: '12px',
        padding: '10px',
        marginBottom: '8px',
        border: '1px solid #fecaca'
      }}>
        <p style={{ fontWeight: '700', color: '#1e293b', margin: '0 0 2px 0' }}>
          {p.full_name}
        </p>
        <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 4px 0' }}>
          📍 {p.village}
        </p>
        <p style={{ color: '#dc2626', fontSize: '11px', margin: 0 }}>
          {p.symptoms}
        </p>
      </div>
    ))
  )}
</div>

          {/* Emergency Contacts */}
          <div style={{ background: '#fff1f2', border: '2px solid #fca5a5', borderRadius: '18px', padding: '20px' }}>
            <p style={{ fontWeight: '800', color: '#dc2626', margin: '0 0 12px 0', fontSize: '15px' }}>🚨 Emergency Numbers</p>
            {[
              { label: 'Ambulance', number: '108' },
              { label: 'Medical Emergency', number: '102' },
              { label: 'Women Helpline', number: '1091' },
              { label: 'Child Helpline', number: '1098' },
            ].map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                <span style={{ color: '#991b1b', fontSize: '13px' }}>{e.label}</span>
                <a href={`tel:${e.number}`} style={{
                  background: '#dc2626', color: 'white', padding: '4px 12px',
                  borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none',
                }}>
                  📞 {e.number}
                </a>
              </div>
            ))}
          </div>

          {/* Community Health Analytics */}
<div style={S.card}>
  <div style={S.cardHeader('linear-gradient(135deg,#2563eb,#1d4ed8)')}>
    <p style={S.cardHeaderTitle}>📊 Community Health Analytics</p>
  </div>

  <div style={{padding:'18px'}}>
    {[
      {label:'Emergency', value: trends.emergency || 0, color:'#dc2626'},
      {label:'Visit Clinic', value: trends['visit-clinic'] || 0, color:'#d97706'},
      {label:'Self Care', value: trends['self-care'] || 0, color:'#16a34a'},
    ].map((item,i)=>(
      <div key={i} style={{marginBottom:'14px'}}>
        <div style={{
          display:'flex',
          justifyContent:'space-between',
          fontSize:'12px',
          marginBottom:'4px'
        }}>
          <span>{item.label}</span>
          <b>{item.value}</b>
        </div>

        <div style={{
          height:'10px',
          background:'#e5e7eb',
          borderRadius:'999px'
        }}>
          <div style={{
            width:`${Math.max(item.value*20,8)}%`,
            height:'100%',
            background:item.color,
            borderRadius:'999px'
          }}/>
        </div>
      </div>
    ))}
  </div>
</div>

          {/* ASHA Info */}
          <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '16px', padding: '18px' }}>
            <p style={{ fontWeight: '800', color: '#6d28d9', fontSize: '13px', margin: '0 0 10px 0' }}>👩‍⚕️ ASHA Worker Guide</p>
            {[
              'Monitor patients with recent emergency triage',
              'Follow up with visit-clinic cases within 48 hours',
              'Ensure patients take prescribed medicines',
              'Track village-wise health trends',
              'Report disease outbreaks to PHC immediately',
            ].map((tip, i) => (
              <p key={i} style={{ color: '#7c3aed', fontSize: '12px', margin: '0 0 6px 0' }}>• {tip}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div style={S.detailModal} onClick={() => { setSelectedPatient(null); setPatientDetail(null); }}>
          <div style={S.detailCard} onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e9d5ff', borderTop: '4px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
                <p style={{ color: '#64748b' }}>Loading patient details...</p>
              </div>
            ) : patientDetail ? (
              <>
                {/* Patient Header */}
                <div style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', padding: '24px', color: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 4px 0' }}>{patientDetail.patient?.full_name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>
                        {patientDetail.patient?.age}y · {patientDetail.patient?.gender} · {patientDetail.patient?.village || 'N/A'}, {patientDetail.patient?.district || 'N/A'}
                      </p>
                    </div>
                    <button onClick={() => { setSelectedPatient(null); setPatientDetail(null); }}
                      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                      ✕ Close
                    </button>
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  {/* Patient Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'Phone', value: patientDetail.patient?.phone || 'N/A', icon: '📞' },
                      { label: 'Email', value: patientDetail.patient?.email || 'N/A', icon: '📧' },
                      { label: 'Emergency', value: patientDetail.patient?.emergency_contact || 'N/A', icon: '🚨' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0 0 4px 0' }}>{item.icon} {item.label}</p>
                        <p style={{ color: '#1e293b', fontSize: '13px', fontWeight: '600', margin: 0, wordBreak: 'break-all' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Known Diseases & Allergies */}
                  {(patientDetail.patient?.known_diseases?.length > 0 || patientDetail.patient?.allergies?.length > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                      <div>
                        <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '13px', margin: '0 0 8px 0' }}>🩺 Known Diseases</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {patientDetail.patient?.known_diseases?.length > 0
                            ? patientDetail.patient.known_diseases.map((d, i) => (
                              <span key={i} style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>{d}</span>
                            ))
                            : <span style={{ color: '#94a3b8', fontSize: '12px' }}>None reported</span>
                          }
                        </div>
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '13px', margin: '0 0 8px 0' }}>⚠️ Allergies</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {patientDetail.patient?.allergies?.length > 0
                            ? patientDetail.patient.allergies.map((a, i) => (
                              <span key={i} style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>{a}</span>
                            ))
                            : <span style={{ color: '#94a3b8', fontSize: '12px' }}>None reported</span>
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Triage History */}
                  <div style={{ marginBottom: '16px' }}>
  <button
    onClick={() => updateFollowup(patientDetail.patient.id, "visited")}
    style={{
      background:"#16a34a",
      color:"#fff",
      border:"none",
      padding:"8px 14px",
      borderRadius:"8px",
      cursor:"pointer"
    }}
  >
    ✅ Mark as Visited
  </button>
</div>
                  <p style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px', margin: '0 0 12px 0' }}>📋 Triage History</p>
                  {patientDetail.triage_history?.length > 0 ? (
                    patientDetail.triage_history.slice(0, 5).map((t, i) => {
                      const style = getUrgencyStyle(t.urgency_level);
                      return (
                        <div key={i} style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ background: style.bg, color: style.color, padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>
                              {style.icon} {style.label}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>{t.created_at?.substring(0, 10)}</span>
                          </div>
                          <p style={{ color: '#374151', fontSize: '13px', margin: '6px 0 0 0' }}>{t.symptoms}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>No triage history</p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
      {successMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#16a34a',
          color: 'white',
          padding: '12px 18px',
          borderRadius: '10px',
          fontWeight: '700',
          zIndex: 3000
        }}>
          {successMsg}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '14px 18px', color: '#92400e', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
        <strong>⚠️ ASHA Worker Note:</strong> Patient data is confidential. Use this dashboard only for authorized healthcare purposes.
      </div>
    </div>
  );
}

export default AdminDashboard;
