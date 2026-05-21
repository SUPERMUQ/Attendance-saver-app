import React from 'react';
import {
  LogOut, CalendarCheck, Plus, Edit2, Trash2, MapPin, Clock, BookOpen, Loader2
} from 'lucide-react';
import Logo from '../components/Logo';
import { getStatus, getDaysLeft, fmt } from '../utils/helpers';

export default function Dashboard({
  classes,
  exams,
  dataLoading,
  activeTab,
  setActiveTab,
  fabOpen,
  setFabOpen,
  onAddClass,
  onAddExam,
  onDeleteClass,
  onDeleteExam,
  onLogoutTrigger
}) {
  const C = {
    bg: '#f0f9ff',
    primary: '#0891b2',
    primaryDark: '#0e7490',
    text: '#0c1e35',
    muted: '#64748b',
    light: '#94a3b8',
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(240,249,255,0.94)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(8,145,178,0.1)', padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Logo dark={false} size="md"/>
          <button onClick={onLogoutTrigger} style={{ background: '#fff5f5', border: 'none', borderRadius: 12, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <LogOut size={16} color="#ef4444"/>
          </button>
        </div>
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 16, padding: 4, marginBottom: 14, gap: 4 }}>
          {['classes', 'exams'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={activeTab === t ? 'dash-tab-active' : 'dash-tab-inactive'}
              style={{ flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700, borderRadius: 12, transition: 'all 0.2s' }}>
              {t === 'classes' ? '📋 Classes' : '📝 Exams'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {dataLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 16 }}>
            <Logo dark={false} size="md"/>
            <Loader2 size={28} color="#0891b2" style={{ animation: 'spin 1s linear infinite' }}/>
            <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Loading your schedule...</p>
          </div>
        ) : activeTab === 'classes' ? (
          classes.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '50px 20px', 
              background: 'rgba(255,255,255,0.5)', 
              border: '2px dashed rgba(8,145,178,0.25)', 
              borderRadius: 24, 
              margin: '10px 4px' 
            }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: '50%', 
                background: '#e0f2fe', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 16px' 
              }}>
                <CalendarCheck size={32} color="#0891b2"/>
              </div>
              <p style={{ fontWeight: 800, fontSize: 17, color: '#0c1e35', marginBottom: 6 }}>
                Your schedule is clear!
              </p>
              <p style={{ fontSize: 13, color: '#64748b', maxWidth: 240, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Got a cancelled class? Log it here so you don't miss the replacement.
              </p>
              <button onClick={() => onAddClass()} style={{ 
                background: 'white', border: '1px solid rgba(8,145,178,0.2)', 
                color: '#0891b2', fontWeight: 800, fontSize: 13, 
                padding: '10px 20px', borderRadius: 16, cursor: 'pointer', 
                display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(8,145,178,0.08)'
              }}>
                <Plus size={16}/> Add Class Swap
              </button>
            </div>
          ) : classes.map((item) => {
            const st = getStatus(item.repDate);
            return (
              <div key={item.id} className="dash-card">
                <div style={{ height: 4, background: 'linear-gradient(90deg,#0891b2,#06b6d4,#22d3ee)' }}/>
                <div style={{ padding: '16px 18px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: C.primary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ display: 'inline-block', width: 3, height: 10, background: C.primary, borderRadius: 2 }}/>{item.courseCode}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: '-0.3px' }}>{item.subject}</div>
                      {st && <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6 }}>{st.icon} {st.label}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
                      <button className="dash-action" onClick={() => onAddClass(item)}><Edit2 size={13} color="#94a3b8"/></button>
                      <button className="dash-action" onClick={() => onDeleteClass(item.id)}><Trash2 size={13} color="#fca5a5"/></button>
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarCheck size={12} color="#059669"/></div>
                      <span style={{ fontSize: 9, fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Replacement</span>
                    </div>
                    <div style={{ background: '#f8faff', borderRadius: 12, padding: '10px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{fmt(item.repDate)} · {item.repStart}–{item.repEnd}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10}/>{item.repVenue}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarCheck size={12} color="#ef4444"/></div>
                      <span style={{ fontSize: 9, fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cancelled</span>
                    </div>
                    <div style={{ background: '#fff5f5', borderRadius: 12, padding: '10px 14px', borderLeft: '3px solid #fca5a5' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textDecoration: 'line-through' }}>{fmt(item.canDate)}</div>
                      <div style={{ fontSize: 11, fontStyle: 'italic', color: '#ef4444', marginTop: 2 }}>"{item.canReason}"</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          exams.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '50px 20px', 
              background: 'rgba(255,255,255,0.5)', 
              border: '2px dashed rgba(99,102,241,0.25)', 
              borderRadius: 24, 
              margin: '10px 4px' 
            }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: '50%', 
                background: '#e0e7ff', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 16px' 
              }}>
                <BookOpen size={32} color="#6366f1"/>
              </div>
              <p style={{ fontWeight: 800, fontSize: 17, color: '#0c1e35', marginBottom: 6 }}>
                No exams on the horizon
              </p>
              <p style={{ fontSize: 13, color: '#64748b', maxWidth: 240, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Add your upcoming tests to start the countdown and stay prepared.
              </p>
              <button onClick={() => onAddExam()} style={{ 
                background: 'white', border: '1px solid rgba(99,102,241,0.2)', 
                color: '#6366f1', fontWeight: 800, fontSize: 13, 
                padding: '10px 20px', borderRadius: 16, cursor: 'pointer', 
                display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(99,102,241,0.08)'
              }}>
                <Plus size={16}/> Add Exam
              </button>
            </div>
          ) : exams.map((item) => {
            const dl = getDaysLeft(item.date);
            return (
              <div key={item.id} className="dash-card">
                <div style={{ height: 4, background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa)' }}/>
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{item.subject}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 3, fontWeight: 500 }}>{item.topic}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button className="dash-action" onClick={() => onAddExam(item)}><Edit2 size={13} color="#94a3b8"/></button>
                      <button className="dash-action" onClick={() => onDeleteExam(item.id)}><Trash2 size={13} color="#fca5a5"/></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <span className="dash-chip" style={{ background: '#eff6ff', color: '#3b82f6' }}><CalendarCheck size={11} color="#3b82f6"/> {fmt(item.date)}</span>
                    {dl && <span className="dash-chip" style={{ background: dl.color + '12', color: dl.color }}><Clock size={11} color={dl.color}/> {dl.label}</span>}
                    <span className="dash-chip" style={{ background: '#f8faff', color: C.muted }}><Clock size={11} color={C.muted}/> {item.start}–{item.end}</span>
                    <span className="dash-chip" style={{ background: '#f8faff', color: C.muted }}><MapPin size={11} color={C.muted}/> {item.venue}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FAB */}
      <div style={{ position: 'fixed', bottom: 28, right: 22, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
        {fabOpen && (
          <>
            <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: -1 }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, animation: 'heroIn 0.18s ease both' }}>
              <span style={{ background: 'white', borderRadius: 12, padding: '7px 14px', fontSize: 12, fontWeight: 800, color: '#6366f1', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>Add Exam</span>
              <button onClick={() => { setFabOpen(false); onAddExam(); }} style={{ width: 46, height: 46, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(99,102,241,0.4)', flexShrink: 0 }}>
                <BookOpen size={18} color="white"/>
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, animation: 'heroIn 0.18s ease 70ms both' }}>
              <span style={{ background: 'white', borderRadius: 12, padding: '7px 14px', fontSize: 12, fontWeight: 800, color: '#059669', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>Add Class</span>
              <button onClick={() => { setFabOpen(false); onAddClass(); }} style={{ width: 46, height: 46, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(5,150,105,0.4)', flexShrink: 0 }}>
                <CalendarCheck size={18} color="white"/>
              </button>
            </div>
          </>
        )}
        <button onClick={() => setFabOpen(o => !o)} className="fab" style={{ width: 58, height: 58, transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <Plus size={26}/>
        </button>
      </div>
    </div>
  );
}
