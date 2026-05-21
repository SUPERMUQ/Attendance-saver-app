import React, { useState } from 'react';
import { ChevronLeft, CalendarCheck, CalendarX } from 'lucide-react';
import { TIME_SLOTS, validEnd } from '../utils/helpers';

export default function AddClass({ editItem, onSave, onCancel }) {
  const [classForm, setClassForm] = useState(() => {
    if (editItem) {
      return {
        subject: editItem.subject || '',
        courseCode: editItem.courseCode || '',
        repDate: editItem.repDate || '',
        repStart: editItem.repStart || '08.00',
        repEnd: editItem.repEnd || '10.00',
        repVenue: editItem.repVenue || '',
        canDate: editItem.canDate || '',
        canReason: editItem.canReason || ''
      };
    }
    return { subject: '', courseCode: '', repDate: '', repStart: '08.00', repEnd: '10.00', repVenue: '', canDate: '', canReason: '' };
  });

  const C = {
    bg: '#f0f9ff',
    primary: '#0891b2',
    primaryDark: '#0e7490',
    text: '#0c1e35',
    muted: '#64748b',
    light: '#94a3b8',
  };

  const handleSave = () => {
    onSave(classForm);
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 40 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(240,249,255,0.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(8,145,178,0.1)', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onCancel} style={{ background: '#f1f5f9', border: 'none', borderRadius: 12, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={17} color={C.muted}/>
          </button>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{editItem ? 'Edit' : 'New'} Entry</div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, letterSpacing: '-0.3px' }}>Class Swap</h2>
          </div>
        </div>
      </div>
      <div style={{ padding: '20px 18px' }}>
        <div style={{ marginBottom: 14 }}>
          <label className="app-label">Subject Name *</label>
          <input className="app-input" placeholder="e.g. System Paradigm" value={classForm.subject} onChange={e => setClassForm({ ...classForm, subject: e.target.value })}/>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="app-label">Course Code</label>
          <input className="app-input" placeholder="e.g. ITT 2263" value={classForm.courseCode} onChange={e => setClassForm({ ...classForm, courseCode: e.target.value })}/>
        </div>
        
        <div className="form-section" style={{ borderTop: '3px solid #059669' }}>
          <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#059669', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarCheck size={13} color="#059669"/> Replacement Schedule
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="app-label">Date *</label>
            <input className="app-input" type="date" value={classForm.repDate} onChange={e => setClassForm({ ...classForm, repDate: e.target.value })}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label className="app-label">Start</label>
              <select className="app-input" value={classForm.repStart} onChange={e => setClassForm({ ...classForm, repStart: e.target.value })}>
                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="app-label">End</label>
              <select className="app-input" value={classForm.repEnd} onChange={e => setClassForm({ ...classForm, repEnd: e.target.value })}>
                {validEnd(classForm.repStart).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="app-label">Venue</label>
            <input className="app-input" placeholder="e.g. Lab 4 / Online via Zoom" value={classForm.repVenue} onChange={e => setClassForm({ ...classForm, repVenue: e.target.value })}/>
          </div>
        </div>

        <div className="form-section" style={{ borderTop: '3px solid #ef4444' }}>
          <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ef4444', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarX size={13} color="#ef4444"/> Cancelled Class Info
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="app-label">Cancelled Date *</label>
            <input className="app-input" type="date" value={classForm.canDate} onChange={e => setClassForm({ ...classForm, canDate: e.target.value })}/>
          </div>
          <div>
            <label className="app-label">Reason</label>
            <div style={{ position: 'relative' }}>
              <input className="app-input" placeholder="e.g. Emergency Leave" maxLength={60} value={classForm.canReason} onChange={e => setClassForm({ ...classForm, canReason: e.target.value })} style={{ paddingRight: 44 }}/>
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: C.light }}>{classForm.canReason.length}/60</span>
            </div>
          </div>
        </div>

        <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleSave}>
          {editItem ? 'Update Class Swap' : 'Save Class Swap'}
        </button>
      </div>
    </div>
  );
}
