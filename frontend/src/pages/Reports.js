import React, { useState, useEffect, useRef } from 'react';
import { reportAPI } from '../services/api';

const S = {
  page: {
    maxWidth: '1100px', margin: '0 auto', padding: '28px 24px',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  headerIcon: {
    width: '48px', height: '48px',
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    borderRadius: '14px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '24px',
    boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
  },
  grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
  card: {
    background: 'white', borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9',
    overflow: 'hidden',
  },
  cardHeader: (gradient) => ({
    background: gradient,
    padding: '18px 24px',
  }),
  cardHeaderTitle: { color: 'white', fontWeight: '800', fontSize: '16px', margin: 0 },
  cardBody: { padding: '24px' },
  dropZone: (drag, hasFile) => ({
    border: `3px dashed ${drag ? '#7c3aed' : hasFile ? '#059669' : '#c4b5fd'}`,
    borderRadius: '18px',
    padding: '40px 20px',
    textAlign: 'center',
    background: drag ? '#faf5ff' : hasFile ? '#f0fdf4' : '#fdfcff',
    cursor: 'pointer',
    transition: 'all 0.3s',
  }),
  submitBtn: (disabled) => ({
    width: '100%',
    background: disabled ? '#e2e8f0' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    color: disabled ? '#94a3b8' : 'white',
    border: 'none', borderRadius: '14px', padding: '16px',
    fontSize: '16px', fontWeight: '800', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit', marginTop: '16px',
    boxShadow: disabled ? 'none' : '0 6px 20px rgba(124,58,237,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  }),
  resultHeader: {
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    padding: '20px 24px', color: 'white',
  },
  summaryBox: {
    background: '#faf5ff', border: '1px solid #d8b4fe',
    borderRadius: '14px', padding: '18px', marginBottom: '16px',
  },
  riskBadge: (level) => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '800',
    background: level === 'high' ? '#fee2e2' : level === 'medium' ? '#fef3c7' : '#dcfce7',
    color: level === 'high' ? '#dc2626' : level === 'medium' ? '#d97706' : '#16a34a',
    border: `1px solid ${level === 'high' ? '#fca5a5' : level === 'medium' ? '#fde68a' : '#86efac'}`,
  }),
  suggestionItem: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: '12px', marginBottom: '8px',
  },
  abnormalItem: {
    background: 'white', border: '1px solid #fca5a5',
    borderRadius: '12px', padding: '14px', marginBottom: '8px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  medicineChip: {
    background: '#dbeafe', border: '1px solid #93c5fd', color: '#1d4ed8',
    padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
    display: 'inline-block', margin: '0 6px 6px 0',
  },
  reportItem: (selected) => ({
    padding: '14px', borderRadius: '14px', cursor: 'pointer', marginBottom: '8px',
    border: `2px solid ${selected ? '#7c3aed' : '#e2e8f0'}`,
    background: selected ? '#faf5ff' : 'white',
    transition: 'all 0.2s',
  }),
  docIcon: { fontSize: '24px', flexShrink: 0 },
  emptyState: { textAlign: 'center', padding: '40px 20px' },
  infoCard: {
    background: '#eff6ff', border: '1px solid #bfdbfe',
    borderRadius: '16px', padding: '18px', marginTop: '16px',
  },
};

const docIcons = {
  lab_report: '🔬', prescription: '💊',
  discharge_summary: '📋', radiology_report: '🩻', general_report: '📄',
};

