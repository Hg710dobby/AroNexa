import React, { useState, useRef, useEffect } from 'react';
import { triageAPI, userAPI } from '../services/api';

const S = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '28px 24px',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '8px',
  },
  headerIcon: {
    width: '48px', height: '48px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px',
    boxShadow: '0 6px 20px rgba(59,130,246,0.35)',
  },
  headerTitle: { fontSize: '26px', fontWeight: '900', color: '#1e293b', margin: 0 },
  headerSub: { color: '#64748b', fontSize: '14px', margin: 0 },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '20px 0',
  },
  stepActive: {
    padding: '8px 20px',
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
  },
  stepInactive: {
    padding: '8px 20px',
    background: '#f1f5f9',
    color: '#94a3b8',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '600',
  },
  progressLine: { flex: 1, height: '2px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' },
  progressFill: (filled) => ({
    height: '100%',
    width: filled ? '100%' : '0%',
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    transition: 'width 0.5s ease',
  }),
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
    border: '1px solid #f1f5f9',
    overflow: 'hidden',
  },
  cardSection: {
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9',
  },
  sectionLabel: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#374151',
    margin: '0 0 14px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  langGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
  },
  langBtn: (active) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 4px',
    borderRadius: '12px',
    border: active ? '2px solid #059669' : '2px solid #e2e8f0',
    background: active ? '#f0fdf4' : 'white',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '700',
    color: active ? '#166534' : '#64748b',
    transition: 'all 0.2s',
  }),
  textarea: {
    width: '100%',
    border: '2px solid #e2e8f0',
    borderRadius: '14px',
    padding: '14px 16px',
    fontSize: '14px',
    color: '#1e293b',
    resize: 'none',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  voiceBtn: (listening) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '12px',
    border: listening ? 'none' : '2px solid #bfdbfe',
    background: listening ? '#dc2626' : '#eff6ff',
    color: listening ? 'white' : '#1d4ed8',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  }),
  locationInfo: {
    padding: '12px 24px',
    background: '#f8fafc',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '13px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  submitSection: { padding: '20px 24px' },
  errorBox: {
    background: '#fff1f2',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    marginBottom: '14px',
  },
  submitBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(5,150,105,0.35)',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sampleCard: {
    background: 'white',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  },
  sampleBtn: {
    width: '100%',
    textAlign: 'left',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '12px',
    color: '#374151',
    cursor: 'pointer',
    marginBottom: '8px',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    lineHeight: '1.4',
  },
  tipCard: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    padding: '18px',
  },
  disclaimerCard: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '14px',
    padding: '14px 16px',
  },
  resultSection: { marginTop: '28px' },
  urgencyBanner: (gradient) => ({
    background: gradient,
    borderRadius: '20px',
    padding: '24px 28px',
    color: 'white',
    marginBottom: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  }),
  urgencyInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  urgencyIconBox: {
    width: '64px', height: '64px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '18px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '36px',
    marginRight: '20px',
  },
  urgencyTitle: { fontSize: '32px', fontWeight: '900', margin: '0 0 4px 0' },
  urgencySub: { color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 },
  listenBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: '700',
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  progressBarWrap: {
    height: '8px',
    background: 'rgba(255,255,255,0.25)',
    borderRadius: '999px',
    overflow: 'hidden',
    marginTop: '16px',
  },
  progressBarFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: 'white',
    borderRadius: '999px',
    transition: 'width 1s ease',
  }),
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  resultCard: {
    background: 'white',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  },
  resultCardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  resultCardIcon: (bg) => ({
    width: '32px', height: '32px',
    background: bg,
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px',
  }),
  resultCardLabel: { fontWeight: '800', color: '#1e293b', fontSize: '14px', margin: 0 },
  chip: (bg, border, color) => ({
    display: 'inline-block',
    background: bg,
    border: `1px solid ${border}`,
    color: color,
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
    marginRight: '6px',
    marginBottom: '6px',
  }),
  medCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '14px',
    marginBottom: '10px',
  },
  otcBadge: {
    background: '#dcfce7',
    color: '#166534',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
    marginTop: '6px',
  },
  rxBadge: {
    background: '#fed7aa',
    color: '#9a3412',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
    marginTop: '6px',
  },
  doctorBox: {
    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    border: '1px solid #93c5fd',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '16px',
  },
  hospitalCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '10px',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  newCheckBtn: {
    display: 'block',
    width: '100%',
    background: '#f1f5f9',
    color: '#374151',
    border: 'none',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '16px',
    fontFamily: 'inherit',
    textAlign: 'center',
  },
};

