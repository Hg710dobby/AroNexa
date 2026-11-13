import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const S = {
  page:{minHeight:'100vh',background:'linear-gradient(135deg,#f0fdf4,#ecfdf5,#f0fdfa)',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:"'Segoe UI', Roboto, sans-serif"},
  container:{width:'100%',maxWidth:'440px'},
  logoSection:{textAlign:'center',marginBottom:'32px'},
  logoIcon:{width:'64px',height:'64px',background:'linear-gradient(135deg,#059669,#0891b2)',borderRadius:'20px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'32px',margin:'0 auto 16px',boxShadow:'0 8px 25px rgba(5,150,105,.35)'},
  logoTitle:{fontSize:'28px',fontWeight:'900',color:'#1e293b',margin:'0 0 6px'},
  logoSub:{color:'#64748b',fontSize:'14px',margin:0},
  card:{background:'#fff',borderRadius:'24px',boxShadow:'0 20px 60px rgba(0,0,0,.12)',overflow:'hidden',border:'1px solid #f1f5f9'},
  roleTabs:{display:'grid',gridTemplateColumns:'1fr 1fr'},
  roleTab:(a,p)=>({padding:'18px 16px',textAlign:'center',cursor:'pointer',fontWeight:'800',fontSize:'14px',border:'none',background:a?(p?'linear-gradient(135deg,#7c3aed,#5b21b6)':'linear-gradient(135deg,#059669,#0891b2)'):'#f8fafc',color:a?'#fff':'#94a3b8',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}),
  body:{padding:'28px'},
  error:{background:'#fff1f2',border:'1px solid #fca5a5',color:'#dc2626',padding:'12px',borderRadius:'12px',marginBottom:'18px'},
  info:p=>({background:p?'#faf5ff':'#f0fdf4',border:`1px solid ${p?'#e9d5ff':'#bbf7d0'}`,borderRadius:'12px',padding:'12px',marginBottom:'18px',color:p?'#6d28d9':'#166534',fontSize:'13px'}),
  label:{display:'block',fontSize:'11px',fontWeight:'700',color:'#64748b',marginBottom:'8px'},
  input:{width:'100%',border:'2px solid #e2e8f0',borderRadius:'12px',padding:'14px 16px',fontSize:'15px',boxSizing:'border-box',marginBottom:'18px',outline:'none'},
  btn:p=>({width:'100%',background:p?'linear-gradient(135deg,#7c3aed,#5b21b6)':'linear-gradient(135deg,#059669,#047857)',color:'#fff',border:'none',borderRadius:'14px',padding:'16px',fontSize:'16px',fontWeight:'800',cursor:'pointer',marginBottom:'18px'}),
  link:{color:'#059669',fontWeight:'700',textDecoration:'none'},
  emergency:{background:'#fff1f2',border:'1px solid #fca5a5',borderRadius:'12px',padding:'12px',textAlign:'center',marginTop:'16px',color:'#dc2626',fontSize:'13px'},
  disclaimer:{textAlign:'center',color:'#94a3b8',fontSize:'11px',marginTop:'12px'}
};

export default function Login({
  defaultRole = "patient",
  isAsha = false
}) {
  const navigate = useNavigate();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const role = defaultRole; // patient | asha_worker

  const isAdmin = role === 'asha_worker';
  const focusColor = isAdmin ? '#7c3aed' : '#059669';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await authAPI.login({ email, password });
    const user = res.data.user;

    if (isAsha && user.role !== "asha_worker") {
      setError("Please use Patient Login.");
      return;
    }

    if (!isAsha && user.role !== "patient") {
      setError("Please use ASHA Login.");
      return;
    }

    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("user", JSON.stringify(res.data.user || {}));
    navigate(user.role === "asha_worker" ? "/admin" : "/dashboard");

  } catch (err) {
    setError(err.response?.data?.detail || "Login failed");
  } finally {
    setLoading(false);
  }
};
  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={S.logoSection}>
          <div style={S.logoIcon}>🏥</div>
          <h1 style={S.logoTitle}>AroNexa</h1>
          <p style={S.logoSub}>AI-Assisted Smart Healthcare Platform</p>
        </div>

          <div style={S.body}>
            <div style={S.info(isAdmin)}>
              {isAdmin
                ? 'ASHA Worker Login • Patient records & community health'
                : 'Patient Login • Symptoms, reports & hospitals'}
            </div>

            {error && <div style={S.error}>⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <label style={S.label}>EMAIL</label>
              <input
                style={S.input}
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                onFocus={e=>e.target.style.borderColor=focusColor}
                onBlur={e=>e.target.style.borderColor='#e2e8f0'}
                required
              />

              <label style={S.label}>PASSWORD</label>
              <input
                style={S.input}
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                onFocus={e=>e.target.style.borderColor=focusColor}
                onBlur={e=>e.target.style.borderColor='#e2e8f0'}
                required
              />

              <button type="submit" disabled={loading} style={{...S.btn(isAdmin),opacity:loading?.7:1}}>
                {loading ? 'Logging in...' : isAdmin ? 'Continue as ASHA Worker' : 'Continue as Patient'}
              </button>
            </form>

            <div style={{textAlign:'center',fontSize:'14px'}}>
  <p>Don't have an account?</p>

  {isAsha ? (
    <Link to="/asha-register" style={S.link}>
      Register as ASHA Worker
    </Link>
  ) : (
    <Link to="/register" style={S.link}>
      Create Patient Account
    </Link>
  )}
</div>
        
        </div>

        <div style={S.emergency}>🚨 Emergency? Call <b>108</b></div>
        <p style={S.disclaimer}>AI-assisted healthcare support only.</p>
      </div>
    </div>
  );
}