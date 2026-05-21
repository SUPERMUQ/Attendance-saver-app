import React, { useState } from 'react';
import { ChevronLeft, EyeOff, Eye, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, fbErr } from '../firebase';
import Logo from '../components/Logo';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function Auth({ onNavigate, showToast }) {
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPwd, setAuthPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, authEmail, authPwd);
        showToast('👋 Welcome back!');
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, authPwd);
        showToast('🎉 Account created! Welcome!');
      }
      setAuthEmail('');
      setAuthPwd('');
    } catch (err) {
      showToast(fbErr(err.code), 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22, position: 'relative' }}>
      <div style={{ position: 'fixed', width: 500, height: 300, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(6,182,212,0.1),rgba(20,184,166,0.07))', top: -80, right: -120, pointerEvents: 'none', transform: 'rotate(-15deg)' }}/>
      <div style={{ position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(139,92,246,0.06),rgba(99,102,241,0.04))', bottom: 40, left: -80, pointerEvents: 'none' }}/>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)}/>}

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 28 }}>
          <ChevronLeft size={16}/> Back to Home
        </button>
        <div style={{ background: 'white', borderRadius: 28, padding: '32px 28px', border: '1px solid rgba(8,145,178,0.1)', boxShadow: '0 8px 40px rgba(8,145,178,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Logo dark={false} size="lg"/>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0c1e35', letterSpacing: '-0.5px' }}>
              {authMode === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Keep your schedule in sync</p>
          </div>
          
          {/* Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 16, padding: 4, marginBottom: 24, gap: 4 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setAuthMode(m); setAuthEmail(''); setAuthPwd(''); }}
                className={authMode === m ? 'dash-tab-active' : 'dash-tab-inactive'}
                style={{ flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700, borderRadius: 12, transition: 'all 0.2s' }}>
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="app-label">Email</label>
              <input className="app-input" placeholder="your@email.com" type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)}/>
            </div>
            <div>
              <label className="app-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="app-input" placeholder="••••••••" type={showPwd ? 'text' : 'password'} required value={authPwd} onChange={e => setAuthPwd(e.target.value)} style={{ paddingRight: 46 }}/>
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            {authMode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -6 }}>
                <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: '#0891b2', fontWeight: 700 }}>
                  Forgot password?
                </button>
              </div>
            )}
            <button className="btn-primary" style={{ padding: '15px', fontSize: 15, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={authLoading}>
              {authLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }}/> : (authMode === 'login' ? 'Login' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
