import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, Bell, CalendarX, MapPin, BookOpen } from 'lucide-react';

export default function SchedulePreview() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2400);
    return () => clearInterval(id);
  }, []);

  const cards = [
    { 
      code: 'ITT 2263', 
      subject: 'System Paradigm', 
      status: 'Upcoming', 
      statusBg: '#f0fdf4', 
      statusColor: '#16a34a', 
      statusIcon: <CalendarCheck size={10} color="#16a34a"/>, 
      repDate: 'Thu, Mar 6', 
      repTime: '14.00–16.00', 
      repVenue: 'Lab 3', 
      canDate: 'Tue, Feb 25', 
      reason: 'Emergency Leave' 
    },
    { 
      code: 'ITT 2243', 
      subject: 'Integrated System Tech', 
      status: 'Soon', 
      statusBg: '#fef2f2', 
      statusColor: '#ef4444', 
      statusIcon: <Clock size={10} color="#ef4444"/>, 
      repDate: 'Mon, Mar 3', 
      repTime: '10.00–12.00', 
      repVenue: 'Online via Zoom', 
      canDate: 'Wed, Feb 26', 
      reason: 'Lecturer Conference' 
    },
    { 
      code: 'ITT 2251', 
      subject: 'Database Management', 
      status: 'Today!', 
      statusBg: '#fff7ed', 
      statusColor: '#ea580c', 
      statusIcon: <Bell size={10} color="#ea580c"/>, 
      repDate: 'Sat, Mar 1', 
      repTime: '09.00–11.00', 
      repVenue: 'Room B204', 
      canDate: 'Fri, Feb 28', 
      reason: 'Public Holiday' 
    },
  ];

  const active = tick % cards.length;
  const c = cards[active];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
      <div style={{ position: 'absolute', inset: -20, borderRadius: 40, background: 'radial-gradient(ellipse,rgba(8,145,178,0.15) 0%,transparent 70%)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: 20, padding: '6px 16px', boxShadow: '0 4px 20px rgba(8,145,178,0.15)', display: 'flex', alignItems: 'center', gap: 6, zIndex: 2, fontSize: 12, fontWeight: 800, color: '#0891b2', whiteSpace: 'nowrap', border: '1px solid rgba(8,145,178,0.12)' }}>
        <Bell size={11} color="#0891b2"/> Class swap detected!
      </div>
      <div style={{ background: 'white', borderRadius: 28, boxShadow: '0 20px 60px rgba(8,145,178,0.15),0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid rgba(8,145,178,0.1)' }}>
        <div style={{ height: 5, background: 'linear-gradient(90deg,#0891b2,#06b6d4,#22d3ee)' }}/>
        <div style={{ padding: '18px 20px 20px' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#0891b2', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ display: 'inline-block', width: 3, height: 10, background: '#0891b2', borderRadius: 2 }}/>{c.code}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0c1e35', letterSpacing: '-0.3px', marginBottom: 6 }}>{c.subject}</div>
            <span style={{ background: c.statusBg, color: c.statusColor, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{c.statusIcon} {c.status}</span>
          </div>
          <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><CalendarCheck size={11} color="#059669"/> Replacement</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0c1e35' }}>{c.repDate} · {c.repTime}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10}/>{c.repVenue}</div>
          </div>
          <div style={{ background: '#fff5f5', borderRadius: 12, padding: '10px 14px', borderLeft: '3px solid #fca5a5' }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><CalendarX size={11} color="#ef4444"/> Cancelled</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textDecoration: 'line-through' }}>{c.canDate}</div>
            <div style={{ fontSize: 11, fontStyle: 'italic', color: '#ef4444', marginTop: 2 }}>"{c.reason}"</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
        {cards.map((_, i) => <div key={i} style={{ width: i === active ? 20 : 7, height: 7, borderRadius: 4, background: i === active ? '#0891b2' : '#bae6fd', transition: 'all 0.3s ease' }}/>)}
      </div>
      <div style={{ position: 'absolute', bottom: 50, right: -18, background: 'white', borderRadius: 16, padding: '8px 14px', boxShadow: '0 8px 24px rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.12)', fontSize: 12, fontWeight: 800, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 6, animation: 'floatChip 3s ease-in-out infinite' }}>
        <BookOpen size={12} color="#6366f1"/> Exam in 5 days
      </div>
    </div>
  );
}