function Reports() {
  const [file, setFile] = useState(null);
  const [reports, setReports] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const res = await reportAPI.getAll();
      setReports(res.data.reports || []);
    } catch (e) { } finally { setFetchLoading(false); }
  };

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(f.type)) { setError('Only PDF, JPG, PNG files allowed'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('File must be less than 10 MB'); return; }
    setFile(f); setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await reportAPI.upload(file);
      setResult(res.data.report);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed.');
    } finally { setLoading(false); }
  };

  const getRiskIcon = (level) => {
    if (level === 'high') return '🔴';
    if (level === 'medium') return '🟡';
    return '🟢';
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerIcon}>📄</div>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1e293b', margin: 0 }}>Medical Reports</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Upload your medical reports for AI- assisted health information</p>
        </div>
      </div>

      <div style={S.grid}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Upload Card */}
          <div style={S.card}>
            <div style={S.cardHeader('linear-gradient(135deg, #7c3aed, #4f46e5)')}>
              <p style={S.cardHeaderTitle}>📤 Upload New Report</p>
            </div>
            <div style={S.cardBody}>
              <form onSubmit={handleUpload}>
                <div
                  style={S.dropZone(dragOver, !!file)}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => handleFile(e.target.files[0])} />

                  {file ? (
                    <div>
                      <p style={{ fontSize: '48px', margin: '0 0 10px 0' }}>
                        {file.type === 'application/pdf' ? '📄' : '🖼'}
                      </p>
                      <p style={{ fontWeight: '800', color: '#059669', fontSize: '16px', margin: '0 0 4px 0' }}>{file.name}</p>
                      <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 12px 0' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button type="button"
                        onClick={e => { e.stopPropagation(); setFile(null); }}
                        style={{ background: 'none', border: '1px solid #fca5a5', color: '#dc2626', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '52px', margin: '0 0 12px 0' }}>📎</p>
                      <p style={{ fontWeight: '800', color: '#374151', fontSize: '16px', margin: '0 0 6px 0' }}>
                        Drag & drop your report or click to upload
                      </p>
                      <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 16px 0' }}>Supported: PDF, JPG, PNG (Max 10 MB)</p>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {['📄 Lab Report', '💊 Prescription', '🩻 X-Ray', '📋 Discharge Summary'].map(t => (
                          <span key={t} style={{ background: '#f1f5f9', color: '#64748b', padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{ background: '#fff1f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginTop: '12px' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button type="submit" disabled={!file || loading} style={S.submitBtn(!file || loading)}>
                  {loading ? (
                    <>
                      <div style={{ width: '18px', height: '18px', border: '3px solid rgba(124,58,237,0.3)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                      Analyzing with AI...
                    </>
                  ) : <><span>🔬</span> Upload & Get AI Insights</>}
                </button>
              </form>
            </div>
          </div>

          {/* Analysis Result */}
          {result && (
            <div style={S.card}>
              <div style={S.resultHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: 'white', fontWeight: '900', fontSize: '17px', margin: '0 0 4px 0' }}>
                      🔍 Report Analysis Complete!
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>
                      {docIcons[result.document_type] || '📄'} {result.document_type?.replace(/_/g, ' ')} · {result.file_name}
                    </p>
                  </div>
                  {result.risk_level && (
                    <span style={S.riskBadge(result.risk_level)}>
                      {getRiskIcon(result.risk_level)} Reorted Risk level: {result.risk_level?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div style={S.cardBody}>

                {/* AI Summary */}
                <div style={S.summaryBox}>
                  <p style={{ fontWeight: '800', color: '#6d28d9', margin: '0 0 10px 0', fontSize: '14px' }}>🤖 Report Summary</p>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#4c1d95', fontFamily: 'inherit', lineHeight: '1.7', margin: 0 }}>
                    {result.ai_summary}
                  </pre>
                </div>

                {/* Health Suggestions */}
                {result.ai_suggestions?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontWeight: '800', color: '#059669', margin: '0 0 10px 0', fontSize: '14px' }}>💡Helpful Health Information</p>
                    {result.ai_suggestions.map((s, i) => (
                      <div key={i} style={S.suggestionItem}>
                        <span style={{ color: '#059669', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>{i + 1}.</span>
                        <span style={{ color: '#166534', fontSize: '13px' }}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Diet & Lifestyle Advice */}
                {(result.diet_advice || result.lifestyle_advice) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    {result.diet_advice && (
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px' }}>
                        <p style={{ fontWeight: '800', color: '#92400e', fontSize: '13px', margin: '0 0 6px 0' }}>🥗 Diet Advice</p>
                        <p style={{ color: '#78350f', fontSize: '12px', margin: 0, lineHeight: '1.5' }}>{result.diet_advice}</p>
                      </div>
                    )}
                    {result.lifestyle_advice && (
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px' }}>
                        <p style={{ fontWeight: '800', color: '#1d4ed8', fontSize: '13px', margin: '0 0 6px 0' }}>🏃 Lifestyle Advice</p>
                        <p style={{ color: '#1e40af', fontSize: '12px', margin: 0, lineHeight: '1.5' }}>{result.lifestyle_advice}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Doctor Visit Advice */}
                {result.when_to_see_doctor && (
                  <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #93c5fd', borderRadius: '14px', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>👨‍⚕️</span>
                    <div>
                      <p style={{ fontWeight: '800', color: '#1d4ed8', margin: '0 0 4px 0', fontSize: '13px' }}>When to Seek Professional Care</p>
                      <p style={{ color: '#1e40af', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{result.when_to_see_doctor}</p>
                    </div>
                  </div>
                )}

                {/* Abnormal Values */}
                {result.abnormal_values?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontWeight: '800', color: '#dc2626', margin: '0 0 10px 0', fontSize: '14px' }}>⚠️ Values Requiring attention</p>
                    {result.abnormal_values.map((v, i) => (
                      <div key={i} style={S.abnormalItem}>
                        <div>
                          <p style={{ fontWeight: '700', color: '#1e293b', margin: '0 0 2px 0', fontSize: '14px' }}>{v.test}</p>
                          <p style={{ color: '#dc2626', fontWeight: '900', fontSize: '18px', margin: 0 }}>{v.value} {v.unit}</p>
                        </div>
                        <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '800' }}>
                          {v.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Medicines */}
                {result.medicines_found?.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontWeight: '800', color: '#1e293b', margin: '0 0 10px 0', fontSize: '14px' }}>💊 Medicines Mentioned in Report</p>
                    <div>
                      {result.medicines_found.map((m, i) => (
                        <span key={i} style={S.medicineChip}>{m}</span>
                      ))}
                    </div>
                     <p style={{
  color: '#64748b',
  fontSize: '11px',
  margin: '4px 0 0 0',
  lineHeight: '1.5'
}}>
  Medicine names are shown for information only. Follow your healthcare professional's advice.
</p>                 
                  </div>
                )}

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 14px', color: '#92400e', fontSize: '12px' }}>
                  ⚠️ AI analysis for reference only. Please consult your doctor for interpretation.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right - Past Reports */}
        <div>
          <div style={S.card}>
            <div style={S.cardHeader('linear-gradient(135deg, #374151, #1f2937)')}>
              <p style={S.cardHeaderTitle}>📁 Past Reports ({reports.length})</p>
            </div>
            <div style={{ padding: '16px' }}>
              {fetchLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} style={{ height: '64px', background: '#f1f5f9', borderRadius: '12px', marginBottom: '8px' }}></div>
                ))
              ) : reports.length === 0 ? (
                <div style={S.emptyState}>
                  <p style={{ fontSize: '44px', margin: '0 0 12px 0' }}>📭</p>
                  <p style={{ fontWeight: '700', color: '#374151', margin: '0 0 4px 0' }}>No reports yet</p>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Your uploaded reports will appear here</p>
                </div>
              ) : (
                reports.map((report, i) => (
                  <div key={i}
                    style={S.reportItem(selected?.id === report.id)}
                    onClick={() => setSelected(selected?.id === report.id ? null : report)}
                    onMouseEnter={e => { if (selected?.id !== report.id) e.currentTarget.style.borderColor = '#c4b5fd'; }}
                    onMouseLeave={e => { if (selected?.id !== report.id) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={S.docIcon}>{docIcons[report.document_type] || '📄'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '13px', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {report.file_name}
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>
                          {report.created_at
  ? new Date(report.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  : '—'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '700', textTransform: 'capitalize' }}>
                          {report.document_type?.replace(/_/g, ' ')}
                        </span>
                        {report.risk_level && (
                          <span style={{
                            fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '6px',
                            background: report.risk_level === 'high' ? '#fee2e2' : report.risk_level === 'medium' ? '#fef3c7' : '#dcfce7',
                            color: report.risk_level === 'high' ? '#dc2626' : report.risk_level === 'medium' ? '#d97706' : '#16a34a'
                          }}>
                            {getRiskIcon(report.risk_level)} {report.risk_level}
                          </span>
                        )}
                      </div>
                    </div>

                    {selected?.id === report.id && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e9d5ff' }}>
                        <p style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '700', margin: '0 0 6px 0' }}>AI Summary:</p>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                          {report.ai_summary?.substring(0, 300)}...
                        </p>
                        {report.ai_suggestions?.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <p style={{ fontSize: '11px', color: '#059669', fontWeight: '700', margin: '0 0 4px 0' }}>Helpful Information:</p>
                            {report.ai_suggestions.slice(0, 3).map((s, j) => (
                              <p key={j} style={{ fontSize: '11px', color: '#166534', margin: '0 0 2px 0' }}>• {s}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info Card */}
          <div style={S.infoCard}>
            <p style={{ fontWeight: '800', color: '#1d4ed8', fontSize: '14px', margin: '0 0 12px 0' }}>ℹ️ Supported Reports</p>
            {[
              { icon: '🔬', text: 'Blood & Lab Reports (PDF)' },
              { icon: '💊', text: 'Doctor Prescriptions (JPG/PNG)' },
              { icon: '📋', text: 'Discharge Summaries (PDF)' },
              { icon: '🩻', text: 'X-Ray & Scan Reports (JPG/PNG)' },
            ].map((item, i) => (
              <p key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1d4ed8', fontSize: '13px', margin: '0 0 8px 0' }}>
                <span>{item.icon}</span> {item.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;