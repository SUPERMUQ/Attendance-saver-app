import React, { useState } from 'react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { 
      await sendPasswordResetEmail(auth, email); 
    } catch (_) {}
    finally { 
      setLoading(false); 
      setSent(true); 
    }
  };

  return (
    <div className="overlay">
      <div className="modal" style={{ textAlign: 'left', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0c1e35' }}>Reset Password</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20}/></button>
        </div>
        {!sent ? (
          <>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="app-input" type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}/>
              <button className="btn-primary" style={{ padding: '13px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={loading}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }}/> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <CheckCircle2 size={28} color="#059669"/>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0c1e35', marginBottom: 6 }}>Email Sent! 📬</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Check your inbox. Don't forget to check spam!</div>
            <button className="btn-ghost" style={{ padding: '11px 28px', fontSize: 13 }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
