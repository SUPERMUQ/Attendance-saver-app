import React from 'react';

const LOGO_SRC = '/logo kpmaiwp.png';

export default function Logo({ dark = false, size = 'sm' }) {
  const dim   = size === 'lg' ? 46 : size === 'md' ? 40 : 36;
  const fSize = size === 'lg' ? 17 : size === 'md' ? 16 : 15;
  const badge = size === 'lg' ? 22 : size === 'md' ? 19 : 17;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        
        {/* SIMPLIFIED CONTAINER: No background, no shadow, no overflow restrictions */}
        <div style={{
          width: dim, 
          height: dim, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
        }}>
          <img 
            src={LOGO_SRC} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain', // Keeps it perfectly proportioned
            }} 
            alt="KPMAIWP"
          />
        </div>
        
        {/* Verification Badge */}
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: badge, height: badge, borderRadius: '50%',
          background: 'linear-gradient(135deg,#0891b2,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2.5px solid ${dark ? '#0c1e35' : '#f0f9ff'}`, // Matches your app's background
          boxShadow: '0 3px 10px rgba(8,145,178,0.55)',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.2 2.2L8 3" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div>
        <div style={{ 
          fontFamily: "'Plus Jakarta Sans',sans-serif", 
          fontWeight: 900, 
          fontSize: fSize, 
          letterSpacing: '-0.3px', 
          color: dark ? 'white' : '#0c1e35', 
          lineHeight: 1.15 
        }}>
          Attendance <span style={{ color: '#0891b2' }}>Saver</span>
        </div>
        <div style={{ 
          fontFamily: "'Plus Jakarta Sans',sans-serif", 
          fontSize: 8, 
          fontWeight: 900, 
          letterSpacing: '0.14em', 
          textTransform: 'uppercase', 
          color: dark ? 'rgba(255,255,255,0.35)' : '#94a3b8', 
          marginTop: 2 
        }}>
          KPMAIWP 
        </div>
      </div>
    </div>
  );
}
