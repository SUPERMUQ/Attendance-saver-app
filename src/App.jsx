import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';

import { auth, db } from './firebase';
import Logo from './components/Logo';
import LogoutModal from './components/LogoutModal';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AddClass from './pages/AddClass';
import AddExam from './pages/AddExam';

export default function App() {
  // ── Auth state ──
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // ── Screen / nav ──
  const [screen, setScreen] = useState('home');
  const [activeTab, setActiveTab] = useState('classes');
  const [fabOpen, setFabOpen] = useState(false);

  // ── Data ──
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // ── Forms ──
  const [editItem, setEditItem] = useState(null);

  // ── UI ──
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showLogout, setShowLogout] = useState(false);

  // ── Toast helper ──
  const showToast = (msg, type = 'success') => {
    setToast(msg); 
    setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Firebase Auth listener ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (u) {
        setTimeout(() => setScreen('dashboard'), 800);
      } else {
        setScreen('home');
        setClasses([]);
        setExams([]);
      }
    });
    return unsub;
  }, []);

  // ── Firestore real-time listeners ──
  useEffect(() => {
    if (!user || screen !== 'dashboard') return; 
    
    setDataLoading(true);
    let cLoaded = false, eLoaded = false;
    const check = () => { 
      if (cLoaded && eLoaded) {
        setTimeout(() => setDataLoading(false), 600); 
      }
    };

    const unsubC = onSnapshot(
      query(collection(db, 'users', user.uid, 'classes'), orderBy('repDate', 'asc')),
      (snap) => { 
        setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() }))); 
        cLoaded = true; 
        check(); 
      }
    );
    const unsubE = onSnapshot(
      query(collection(db, 'users', user.uid, 'exams'), orderBy('date', 'asc')),
      (snap) => { 
        setExams(snap.docs.map(d => ({ id: d.id, ...d.data() }))); 
        eLoaded = true; 
        check(); 
      }
    );
    return () => { 
      unsubC(); 
      unsubE(); 
    };
  }, [user, screen]);

  // ── Auth actions ──
  const handleLogout = async () => {
    await signOut(auth);
    setShowLogout(false);
    setScreen('home');
  };

  // ── Class CRUD ──
  const openAddClass = (item = null) => {
    setFabOpen(false);
    setEditItem(item);
    setScreen('addClass');
  };

  const saveClass = async (classFormData) => {
    if (!classFormData.subject || !classFormData.repDate) { 
      showToast('⚠️ Fill required fields', 'error'); 
      return; 
    }
    try {
      const data = { ...classFormData, updatedAt: new Date().toISOString() };
      if (editItem) {
        await updateDoc(doc(db, 'users', user.uid, 'classes', editItem.id), data);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'classes'), data);
      }
      showToast(editItem ? '✏️ Class updated!' : '✅ Class swap saved!');
      setScreen('dashboard'); 
      setActiveTab('classes'); 
      setEditItem(null);
    } catch (err) {
      showToast('❌ Save failed. Try again.', 'error');
    }
  };

  const deleteClass = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'classes', id));
      showToast('🗑️ Deleted.');
    } catch { 
      showToast('❌ Delete failed.', 'error'); 
    }
  };

  // ── Exam CRUD ──
  const openAddExam = (item = null) => {
    setFabOpen(false);
    setEditItem(item);
    setScreen('addExam');
  };

  const saveExam = async (examFormData) => {
    if (!examFormData.subject || !examFormData.date) { 
      showToast('⚠️ Fill required fields', 'error'); 
      return; 
    }
    try {
      const data = { ...examFormData, updatedAt: new Date().toISOString() };
      if (editItem) {
        await updateDoc(doc(db, 'users', user.uid, 'exams', editItem.id), data);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'exams'), data);
      }
      showToast(editItem ? '✏️ Exam updated!' : '📝 Exam saved!');
      setScreen('dashboard'); 
      setActiveTab('exams'); 
      setEditItem(null);
    } catch (err) {
      showToast('❌ Save failed. Try again.', 'error');
    }
  };

  const deleteExam = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'exams', id));
      showToast('🗑️ Deleted.');
    } catch { 
      showToast('❌ Delete failed.', 'error'); 
    }
  };

  // ── Colors ──
  const C = {
    bg: '#f0f9ff',
    primary: '#0891b2',
    primaryDark: '#0e7490',
    text: '#0c1e35',
    muted: '#64748b',
    light: '#94a3b8',
  };

  // ── Global styles ──
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    body{font-family:'Plus Jakarta Sans',sans-serif;}

    .app-input{width:100%;padding:13px 16px;border-radius:14px;border:1.5px solid rgba(8,145,178,0.15);background:#f8faff;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#0c1e35;outline:none;transition:all 0.2s;}
    .app-input:focus{border-color:#0891b2;box-shadow:0 0 0 3px rgba(8,145,178,0.08);}
    .app-input::placeholder{color:#94a3b8;}
    select.app-input{appearance:none;}
    .app-label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.07em;color:#64748b;margin-bottom:6px;display:block;}
    .btn-primary{background:linear-gradient(135deg,#0891b2,#0e7490);color:white;border:none;border-radius:16px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 16px rgba(8,145,178,0.3);}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(8,145,178,0.4);}
    .btn-primary:disabled{opacity:0.7;cursor:not-allowed;transform:none;}
    .btn-ghost{background:#f1f5f9;color:#64748b;border:none;border-radius:16px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;cursor:pointer;transition:all 0.15s;}
    .btn-ghost:hover{background:#e2e8f0;color:#0c1e35;}
    .dash-card{background:white;border-radius:24px;border:1px solid rgba(0,0,0,0.06);box-shadow:0 1px 12px rgba(0,0,0,0.05);margin-bottom:14px;overflow:hidden;transition:all 0.2s ease;}
    .dash-card:hover{transform:translateY(-2px);box-shadow:0 4px 24px rgba(8,145,178,0.1);}
    .dash-action{background:none;border:none;cursor:pointer;width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;transition:background 0.15s;}
    .dash-action:hover{background:#f1f5f9;}
    .dash-chip{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;margin:4px 4px 0 0;}
    .dash-tab-active{background:linear-gradient(135deg,#0891b2,#0e7490);color:white;box-shadow:0 4px 14px rgba(8,145,178,0.3);}
    .dash-tab-inactive{background:#f1f5f9;color:#64748b;}
    .hp-nav-link{background:none;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:600;color:#64748b;transition:color 0.15s;padding:4px 0;}
    .hp-nav-link:hover{color:#0c1e35;}
    .hp-feat-card{background:white;border-radius:24px;border:1px solid rgba(0,0,0,0.06);padding:26px;transition:all 0.25s ease;box-shadow:0 2px 12px rgba(0,0,0,0.04);position:relative;overflow:hidden;}
    .hp-feat-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(8,145,178,0.12);border-color:rgba(8,145,178,0.15);}
    .hp-feat-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#0891b2,#06b6d4);transform:scaleX(0);transform-origin:left;transition:transform 0.3s ease;}
    .hp-feat-card:hover::after{transform:scaleX(1);}
    .hp-step-card{background:white;border-radius:24px;border:1px solid rgba(0,0,0,0.06);padding:28px 24px;box-shadow:0 2px 12px rgba(0,0,0,0.04);transition:all 0.25s;position:relative;overflow:hidden;}
    .hp-step-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(8,145,178,0.1);}
    .hp-testi{background:white;border-radius:24px;padding:26px;border:1px solid rgba(0,0,0,0.06);box-shadow:0 2px 12px rgba(0,0,0,0.04);transition:all 0.25s;}
    .hp-testi:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(8,145,178,0.1);}
    .hp-stat{background:white;border-radius:22px;padding:24px 20px;text-align:center;border:1px solid rgba(8,145,178,0.1);box-shadow:0 2px 12px rgba(8,145,178,0.06);transition:all 0.2s;}
    .hp-stat:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(8,145,178,0.12);}
    .hp-input{width:100%;padding:13px 16px;border-radius:14px;border:1.5px solid rgba(8,145,178,0.2);background:rgba(255,255,255,0.07);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:white;outline:none;transition:border 0.2s;}
    .hp-input:focus{border-color:#06b6d4;}
    .hp-input::placeholder{color:rgba(255,255,255,0.3);}
    select.hp-input option{background:#0e7490;}
    .hp-textarea{resize:vertical;min-height:88px;}
    .hp-social{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);cursor:pointer;transition:all 0.2s;color:rgba(255,255,255,0.65);text-decoration:none;}
    .hp-social:hover{background:rgba(255,255,255,0.18);color:white;transform:translateY(-2px);}
    .form-section{background:white;border:1px solid rgba(0,0,0,0.06);border-radius:20px;padding:18px;margin-bottom:14px;box-shadow:0 1px 8px rgba(0,0,0,0.04);}
    .overlay{position:fixed;inset:0;background:rgba(12,30,53,0.5);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
    .modal{background:white;border-radius:28px;padding:32px 26px;width:100%;max-width:340px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.15);}
    .toast-bar{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);padding:12px 22px;border-radius:20px;font-size:13px;font-weight:700;box-shadow:0 4px 16px rgba(0,0,0,0.25);z-index:300;white-space:nowrap;}
    @media(max-width:767px){.nav-links-desktop{display:none!important;}}
    @media(min-width:768px){.nav-links-desktop{display:flex!important;}}
    .fab{border-radius:20px;border:none;background:linear-gradient(135deg,#0891b2,#0e7490);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(8,145,178,0.45);z-index:100;transition:all 0.2s;}
    .hp-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(8,145,178,0.08);border:1px solid rgba(8,145,178,0.15);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;color:#0891b2;}
    .hp-tag{display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;background:rgba(8,145,178,0.08);color:#0891b2;margin-bottom:12px;}
    @keyframes heroIn{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
    @keyframes floatCard{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-10px) rotate(-1deg)}}
    @keyframes floatChip{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.2)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .h1{animation:heroIn 0.6s ease 0ms both;}
    .h2{animation:heroIn 0.6s ease 120ms both;}
    .h3{animation:heroIn 0.6s ease 240ms both;}
    .h4{animation:heroIn 0.6s ease 360ms both;}
    .h5{animation:heroIn 0.6s ease 480ms both;}
    .scroll-hint{display:flex;flex-direction:column;align-items:center;gap:6px;color:#94a3b8;font-size:11px;font-weight:600;animation:floatChip 2s infinite;}
    .hp-avatar-ring::after{content:'';position:absolute;inset:-4px;border-radius:50%;background:conic-gradient(#0891b2,#06b6d4,#22d3ee,#0891b2);z-index:-1;animation:spin 4s linear infinite;}
  `;

  // ── Wait for auth to resolve before rendering ──
  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f9ff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Logo dark={false} size="lg"/>
          <Loader2 size={24} color="#0891b2" style={{ animation: 'spin 1s linear infinite', marginTop: 8 }}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{globalStyles}</style>

      {screen === 'home' && (
        <Home 
          user={user} 
          onNavigate={(scr) => setScreen(scr)} 
        />
      )}

      {screen === 'auth' && (
        <Auth 
          onNavigate={(scr) => setScreen(scr)} 
          showToast={showToast} 
        />
      )}

      {screen === 'dashboard' && (
        <Dashboard
          classes={classes}
          exams={exams}
          dataLoading={dataLoading}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          fabOpen={fabOpen}
          setFabOpen={setFabOpen}
          onAddClass={openAddClass}
          onAddExam={openAddExam}
          onDeleteClass={deleteClass}
          onDeleteExam={deleteExam}
          onLogoutTrigger={() => setShowLogout(true)}
        />
      )}

      {screen === 'addClass' && (
        <AddClass
          editItem={editItem}
          onSave={saveClass}
          onCancel={() => setScreen('dashboard')}
        />
      )}

      {screen === 'addExam' && (
        <AddExam
          editItem={editItem}
          onSave={saveExam}
          onCancel={() => setScreen('dashboard')}
        />
      )}

      {showLogout && (
        <LogoutModal
          onClose={() => setShowLogout(false)}
          onLogout={handleLogout}
        />
      )}

      {toast && (
        <div className="toast-bar" style={{ background: toastType === 'error' ? '#ef4444' : '#059669', color: 'white' }}>
          {toast}
        </div>
      )}
    </div>
  );
}