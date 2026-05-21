import React from 'react';
import { LogOut } from 'lucide-react';

export default function LogoutModal({ onClose, onLogout }) {
  return (
    <div className="overlay">
      <div className="modal">
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <LogOut size={24} color="#ef4444"/>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#0c1e35', marginBottom: 7 }}>Log Out?</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 26, fontWeight: 500 }}>You'll need to sign in again to access your schedule.</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1, padding: '13px 0', fontSize: 14 }} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1, padding: '13px 0', fontSize: 14, background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }} onClick={onLogout}>Log Out</button>
        </div>
      </div>
    </div>
  );
}