const languages = [
  { code: 'english', label: 'English', flag: '🇬🇧', speech: 'en-IN' },
  { code: 'hindi', label: 'हिंदी', flag: '🇮🇳', speech: 'hi-IN' },
  { code: 'gujarati', label: 'ગુજરાતી', flag: '🇮🇳', speech: 'gu-IN' },
  { code: 'tamil', label: 'தமிழ்', flag: '🇮🇳', speech: 'ta-IN' },
  { code: 'marathi', label: 'मराठी', flag: '🇮🇳', speech: 'mr-IN' },
];

const sampleSymptoms = [
  'I have high fever since 2 days with headache and body pain',
  'Chest pain and difficulty breathing since morning',
  'Stomach pain, vomiting and loose motions',
  'Mild cold, runny nose and sneezing for 2 days',
  'Joint pain and extreme weakness for 3 days',
];

const getUrgencyConfig = (level) => {
  if (level === 'emergency') return {
    gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    icon: '🚨', label: 'EMERGENCY',
    shadow: '0 10px 40px rgba(220,38,38,0.4)',
  };
  if (level === 'visit-clinic') return {
    gradient: 'linear-gradient(135deg, #d97706, #b45309)',
    icon: '🏥', label: 'VISIT CLINIC',
    shadow: '0 10px 40px rgba(217,119,6,0.4)',
  };
  return {
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    icon: '🏠', label: 'SELF-CARE',
    shadow: '0 10px 40px rgba(5,150,105,0.4)',
  };
};

