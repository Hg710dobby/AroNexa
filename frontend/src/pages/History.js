import React, { useState, useEffect } from 'react';
import { triageAPI } from '../services/api';
import { Link } from 'react-router-dom';

const S = {
  page: {
    maxWidth: '900px', margin: '0 auto', padding: '28px 24px',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  header: { display: 'flex', alignItems: 'center', gap: '16px' },
  headerIcon: {
    width: '48px', height: '48px',
    background: 'linear-gradient(135deg, #ea580c, #c2410c)',
    borderRadius: '14px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '24px',
    boxShadow: '0 6px 20px rgba(234,88,12,0.35)',
  },
  newBtn: {
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white', textDecoration: 'none',
    padding: '10px 20px', borderRadius: '12px',
    fontWeight: '800', fontSize: '14px',
    boxShadow: '0 4px 12px rgba(5,150,105,0.35)',
    display: 'flex', alignItems: 'center', gap: '6px',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px', marginBottom: '20px',
  },
  statCard: (bg, border) => ({
    background: bg, border: `2px solid ${border}`,
    borderRadius: '14px', padding: '16px', textAlign: 'center',
  }),
  filterRow: {
    display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap',
  },
  filterBtn: (active) => ({
    padding: '8px 18px', borderRadius: '999px',
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: '13px', fontWeight: '700',
    background: active ? 'linear-gradient(135deg, #059669, #047857)' : '#f1f5f9',
    color: active ? 'white' : '#64748b',
    boxShadow: active ? '0 4px 12px rgba(5,150,105,0.3)' : 'none',
    transition: 'all 0.2s',
  }),
  recordCard: (bg, border) => ({
    background: bg, borderLeft: `5px solid ${border}`,
    borderRadius: '16px', marginBottom: '12px',
    overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
    transition: 'all 0.3s',
  }),
  recordHeader: {
    padding: '16px 20px', cursor: 'pointer',
    display: 'flex', alignItems: 'flex-start', gap: '12px',
  },
  urgencyBadge: (bg, color) => ({
    background: bg, color: color,
    padding: '4px 12px', borderRadius: '999px',
    fontSize: '11px', fontWeight: '800',
    display: 'inline-block',
  }),
  chip: {
    background: 'rgba(255,255,255,0.6)',
    color: '#374151', padding: '3px 10px',
    borderRadius: '999px', fontSize: '11px', fontWeight: '600',
    display: 'inline-block', margin: '0 4px 4px 0',
    border: '1px solid rgba(0,0,0,0.1)',
  },
  expandedBody: {
    padding: '0 20px 18px',
    borderTop: '1px solid rgba(255,255,255,0.5)',
    paddingTop: '14px',
  },
  expandGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
  expandBox: (bg) => ({
    background: bg, borderRadius: '12px', padding: '14px',
  }),
  emptyState: { textAlign: 'center', padding: '60px 20px' },
};

const urgencyConfig = {
  emergency: { bg: '#fff1f2', border: '#ef4444', badgeBg: '#fee2e2', badgeColor: '#dc2626', icon: '🚨', text: 'Emergency' },
  'visit-clinic': { bg: '#fffbeb', border: '#f59e0b', badgeBg: '#fef3c7', badgeColor: '#d97706', icon: '🏥', text: 'Visit Clinic' },
  'self-care': { bg: '#f0fdf4', border: '#22c55e', badgeBg: '#dcfce7', badgeColor: '#16a34a', icon: '🏠', text: 'Self-Care' },
};

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await triageAPI.getHistory();
        setHistory(res.data.history || []);
      } catch (e) { } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const counts = {
    all: history.length,
    emergency: history.filter(h => h.urgency_level === 'emergency').length,
    'visit-clinic': history.filter(h => h.urgency_level === 'visit-clinic').length,
    'self-care': history.filter(h => h.urgency_level === 'self-care').length,
  };

  const filtered = filter === 'all' ? history : history.filter(h => h.urgency_level === filter);

  if (loading) {
    return (
      <div style={S.page}>
        <div style={{ height: '36px', background: '#f1f5f9', borderRadius: '10px', width: '200px', marginBottom: '24px' }}></div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: '80px', background: '#f1f5f9', borderRadius: '16px', marginBottom: '12px' }}></div>
        ))}
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* Top Row */}
      <div style={S.topRow}>
        <div style={S.header}>
          <div style={S.headerIcon}>📋</div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1e293b', margin: 0 }}>Symptom Check History</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{history.length} symptom records</p>
          </div>
        </div>
        <Link to="/symptom-checker" style={S.newBtn}>+ New Checkup</Link>
      </div>

      {/* Stats */}
      <div style={S.statsGrid}>
        {[
          { key: 'all', label: 'Total', bg: '#f8fafc', border: '#e2e8f0', color: '#1e293b' },
          { key: 'self-care', label: 'Self-Care', bg: '#f0fdf4', border: '#86efac', color: '#16a34a' },
          { key: 'visit-clinic', label: 'Clinic Visits', bg: '#fffbeb', border: '#fde68a', color: '#d97706' },
          { key: 'emergency', label: 'Emergencies', bg: '#fff1f2', border: '#fca5a5', color: '#dc2626' },
        ].map(s => (
          <div key={s.key} style={S.statCard(s.bg, s.border)}>
            <p style={{ fontSize: '28px', fontWeight: '900', color: s.color, margin: '0 0 4px 0' }}>{counts[s.key]}</p>
            <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={S.filterRow}>
        {[
          { key: 'all', label: `All (${counts.all})` },
          { key: 'self-care', label: `🏠 Self-Care (${counts['self-care']})` },
          { key: 'visit-clinic', label: `🏥 Clinic (${counts['visit-clinic']})` },
          { key: 'emergency', label: `🚨 Emergency (${counts.emergency})` },
        ].map(f => (
          <button key={f.key} style={S.filterBtn(filter === f.key)} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* History List */}
      {filtered.length === 0 ? (
        <div style={S.emptyState}>
          <p style={{ fontSize: '56px', margin: '0 0 16px 0' }}>📭</p>
          <h3 style={{ fontWeight: '800', color: '#374151', fontSize: '20px', margin: '0 0 8px 0' }}>No records found</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0' }}>Your Symptom checkup history will appear here</p>
          <Link to="/symptom-checker" style={{
            background: 'linear-gradient(135deg, #059669, #047857)', color: 'white',
            padding: '12px 28px', borderRadius: '14px', textDecoration: 'none',
            fontWeight: '800', fontSize: '15px',
          }}>🩺 Check Symptoms</Link>
        </div>
      ) : (
        filtered.map((record, i) => {
          const cfg = urgencyConfig[record.urgency_level] || urgencyConfig['self-care'];
          const isExpanded = expanded === i;
          return (
            <div key={i} style={S.recordCard(cfg.bg, cfg.border)}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={S.recordHeader} onClick={() => setExpanded(isExpanded ? null : i)}>
                <span style={{ fontSize: '28px' }}>{cfg.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={S.urgencyBadge(cfg.badgeBg, cfg.badgeColor)}>{cfg.text}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      AI assesment
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
  {record.input_type === 'voice'
    ? '🎙️ Voice input'
    : record.input_type === 'text'
      ? '⌨️ Text input'
      : '📝 Symptom check'}
</span>
                   {record.language && (
  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
    🌐 {record.language}
  </span>
)}
                   {record.latitude && record.longitude && (
  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
    📍 Location used
  </span>
)}
                  </div>
                  <p style={{ color: '#374151', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis',  }}>
                    "{record.symptoms}"
                  </p>
                  <div>
                    {record.extracted_symptoms?.slice(0, 3).map((s, j) => (
                      <span key={j} style={S.chip}>{s}</span>
                    ))}
                    {record.extracted_symptoms?.length > 3 && (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>+{record.extracted_symptoms.length - 3} more</span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontWeight: '700', color: '#374151', fontSize: '13px', margin: '0 0 2px 0' }}>
                  {record.created_at ? new Date(record.created_at).toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
}) : '—'}
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0' }}>
                    {record.created_at ? new Date(record.created_at).toLocaleTimeString('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
}) : '—'}
                  </p>
                  <span style={{ fontSize: '18px', color: '#94a3b8' }}>
  {isExpanded ? '▲' : '▼'}
</span>
                </div>
              </div>

              {isExpanded && (
                <div style={S.expandedBody}>
                  <div style={{
  background: 'rgba(255,255,255,0.7)',
  borderRadius: '12px',
  padding: '12px 16px',
  marginBottom: '12px'
}}>
  <p style={{
    fontWeight: '800',
    color: '#374151',
    fontSize: '13px',
    margin: '0 0 6px 0'
  }}>
    Symptoms Provided:
  </p>
  <p style={{
    color: '#475569',
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.6'
  }}>
    {record.symptoms || 'No symptom details available.'}
  </p>
</div>
                  <div style={S.expandGrid}>
                    <div style={S.expandBox('rgba(255,255,255,0.7)')}>
                      <p style={{ fontWeight: '800', color: '#374151', fontSize: '13px', margin: '0 0 8px 0' }}> Health Information :</p>
                      {record.possible_conditions?.map((c, j) => (
                        <p key={j} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '12px', margin: '0 0 4px 0' }}>
                          <span style={{ width: '5px', height: '5px', background: '#94a3b8', borderRadius: '50%', flexShrink: 0, display: 'inline-block' }}></span>
                          {c}
                        </p>
                      ))}
                    </div>
                    <div style={S.expandBox('rgba(255,255,255,0.7)')}>
                      <p style={{ fontWeight: '800', color: '#374151', fontSize: '13px', margin: '0 0 8px 0' }}>Helpful Guidance:</p>
                      {record.recommendations?.slice(0, 3).map((r, j) => (
                        <p key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#475569', fontSize: '12px', margin: '0 0 4px 0' }}>
                          <span style={{ color: '#059669', fontWeight: '700', flexShrink: 0 }}>→</span>
                          {r}
                        </p>
                      ))}
                    </div>
                  </div>

                  {record.precautions?.length > 0 && (
  <div style={{
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '12px'
  }}>
    <p style={{
      fontWeight: '800',
      color: '#374151',
      fontSize: '13px',
      margin: '0 0 6px 0'
    }}>
      Precautions:
    </p>

    {record.precautions.slice(0, 4).map((p, j) => (
      <p key={j} style={{
        color: '#475569',
        fontSize: '12px',
        margin: '0 0 4px 0',
        lineHeight: '1.5'
      }}>
        • {p}
      </p>
    ))}
  </div>
)}

                {record.medicines_info?.length > 0 && (
  <div style={{
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '12px'
  }}>
    <p style={{
      fontWeight: '800',
      color: '#374151',
      fontSize: '13px',
      margin: '0 0 8px 0'
    }}>
      Medicine Information:
    </p>

    {record.medicines_info.slice(0, 4).map((med, j) => (
      <p key={j} style={{
        color: '#475569',
        fontSize: '12px',
        margin: '0 0 5px 0',
        lineHeight: '1.5'
      }}>
        • {typeof med === 'string' ? med : med.name}
      </p>
    ))}

    <p style={{
      color: '#64748b',
      fontSize: '11px',
      margin: '8px 0 0 0'
    }}>
      For information only. Consult a healthcare professional before using any medicine.
    </p>
  </div>
)}
                  <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '12px 16px' }}>
                    <p style={{ fontWeight: '800', color: '#374151', fontSize: '13px', margin: '0 0 6px 0' }}>When to Seek Professional Care:</p>
                    <p style={{ color: '#475569', fontSize: '12px', margin: 0, lineHeight: '1.6' }}>{record.when_to_see_doctor}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default History;