import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { TIME_SLOTS, validEnd } from '../utils/helpers';

export default function AddExam({ editItem, onSave, onCancel }) {
  const [examForm, setExamForm] = useState(() => {
    if (editItem) {
      return {
        subject: editItem.subject || '',
        topic: editItem.topic || '',
        date: editItem.date || '',
        start: editItem.start || '08.00',
        end: editItem.end || '10.00',
        venue: editItem.venue || ''
      };
    }
    return { subject: '', topic: '', date: '', start: '08.00', end: '10.00', venue: '' };
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
    onSave(examForm);
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
            <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, letterSpacing: '-0.3px' }}>Exam Reminder</h2>
          </div>
        </div>
      </div>
      <div style={{ padding: '20px 18px' }}>
        <div style={{ marginBottom: 14 }}>
          <label className="app-label">Subject *</label>
          <input className="app-input" placeholder="e.g. Data Structures" value={examForm.subject} onChange={e => setExamForm({ ...examForm, subject: e.target.value })}/>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="app-label">Topic / Scope</label>
          <input className="app-input" placeholder="e.g. Final Exam (Ch 1–5)" value={examForm.topic} onChange={e => setExamForm({ ...examForm, topic: e.target.value })}/>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="app-label">Exam Date *</label>
          <input className="app-input" type="date" value={examForm.date} onChange={e => setExamForm({ ...examForm, date: e.target.value })}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label className="app-label">Start Time</label>
            <select className="app-input" value={examForm.start} onChange={e => setExamForm({ ...examForm, start: e.target.value })}>
              {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="app-label">End Time</label>
            <select className="app-input" value={examForm.end} onChange={e => setExamForm({ ...examForm, end: e.target.value })}>
              {validEnd(examForm.start).map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 26 }}>
          <label className="app-label">Venue</label>
          <input className="app-input" placeholder="e.g. Main Hall A" value={examForm.venue} onChange={e => setExamForm({ ...examForm, venue: e.target.value })}/>
        </div>
        <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 15, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleSave}>
          {editItem ? 'Update Exam' : 'Save Exam Reminder'}
        </button>
      </div>
    </div>
  );
}