function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [language, setLanguage] = useState('english');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('detecting'); // detecting, granted, denied, ip_fallback
  const [step, setStep] = useState(1);
  const recognitionRef = useRef(null);
  const resultRef = useRef(null);

  const detectLocation = async () => {
    setLocationStatus('detecting');
    
    // 1. Try Browser Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setLocationStatus('granted');
        },
        async (err) => {
          console.warn('Geolocation error:', err.message);
          
          let profileLocationFound = false;
          
          // 2. Try User Profile Fallback (if logged in)
          try {
            const profileRes = await userAPI.getProfile();
            const profile = profileRes.data.profile || profileRes.data;
            if (profile.latitude && profile.longitude) {
              setLocation({ latitude: profile.latitude, longitude: profile.longitude });
              setLocationStatus('ip_fallback'); 
              profileLocationFound = true;
            }
          } catch (profileErr) {
            console.warn('Profile fetch failed:', profileErr);
          }

          if (!profileLocationFound) {
            // 3. Try IP-based geolocation
            try {
              const ipRes = await fetch('https://ipapi.co/json/');
              const data = await ipRes.json();
              if (data.latitude && data.longitude) {
                setLocation({ latitude: data.latitude, longitude: data.longitude });
                setLocationStatus('ip_fallback');
              } else {
                throw new Error("IP location failed");
              }
            } catch (ipErr) {
              setLocationStatus('denied');
            }
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      setLocationStatus('denied');
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported. Please use Google Chrome.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;
    const langMap = { english: 'en-IN', hindi: 'hi-IN', gujarati: 'gu-IN', tamil: 'ta-IN', marathi: 'mr-IN' };
    recognition.lang = langMap[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = e => {
      const text = e.results[0][0].transcript;
      setSymptoms(prev => prev ? prev + ' ' + text : text);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const speechLangMap = { english: 'en-IN', hindi: 'hi-IN', gujarati: 'gu-IN', tamil: 'ta-IN', marathi: 'mr-IN' };
      u.lang = speechLangMap[language] || 'en-IN';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await triageAPI.textTriage({
        symptoms, language, input_type: 'text',
        latitude: location?.latitude, longitude: location?.longitude,
      });
      setResult(res.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerIcon}>🩺</div>
        <div>
          <h1 style={S.headerTitle}>AI Symptom Checker</h1>
          <p style={S.headerSub}>Describe symptoms and get instant AI health guidance</p>
        </div>
      </div>

      {/* Progress */}
      <div style={S.progressRow}>
        <div style={step >= 1 ? S.stepActive : S.stepInactive}>1 · Describe</div>
        <div style={S.progressLine}><div style={S.progressFill(step >= 2)}></div></div>
        <div style={step >= 2 ? S.stepActive : S.stepInactive}>2 · Results</div>
      </div>

      {/* Main Grid */}
      <div style={S.mainGrid}>

        {/* Left - Input Form */}
        <div style={S.card}>
          {/* Language */}
          <div style={S.cardSection}>
            <p style={S.sectionLabel}>🌐 Select Language</p>
            <div style={S.langGrid}>
              {languages.map(lang => (
                <button key={lang.code} onClick={() => setLanguage(lang.code)}
                  style={S.langBtn(language === lang.code)}>
                  <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div style={S.cardSection}>
            <p style={S.sectionLabel}>📝Tell Us your symptoms , when they started, and how you feel...</p>
            <textarea
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              rows={5}
              style={S.textarea}
              placeholder="Example: I have high fever since 2 days, severe headache, body aches and feeling very weak..."
              onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <button onClick={isListening ? stopListening : startListening}
                style={S.voiceBtn(isListening)}>
                {isListening ? (
                  <><span style={{ width: '10px', height: '10px', background: 'white', borderRadius: '2px', display: 'inline-block' }}></span> Stop Listening </>
                ) : (
                  <><span>🎤</span> Speak Symptoms </>
                )}
              </button>
              {isListening && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '13px' }}>
                  <span style={{ width: '8px', height: '8px', background: '#dc2626', borderRadius: '50%', animation: 'pulse 1s infinite', display: 'inline-block' }}></span>
                  Listening...
                </div>
              )}
              {symptoms && (
                <button onClick={() => setSymptoms('')}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px' }}>
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Location */}
          <div style={{
            ...S.locationInfo,
            background: locationStatus === 'granted' ? '#f0fdf4' : locationStatus === 'ip_fallback' ? '#fffbeb' : locationStatus === 'denied' ? '#fff1f2' : '#f8fafc',
            borderBottom: `1px solid ${locationStatus === 'granted' ? '#86efac' : locationStatus === 'ip_fallback' ? '#fde68a' : locationStatus === 'denied' ? '#fca5a5' : '#f1f5f9'}`,
          }}>
            <span>📍</span>
            <span style={{
              color: locationStatus === 'granted' ? '#059669' : locationStatus === 'ip_fallback' ? '#d97706' : locationStatus === 'denied' ? '#dc2626' : '#94a3b8',
              fontWeight: '600', flex: 1,
            }}>
              {locationStatus === 'detecting' && 'Detecting your location...'}
              {locationStatus === 'granted' && `GPS Location: ${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E — nearby hospitals will be shown`}
              {locationStatus === 'ip_fallback' && `Using approximate location (${location.latitude.toFixed(2)}°N) — for accurate results, allow GPS access`}
              {locationStatus === 'denied' && 'Location not available — enable GPS for nearby hospital recommendations'}
            </span>
            {(locationStatus === 'denied' || locationStatus === 'ip_fallback') && (
              <button onClick={detectLocation} style={{
                background: '#059669', color: 'white', border: 'none', padding: '5px 12px',
                borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>
                📍 Retry GPS
              </button>
            )}
            {locationStatus === 'granted' && (
              <span style={{ color: '#059669', fontSize: '12px', fontWeight: '700' }}>✓ GPS</span>
            )}
          </div>

          {/* Submit */}
          <div style={S.submitSection}>
            {error && <div style={S.errorBox}>⚠️ {error}</div>}
            <button
              onClick={handleSubmit}
              disabled={loading || !symptoms.trim()}
              style={{ ...S.submitBtn, opacity: loading || !symptoms.trim() ? 0.6 : 1, cursor: loading || !symptoms.trim() ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <>
                  <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.4)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                  Analyzing Symptoms...
                </>
              ) : (
                <><span>🔍</span> Check Symptoms with AI</>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div style={S.rightPanel}>
          {/* Sample Symptoms */}
          <div style={S.sampleCard}>
            <p style={{ fontWeight: '800', fontSize: '14px', color: '#374151', margin: '0 0 6px 0' }}>💬 Quick Examples</p>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 12px 0' }}>Click to try an example:</p>
            {sampleSymptoms.map((s, i) => (
              <button key={i} onClick={() => setSymptoms(s)} style={S.sampleBtn}
                onMouseEnter={e => { e.target.style.background = '#f0fdf4'; e.target.style.borderColor = '#86efac'; e.target.style.color = '#166534'; }}
                onMouseLeave={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.color = '#374151'; }}>
                "{s}"
              </button>
            ))}
          </div>

          {/* Tips */}
          <div style={S.tipCard}>
            <p style={{ fontWeight: '800', color: '#1d4ed8', fontSize: '13px', margin: '0 0 10px 0' }}>ℹ️ Better Results Tips</p>
            {['Mention when it started', 'Describe severity (mild/severe)', 'List all symptoms', 'Include medical history'].map((tip, i) => (
              <p key={i} style={{ color: '#1d4ed8', fontSize: '12px', margin: '0 0 6px 0' }}>• {tip}</p>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={S.disclaimerCard}>
            <p style={{ fontWeight: '800', color: '#92400e', fontSize: '12px', margin: '0 0 4px 0' }}>⚠️ Disclaimer</p>
            <p style={{ color: '#78350f', fontSize: '11px', margin: 0 }}>AI guidance is for information only, not a medical diagnosis. Consult a healthcare professional when needed.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div ref={resultRef} style={S.resultSection}>
          {(() => {
            const cfg = getUrgencyConfig(result.urgency_level);
            return (
              <div style={{ ...S.urgencyBanner(cfg.gradient), boxShadow: cfg.shadow }}>
                <div style={S.urgencyInner}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={S.urgencyIconBox}>{cfg.icon}</div>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '0 0 4px 0' }}>AI Triage Result</p>
                      <h2 style={S.urgencyTitle}>{cfg.label}</h2>
                      <p style={S.urgencySub}>AI assesment based on the syptoms you provided</p>
                    </div>
                  </div>
                  <button onClick={() => speakText(`Your triage level is ${result.urgency_level}. ${result.when_to_see_doctor}`)}
                    style={S.listenBtn}>
                    <span style={{ fontSize: '22px' }}>🔊</span>
                    <span>Listen</span>
                  </button>
                </div>
                <div style={S.progressBarWrap}>
                  <div style={S.progressBarFill(result.confidence * 100)}></div>
                </div>
              </div>
            );
          })()}

          {/* Results Grid */}
          <div style={S.resultsGrid}>

            {/* Detected Symptoms */}
            <div style={S.resultCard}>
              <div style={S.resultCardTitle}>
                <div style={S.resultCardIcon('#dbeafe')}>🔍</div>
                <p style={S.resultCardLabel}>Detected Symptoms</p>
              </div>
              <div>
                {result.extracted_symptoms?.length > 0
                  ? result.extracted_symptoms.map((s, i) => (
                      <span key={i} style={S.chip('#dbeafe', '#93c5fd', '#1d4ed8')}>{s}</span>
                    ))
                  : <span style={{ color: '#94a3b8', fontSize: '13px' }}>General symptoms analyzed</span>
                }
              </div>
            </div>

            {/* Possible Conditions */}
            <div style={S.resultCard}>
              <div style={S.resultCardTitle}>
                <div style={S.resultCardIcon('#e9d5ff')}>🏥</div>
                <p style={S.resultCardLabel}>Possible Health Conditions</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {result.possible_conditions?.map((c, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#7c3aed', borderRadius: '50%', flexShrink: 0 }}></span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div style={S.resultCard}>
              <div style={S.resultCardTitle}>
                <div style={S.resultCardIcon('#dcfce7')}>✅</div>
                <p style={S.resultCardLabel}>Recommendations</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {result.recommendations?.map((r, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#374151', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ color: '#059669', fontWeight: '700', flexShrink: 0 }}>→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Precautions */}
            <div style={S.resultCard}>
              <div style={S.resultCardTitle}>
                <div style={S.resultCardIcon('#fef3c7')}>⚠️</div>
                <p style={S.resultCardLabel}>Precautions</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {result.precautions?.slice(0, 5).map((p, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#374151', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ color: '#d97706', flexShrink: 0 }}>•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Medicines */}
          {result.medicines_info?.length > 0 && (
            <div style={{ ...S.resultCard, marginBottom: '16px' }}>
              <div style={S.resultCardTitle}>
                <div style={S.resultCardIcon('#fce7f3')}>💊</div>
                <p style={S.resultCardLabel}>Medicine Information</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {result.medicines_info.map((med, i) => (
                  <div key={i} style={S.medCard}>
                    <p style={{ fontWeight: '800', color: '#1e293b', fontSize: '13px', margin: '0 0 6px 0' }}>{med.name}</p>
                    <span style={med.type === 'OTC' ? S.otcBadge : S.rxBadge}>
  {med.type === 'OTC' ? '🏪 General Information' : '📋 Prescription Medicine'}
</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Advice */}
          <div style={S.doctorBox}>
            <div style={{ width: '40px', height: '40px', background: '#bfdbfe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>👨‍⚕️</div>
            <div>
              <p style={{ fontWeight: '800', color: '#1d4ed8', margin: '0 0 6px 0', fontSize: '14px' }}>Doctor Visit Advice</p>
              <p style={{ color: '#1e40af', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{result.when_to_see_doctor}</p>
            </div>
          </div>

          {/* Nearby Hospitals */}
          {result.nearby_hospitals?.length > 0 && (
            <div style={{ ...S.resultCard, marginBottom: '16px' }}>
              <div style={S.resultCardTitle}>
                <div style={S.resultCardIcon('#dcfce7')}>🏨</div>
                <p style={S.resultCardLabel}>Nearby Hospitals ({result.nearby_hospitals.length})</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {result.nearby_hospitals.slice(0, 4).map((h, i) => (
                  <div key={i} style={S.hospitalCard}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#86efac'; e.currentTarget.style.background = '#f0fdf4'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontWeight: '800', color: '#1e293b', fontSize: '13px', margin: '0 0 2px 0' }}>{h.name}</p>
                        <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>{h.hospital_type}</p>
                      </div>
                      <p style={{ fontWeight: '900', color: '#059669', fontSize: '15px', margin: 0 }}>{h.distance_km}km</p>
                    </div>
                    {h.emergency_available && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: '700' }}>🚨 Emergency Available</span>}
                    {h.phone && (
                      <a href={`tel:${h.phone}`} style={{ display: 'block', color: '#059669', fontSize: '12px', fontWeight: '600', marginTop: '6px', textDecoration: 'none' }}>
                        📞 {h.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '14px 18px', color: '#92400e', fontSize: '13px', marginBottom: '16px' }}>
            <strong>⚠️ Important:</strong> {result.disclaimer}
          </div>

          {/* New Check Button */}
          <button style={S.newCheckBtn}
            onClick={() => { setResult(null); setSymptoms(''); setStep(1); window.scrollTo(0, 0); }}>
            🔄 Check New Symptoms
          </button>
        </div>
      )}
    </div>
  );
}

export default SymptomChecker;