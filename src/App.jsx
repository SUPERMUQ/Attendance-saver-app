import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit2, Trash2, LogOut, CalendarCheck, CalendarX,
  CheckCircle2, ArrowRight, BookOpen, Shield, Bell, Users,
  Eye, EyeOff, ChevronLeft, ChevronDown, Sparkles, Menu, X,
  Send, Bug, Lightbulb, GraduationCap, Code2, Heart,
  Clock, MapPin, Star, Github, Linkedin, Instagram,
  Mail, ClipboardList, BarChart3, UserCheck, Loader2
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// FIREBASE
// ─────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

let app, auth, db;
try {
  app  = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db   = getFirestore(app);
} catch (e) {
  console.error('Firebase init failed — check your .env config.', e);
}

const FIREBASE_ERRORS = {
  'auth/user-not-found':       '❌ No account found with this email.',
  'auth/wrong-password':       '🔑 Wrong password. Please try again.',
  'auth/invalid-credential':   '🔑 Wrong email or password.',
  'auth/email-already-in-use': '📧 Email already registered. Try logging in.',
  'auth/too-many-requests':    '🚫 Too many attempts. Please wait.',
  'auth/invalid-email':        '📧 Invalid email address.',
  'auth/network-request-failed':'🌐 Network error. Check your connection.',
};
const fbErr = (code) => FIREBASE_ERRORS[code] || '⚠️ Something went wrong. Try again.';

// ─────────────────────────────────────────────────────────────
// LOGO — Version F
// ─────────────────────────────────────────────────────────────
const LOGO_SRC = '/logo kpmaiwp.png';

const LogoF = ({ dark = false, size = 'sm' }) => {
  const dim   = size === 'lg' ? 46 : size === 'md' ? 40 : 36;
  const fSize = size === 'lg' ? 17 : size === 'md' ? 16 : 15;
  const badge = size === 'lg' ? 22 : size === 'md' ? 19 : 17;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ position:'relative', flexShrink:0 }}>
        
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
          position:'absolute', bottom:-2, right:-2, // Adjusted positioning slightly
          width:badge, height:badge, borderRadius:'50%',
          background:'linear-gradient(135deg,#0891b2,#06b6d4)',
          display:'flex', alignItems:'center', justifyContent:'center',
          border:`2.5px solid ${dark ? '#0c1e35' : '#f0f9ff'}`, // Matches your app's background
          boxShadow:'0 3px 10px rgba(8,145,178,0.55)',
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
};

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────
const TIME_SLOTS = [];
for (let h = 8; h <= 18; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2,'0')}.00`);
  if (h < 18) TIME_SLOTS.push(`${String(h).padStart(2,'0')}.30`);
}
const validEnd = (s) => {
  const [h,m] = s.split('.').map(Number);
  const mins = h*60+m;
  return TIME_SLOTS.filter(t => { const [th,tm]=t.split('.').map(Number); return th*60+tm>mins; });
};
const fmt = (d) => {
  if (!d) return 'TBD';
  return new Date(d).toLocaleDateString('en-US',{weekday:'short',day:'numeric',month:'short'});
};
const getStatus = (dateStr) => {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr)-new Date())/86400000);
  if (diff < 0)  return { label:'Passed',   bg:'#f1f5f9', color:'#94a3b8', icon:<CheckCircle2 size={10} color="#94a3b8"/> };
  if (diff === 0) return { label:'Today!',  bg:'#fff7ed', color:'#ea580c', icon:<Bell size={10} color="#ea580c"/> };
  if (diff <= 3)  return { label:'Soon',    bg:'#fef2f2', color:'#ef4444', icon:<Clock size={10} color="#ef4444"/> };
  return            { label:'Upcoming', bg:'#f0fdf4', color:'#16a34a', icon:<CalendarCheck size={10} color="#16a34a"/> };
};
const getDaysLeft = (d) => {
  const diff = Math.ceil((new Date(d)-new Date())/86400000);
  if (diff < 0)   return { label:'Passed',      color:'#94a3b8' };
  if (diff === 0)  return { label:'Today!',     color:'#ea580c' };
  if (diff <= 7)   return { label:`${diff}d left`, color:'#ef4444' };
  return             { label:`${diff}d left`, color:'#0891b2' };
};

// ─────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────
function useScrollReveal(threshold=0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}
function Reveal({ children, delay=0, direction='up' }) {
  const [ref, visible] = useScrollReveal();
  const t = { up:'translateY(26px)', left:'translateX(-26px)', right:'translateX(26px)' };
  return (
    <div ref={ref} style={{ opacity:visible?1:0, transform:visible?'none':t[direction], transition:`opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms` }}>
      {children}
    </div>
  );
}
function StatCounter({ end, suffix='', duration=1800 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useScrollReveal();
  const started = useRef(false);
  useEffect(() => {
    if (visible && !started.current) {
      started.current = true;
      const steps = 50, inc = end/steps;
      let cur = 0;
      const id = setInterval(() => {
        cur += inc;
        if (cur >= end) { setCount(end); clearInterval(id); }
        else setCount(Number.isInteger(end) ? Math.floor(cur) : parseFloat(cur.toFixed(1)));
      }, duration/steps);
    }
  }, [visible, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─────────────────────────────────────────────────────────────
// ANIMATED SCHEDULE PREVIEW (homepage hero)
// ─────────────────────────────────────────────────────────────
function SchedulePreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t=>t+1), 2400); return () => clearInterval(id); }, []);
  const cards = [
    { code:'ITT 2263', subject:'System Paradigm', status:'Upcoming', statusBg:'#f0fdf4', statusColor:'#16a34a', statusIcon:<CalendarCheck size={10} color="#16a34a"/>, repDate:'Thu, Mar 6', repTime:'14.00–16.00', repVenue:'Lab 3', canDate:'Tue, Feb 25', reason:'Emergency Leave' },
    { code:'ITT 2243', subject:'Integrated System Tech', status:'Soon', statusBg:'#fef2f2', statusColor:'#ef4444', statusIcon:<Clock size={10} color="#ef4444"/>, repDate:'Mon, Mar 3', repTime:'10.00–12.00', repVenue:'Online via Zoom', canDate:'Wed, Feb 26', reason:'Lecturer Conference' },
    { code:'ITT 2251', subject:'Database Management', status:'Today!', statusBg:'#fff7ed', statusColor:'#ea580c', statusIcon:<Bell size={10} color="#ea580c"/>, repDate:'Sat, Mar 1', repTime:'09.00–11.00', repVenue:'Room B204', canDate:'Fri, Feb 28', reason:'Public Holiday' },
  ];
  const active = tick % cards.length;
  const c = cards[active];
  return (
    <div style={{ position:'relative', width:'100%', maxWidth:340 }}>
      <div style={{ position:'absolute', inset:-20, borderRadius:40, background:'radial-gradient(ellipse,rgba(8,145,178,0.15) 0%,transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', top:-18, left:'50%', transform:'translateX(-50%)', background:'white', borderRadius:20, padding:'6px 16px', boxShadow:'0 4px 20px rgba(8,145,178,0.15)', display:'flex', alignItems:'center', gap:6, zIndex:2, fontSize:12, fontWeight:800, color:'#0891b2', whiteSpace:'nowrap', border:'1px solid rgba(8,145,178,0.12)' }}>
        <Bell size={11} color="#0891b2"/> Class swap detected!
      </div>
      <div style={{ background:'white', borderRadius:28, boxShadow:'0 20px 60px rgba(8,145,178,0.15),0 4px 20px rgba(0,0,0,0.06)', overflow:'hidden', border:'1px solid rgba(8,145,178,0.1)' }}>
        <div style={{ height:5, background:'linear-gradient(90deg,#0891b2,#06b6d4,#22d3ee)' }}/>
        <div style={{ padding:'18px 20px 20px' }}>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:800, color:'#0891b2', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:3, display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ display:'inline-block', width:3, height:10, background:'#0891b2', borderRadius:2 }}/>{c.code}
            </div>
            <div style={{ fontSize:16, fontWeight:800, color:'#0c1e35', letterSpacing:'-0.3px', marginBottom:6 }}>{c.subject}</div>
            <span style={{ background:c.statusBg, color:c.statusColor, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:800, display:'inline-flex', alignItems:'center', gap:4 }}>{c.statusIcon} {c.status}</span>
          </div>
          <div style={{ background:'#f0fdf4', borderRadius:12, padding:'10px 14px', marginBottom:8 }}>
            <div style={{ fontSize:9, fontWeight:900, color:'#059669', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4, display:'flex', alignItems:'center', gap:5 }}><CalendarCheck size={11} color="#059669"/> Replacement</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#0c1e35' }}>{c.repDate} · {c.repTime}</div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:1, display:'flex', alignItems:'center', gap:4 }}><MapPin size={10}/>{c.repVenue}</div>
          </div>
          <div style={{ background:'#fff5f5', borderRadius:12, padding:'10px 14px', borderLeft:'3px solid #fca5a5' }}>
            <div style={{ fontSize:9, fontWeight:900, color:'#ef4444', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4, display:'flex', alignItems:'center', gap:5 }}><CalendarX size={11} color="#ef4444"/> Cancelled</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8', textDecoration:'line-through' }}>{c.canDate}</div>
            <div style={{ fontSize:11, fontStyle:'italic', color:'#ef4444', marginTop:2 }}>"{c.reason}"</div>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:16 }}>
        {cards.map((_,i) => <div key={i} style={{ width:i===active?20:7, height:7, borderRadius:4, background:i===active?'#0891b2':'#bae6fd', transition:'all 0.3s ease' }}/>)}
      </div>
      <div style={{ position:'absolute', bottom:50, right:-18, background:'white', borderRadius:16, padding:'8px 14px', boxShadow:'0 8px 24px rgba(99,102,241,0.2)', border:'1px solid rgba(99,102,241,0.12)', fontSize:12, fontWeight:800, color:'#6366f1', display:'flex', alignItems:'center', gap:6, animation:'floatChip 3s ease-in-out infinite' }}>
        <BookOpen size={12} color="#6366f1"/> Exam in 5 days
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD MODAL
// ─────────────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await sendPasswordResetEmail(auth, email); } catch (_) {}
    finally { setLoading(false); setSent(true); }
  };
  return (
    <div className="overlay">
      <div className="modal" style={{ textAlign:'left', maxWidth:380 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ fontSize:18, fontWeight:900, color:'#0c1e35' }}>Reset Password</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}><X size={20}/></button>
        </div>
        {!sent ? (
          <>
            <p style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSend} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <input className="app-input" type="email" required placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
              <button className="btn-primary" style={{ padding:'13px', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} disabled={loading}>
                {loading ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign:'center', padding:'12px 0' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#ecfdf5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <CheckCircle2 size={28} color="#059669"/>
            </div>
            <div style={{ fontSize:17, fontWeight:800, color:'#0c1e35', marginBottom:6 }}>Email Sent! 📬</div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>Check your inbox. Don't forget to check spam!</div>
            <button className="btn-ghost" style={{ padding:'11px 28px', fontSize:13 }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  // ── Auth state ──
  const [user,        setUser]        = useState(null);
  const [authReady,   setAuthReady]   = useState(false);

  // ── Screen / nav ──
  const [screen,      setScreen]      = useState('home');
  const [authMode,    setAuthMode]    = useState('login');
  const [activeTab,   setActiveTab]   = useState('classes');
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [fabOpen,     setFabOpen]     = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  // ── Data ──
  const [classes,     setClasses]     = useState([]);
  const [exams,       setExams]       = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // ── Forms ──
  const [editItem,    setEditItem]    = useState(null);
  const [classForm,   setClassForm]   = useState({ subject:'', courseCode:'', repDate:'', repStart:'08.00', repEnd:'10.00', repVenue:'', canDate:'', canReason:'' });
  const [examForm,    setExamForm]    = useState({ subject:'', topic:'', date:'', start:'08.00', end:'10.00', venue:'' });

  // ── Auth form ──
  const [authEmail,   setAuthEmail]   = useState('');
  const [authPwd,     setAuthPwd]     = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showForgot,  setShowForgot]  = useState(false);

  // ── UI ──
  const [toast,         setToast]         = useState('');
  const [toastType,     setToastType]     = useState('success');
  const [showLogout,    setShowLogout]    = useState(false);
  const [contactForm,   setContactForm]   = useState({ name:'', type:'Bug Report', message:'' });
  const [contactSent,   setContactSent]   = useState(false);

  // ── Toast helper ──
  const showToast = (msg, type='success') => {
    setToast(msg); setToastType(type);
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
    // Check if user exists AND if they are actually on the dashboard
    if (!user || screen !== 'dashboard') return; 
    
    setDataLoading(true);
    let cLoaded = false, eLoaded = false;
    const check = () => { if (cLoaded && eLoaded) setTimeout(() => setDataLoading(false), 600); };

    const unsubC = onSnapshot(
      query(collection(db, 'users', user.uid, 'classes'), orderBy('repDate', 'asc')),
      (snap) => { setClasses(snap.docs.map(d => ({ id:d.id, ...d.data() }))); cLoaded = true; check(); }
    );
    const unsubE = onSnapshot(
      query(collection(db, 'users', user.uid, 'exams'), orderBy('date', 'asc')),
      (snap) => { setExams(snap.docs.map(d => ({ id:d.id, ...d.data() }))); eLoaded = true; check(); }
    );
    return () => { unsubC(); unsubE(); };
  }, [user, screen]); // Don't forget to add 'screen' here!

  // ── Nav scroll ──
  useEffect(() => {
    if (screen !== 'home') return;
    const fn = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, [screen]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  // ── Auth actions ──
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
      setAuthEmail(''); setAuthPwd('');
    } catch (err) {
      showToast(fbErr(err.code), 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setShowLogout(false);
    setScreen('home');
  };

  // ── Class CRUD ──
  const openAddClass = (item=null) => {
    setFabOpen(false);
    if (item) {
      setClassForm({ subject:item.subject||'', courseCode:item.courseCode||'', repDate:item.repDate||'', repStart:item.repStart||'08.00', repEnd:item.repEnd||'10.00', repVenue:item.repVenue||'', canDate:item.canDate||'', canReason:item.canReason||'' });
      setEditItem(item);
    } else {
      setClassForm({ subject:'', courseCode:'', repDate:'', repStart:'08.00', repEnd:'10.00', repVenue:'', canDate:'', canReason:'' });
      setEditItem(null);
    }
    setScreen('addClass');
  };

  const saveClass = async () => {
    if (!classForm.subject || !classForm.repDate) { showToast('⚠️ Fill required fields', 'error'); return; }
    try {
      const data = { ...classForm, updatedAt: new Date().toISOString() };
      if (editItem) await updateDoc(doc(db, 'users', user.uid, 'classes', editItem.id), data);
      else await addDoc(collection(db, 'users', user.uid, 'classes'), data);
      showToast(editItem ? '✏️ Class updated!' : '✅ Class swap saved!');
      setScreen('dashboard'); setActiveTab('classes'); setEditItem(null);
    } catch (err) {
      showToast('❌ Save failed. Try again.', 'error');
    }
  };

  const deleteClass = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'classes', id));
      showToast('🗑️ Deleted.');
    } catch { showToast('❌ Delete failed.', 'error'); }
  };

  // ── Exam CRUD ──
  const openAddExam = (item=null) => {
    setFabOpen(false);
    if (item) {
      setExamForm({ subject:item.subject||'', topic:item.topic||'', date:item.date||'', start:item.start||'08.00', end:item.end||'10.00', venue:item.venue||'' });
      setEditItem(item);
    } else {
      setExamForm({ subject:'', topic:'', date:'', start:'08.00', end:'10.00', venue:'' });
      setEditItem(null);
    }
    setScreen('addExam');
  };

  const saveExam = async () => {
    if (!examForm.subject || !examForm.date) { showToast('⚠️ Fill required fields', 'error'); return; }
    try {
      const data = { ...examForm, updatedAt: new Date().toISOString() };
      if (editItem) await updateDoc(doc(db, 'users', user.uid, 'exams', editItem.id), data);
      else await addDoc(collection(db, 'users', user.uid, 'exams'), data);
      showToast(editItem ? '✏️ Exam updated!' : '📝 Exam saved!');
      setScreen('dashboard'); setActiveTab('exams'); setEditItem(null);
    } catch (err) {
      showToast('❌ Save failed. Try again.', 'error');
    }
  };

  const deleteExam = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'exams', id));
      showToast('🗑️ Deleted.');
    } catch { showToast('❌ Delete failed.', 'error'); }
  };

  // ── Colors ──
  const C = {
    bg:'#f0f9ff', primary:'#0891b2', primaryDark:'#0e7490',
    text:'#0c1e35', muted:'#64748b', light:'#94a3b8',
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

  // ── Homepage data ──
  const features = [
    { icon:<Shield size={22} color="#0891b2"/>, bg:'#e0f7fa', title:'Attendance Saver', desc:'Rescheduled classes can ruin your attendance record. We make sure you\'re always in the right room at the right time.', tag:'Core Feature' },
    { icon:<Bell size={22} color="#ea580c"/>,   bg:'#fff7ed', title:'Exam Countdown',   desc:'Never be caught off-guard by an exam again. Track every upcoming test with smart countdowns and venue reminders.', tag:'Reminders' },
    { icon:<Users size={22} color="#059669"/>,  bg:'#ecfdf5', title:'Always In Sync',   desc:'Firebase-powered real-time sync keeps your schedule up to date across all your devices, anytime, anywhere.', tag:'Reliable' },
  ];
  const steps = [
    { num:'01', title:'Sign Up Free',    desc:'Create your account in seconds. No credit card, no hassle — just your email and you\'re in.', icon:<Mail size={28} color="#0891b2"/> },
    { num:'02', title:'Log a Class Swap',desc:'When your lecturer cancels a class, tap "+ Add Class". Fill in the replacement details instantly.', icon:<ClipboardList size={28} color="#7c3aed"/> },
    { num:'03', title:'Stay Ahead',      desc:'See all your upcoming replacements and exams in one clean dashboard. Status badges show what\'s urgent.', icon:<BarChart3 size={28} color="#059669"/> },
  ];
  const testimonials = [
    { name:'Izzati R.',   program:'Diploma in IT, Sem 3',  text:'I used to miss replacement classes all the time. This app literally saved my attendance record.', stars:5, avatarColor:'#0891b2' },
    { name:'Hafiz A.',    program:'Diploma in CS, Sem 2',  text:'The dashboard is so clean. I know exactly what\'s coming up each week without scrolling through group chats.', stars:5, avatarColor:'#7c3aed' },
    { name:'Syafiqah N.', program:'Diploma in IT, Sem 4',  text:'The exam countdown keeps me from panicking last minute. Wish I had this in Sem 1!', stars:5, avatarColor:'#059669' },
  ];
  const stats = [
    { value:120, suffix:'+', label:'Students Using It',  icon:<Users size={22} color="#0891b2"/> },
    { value:340, suffix:'+', label:'Classes Tracked',    icon:<ClipboardList size={22} color="#7c3aed"/> },
    { value:98,  suffix:'%', label:'Attendance Saved',   icon:<CheckCircle2 size={22} color="#059669"/> },
    { value:4.9, suffix:'★', label:'Average Rating',     icon:<Star size={22} color="#f59e0b" fill="#f59e0b"/> },
  ];

  // ── Wait for auth to resolve before rendering ──
  if (!authReady) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f9ff' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <LogoF dark={false} size="lg"/>
        <Loader2 size={24} color="#0891b2" style={{ animation:'spin 1s linear infinite', marginTop:8 }}/>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{globalStyles}</style>

      {/* ════════════ HOME ════════════ */}
      {screen==='home' && (
        <div style={{ overflowX:'hidden' }}>

          {/* NAVBAR */}
          <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:'rgba(240,249,255,0.97)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(8,145,178,0.1)' }}>
            <div style={{ height:58, padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:1120, margin:'0 auto' }}>
              <div style={{ cursor:'pointer', flexShrink:0 }} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>
                <LogoF dark={false} size="sm"/>
              </div>
              <div className="nav-links-desktop" style={{ display:'flex', gap:28, alignItems:'center' }}>
                {['features','how-it-works','testimonials','about'].map(id=>(
                  <button key={id} className="hp-nav-link" onClick={()=>scrollTo(id)}>
                    {id.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                <button className="btn-primary" style={{ padding:'8px 14px', fontSize:13, whiteSpace:'nowrap', borderRadius:12 }} onClick={()=>setScreen('auth')}>
                  {user ? 'Dashboard' : 'Get Started'}
                </button>
                <button onClick={()=>setMenuOpen(o=>!o)} style={{ background:menuOpen?'rgba(8,145,178,0.1)':'rgba(0,0,0,0.04)', border:'none', cursor:'pointer', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:10, flexShrink:0 }}>
                  {menuOpen ? <X size={18} color="#0891b2"/> : <Menu size={18} color="#0c1e35"/>}
                </button>
              </div>
            </div>
            {menuOpen && (
              <div style={{ background:'white', margin:'0 12px 10px', borderRadius:18, padding:'6px', boxShadow:'0 12px 40px rgba(0,0,0,0.12)', border:'1px solid rgba(8,145,178,0.1)' }}>
                {[{id:'features',label:'Features'},{id:'how-it-works',label:'How It Works'},{id:'testimonials',label:'Testimonials'},{id:'about',label:'About'}].map(({id,label})=>(
                  <button key={id} onClick={()=>scrollTo(id)} style={{ display:'block', width:'100%', textAlign:'left', background:'none', border:'none', padding:'13px 16px', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:700, color:'#0c1e35', cursor:'pointer', borderRadius:12 }}
                    onMouseEnter={e=>e.currentTarget.style.background='#f0f9ff'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    {label}
                  </button>
                ))}
                <div style={{ height:1, background:'rgba(8,145,178,0.08)', margin:'4px 12px 8px' }}/>
                <button onClick={()=>{setMenuOpen(false);setScreen(user?'dashboard':'auth');}} style={{ display:'block', width:'calc(100% - 16px)', margin:'0 8px 6px', background:'linear-gradient(135deg,#0891b2,#0e7490)', color:'white', border:'none', borderRadius:13, padding:'13px', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  {user ? 'Go to Dashboard →' : 'Get Started Free →'}
                </button>
              </div>
            )}
          </nav>

          {/* HERO */}
          <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', paddingTop:80, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(8,145,178,0.08) 0%,transparent 70%)', top:-100, right:-100, pointerEvents:'none' }}/>
            <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)', bottom:0, left:-80, pointerEvents:'none' }}/>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', opacity:0.4 }}>
              <defs><pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="rgba(8,145,178,0.15)"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#dots)"/>
            </svg>
            <div style={{ maxWidth:1120, margin:'0 auto', padding:'40px 24px 80px', width:'100%', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:48, alignItems:'center', position:'relative', zIndex:1 }}>
              <div style={{ maxWidth:560 }}>
                <div className="hp-badge h1" style={{ marginBottom:20 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'pulseDot 2s infinite' }}/>
                  Now live for KPMAIWP students
                </div>
                <h1 className="h2" style={{ fontSize:'clamp(36px,7vw,60px)', fontWeight:900, color:'#0c1e35', lineHeight:1.05, letterSpacing:'-2px', marginBottom:22 }}>
                  Never Walk Into<br/>
                  <span style={{ color:'#0891b2', position:'relative' }}>
                    an Empty Room
                    <svg style={{ position:'absolute', bottom:-6, left:0, width:'100%', overflow:'visible' }} height="8">
                      <path d="M0,4 Q50%,0 100%,4" stroke="#06b6d4" strokeWidth="3" fill="none" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <br/>Again.
                </h1>
                <p className="h3" style={{ fontSize:17, color:'#64748b', lineHeight:1.7, marginBottom:34, maxWidth:440 }}>
                  The smartest way for students to track <strong style={{ color:'#0c1e35' }}>cancelled classes</strong>, replacement schedules, and upcoming exams — all in one beautiful app.
                </p>
                <div className="h4" style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:44 }}>
                  <button className="btn-primary" style={{ padding:'15px 30px', fontSize:16, display:'flex', alignItems:'center', gap:8 }} onClick={()=>setScreen(user?'dashboard':'auth')}>
                    {user ? 'Go to Dashboard' : 'Start Free'} <ArrowRight size={18}/>
                  </button>
                  <button onClick={()=>scrollTo('how-it-works')} style={{ background:'transparent', color:'#0891b2', border:'2px solid rgba(8,145,178,0.3)', borderRadius:16, padding:'15px 24px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                    See How It Works
                  </button>
                </div>
                <div className="h5" style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
                  {[['120+','Students'],['340+','Classes Tracked'],['Free','Forever']].map(([val,lbl])=>(
                    <div key={lbl}>
                      <div style={{ fontSize:20, fontWeight:900, color:'#0891b2', letterSpacing:'-0.5px' }}>{val}</div>
                      <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, marginTop:1 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'center', animation:'heroIn 0.8s ease 0.5s both', opacity:0 }}>
                <div style={{ animation:'floatCard 4s ease-in-out infinite', transform:'rotate(-1deg)' }}>
                  <SchedulePreview/>
                </div>
              </div>
            </div>
            <div className="scroll-hint" style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:2 }}>
              <span>Scroll to explore</span><ChevronDown size={16}/>
            </div>
          </section>

          {/* STATS */}
          <section style={{ background:'white', borderTop:'1px solid rgba(8,145,178,0.08)', borderBottom:'1px solid rgba(8,145,178,0.08)', padding:'48px 24px' }}>
            <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
              {stats.map((s,i)=>(
                <Reveal key={i} delay={i*80}>
                  <div className="hp-stat">
                    <div style={{ marginBottom:10, display:'flex', justifyContent:'center' }}>{s.icon}</div>
                    <div style={{ fontSize:30, fontWeight:900, color:'#0891b2', letterSpacing:'-1px' }}><StatCounter end={s.value} suffix={s.suffix}/></div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#94a3b8', marginTop:3 }}>{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" style={{ padding:'80px 24px' }}>
            <div style={{ maxWidth:1120, margin:'0 auto' }}>
              <Reveal>
                <div style={{ textAlign:'center', marginBottom:52 }}>
                  <div className="hp-badge" style={{ justifyContent:'center', marginBottom:16 }}><Sparkles size={12}/> Everything You Need</div>
                  <h2 style={{ fontSize:'clamp(28px,5vw,42px)', fontWeight:900, color:'#0c1e35', letterSpacing:'-1px', marginBottom:14 }}>Built for the Chaos<br/>of Student Life</h2>
                  <p style={{ fontSize:16, color:'#64748b', maxWidth:460, margin:'0 auto', lineHeight:1.7 }}>Every feature is designed around one mission: making sure you never miss a class again.</p>
                </div>
              </Reveal>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
                {features.map((f,i)=>(
                  <Reveal key={i} delay={i*80}>
                    <div className="hp-feat-card">
                      <span className="hp-tag">{f.tag}</span>
                      <div style={{ width:48, height:48, borderRadius:14, background:f.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>{f.icon}</div>
                      <h3 style={{ fontSize:17, fontWeight:800, color:'#0c1e35', marginBottom:8 }}>{f.title}</h3>
                      <p style={{ fontSize:14, color:'#64748b', lineHeight:1.65 }}>{f.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how-it-works" style={{ background:'white', padding:'80px 24px', borderTop:'1px solid rgba(8,145,178,0.08)' }}>
            <div style={{ maxWidth:1000, margin:'0 auto' }}>
              <Reveal>
                <div style={{ textAlign:'center', marginBottom:52 }}>
                  <div className="hp-badge" style={{ justifyContent:'center', marginBottom:16 }}><Clock size={12}/> Simple as 1-2-3</div>
                  <h2 style={{ fontSize:'clamp(28px,5vw,42px)', fontWeight:900, color:'#0c1e35', letterSpacing:'-1px', marginBottom:14 }}>Up and Running<br/>in Under 2 Minutes</h2>
                  <p style={{ fontSize:16, color:'#64748b', maxWidth:420, margin:'0 auto', lineHeight:1.7 }}>No complicated setup. No tutorials. Just sign up and start tracking.</p>
                </div>
              </Reveal>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
                {steps.map((s,i)=>(
                  <Reveal key={i} delay={i*100}>
                    <div className="hp-step-card">
                      <div style={{ position:'absolute', top:20, right:20, fontSize:38, fontWeight:900, color:'rgba(8,145,178,0.07)' }}>{s.num}</div>
                      <div style={{ marginBottom:14 }}>{s.icon}</div>
                      <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#0891b2,#06b6d4)', marginBottom:12 }}>
                        <span style={{ fontSize:12, fontWeight:900, color:'white' }}>{i+1}</span>
                      </div>
                      <h3 style={{ fontSize:16, fontWeight:800, color:'#0c1e35', marginBottom:8 }}>{s.title}</h3>
                      <p style={{ fontSize:13, color:'#64748b', lineHeight:1.65 }}>{s.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section id="testimonials" style={{ padding:'80px 24px', background:'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)' }}>
            <div style={{ maxWidth:1000, margin:'0 auto' }}>
              <Reveal>
                <div style={{ textAlign:'center', marginBottom:52 }}>
                  <div className="hp-badge" style={{ justifyContent:'center', marginBottom:16 }}><Star size={12}/> Student Reviews</div>
                  <h2 style={{ fontSize:'clamp(28px,5vw,42px)', fontWeight:900, color:'#0c1e35', letterSpacing:'-1px', marginBottom:14 }}>Loved by Students<br/>Across Campus</h2>
                </div>
              </Reveal>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
                {testimonials.map((t,i)=>(
                  <Reveal key={i} delay={i*90}>
                    <div className="hp-testi">
                      <div style={{ display:'flex', gap:3, marginBottom:14 }}>{Array(t.stars).fill(0).map((_,j)=><Star key={j} size={14} color="#f59e0b" fill="#f59e0b"/>)}</div>
                      <p style={{ fontSize:14, color:'#374151', lineHeight:1.7, marginBottom:18, fontStyle:'italic' }}>"{t.text}"</p>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${t.avatarColor},${t.avatarColor}99)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <UserCheck size={20} color="white"/>
                        </div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:800, color:'#0c1e35' }}>{t.name}</div>
                          <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>{t.program}</div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
              {/* CTA Banner */}
              <Reveal delay={200}>
                <div style={{ marginTop:48, background:'linear-gradient(135deg,#0891b2,#0e7490)', borderRadius:28, padding:'36px 32px', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:20, boxShadow:'0 12px 40px rgba(8,145,178,0.3)' }}>
                  <div>
                    <h3 style={{ fontSize:22, fontWeight:900, color:'white', marginBottom:6 }}>Ready to save your attendance?</h3>
                    <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)' }}>Join 120+ students already using Attendance Saver.</p>
                  </div>
                  <button onClick={()=>setScreen(user?'dashboard':'auth')} style={{ background:'white', color:'#0891b2', border:'none', borderRadius:16, padding:'14px 28px', fontSize:15, fontWeight:900, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap' }}>
                    {user ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight size={17}/>
                  </button>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ABOUT / DEVELOPER */}
          <section id="about" style={{ background:'#0c1e35', padding:'80px 24px' }}>
            <div style={{ maxWidth:1000, margin:'0 auto' }}>
              <Reveal>
                <div style={{ textAlign:'center', marginBottom:52 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(8,145,178,0.15)', border:'1px solid rgba(8,145,178,0.25)', padding:'6px 16px', borderRadius:20, fontSize:12, fontWeight:700, color:'#38bdf8', marginBottom:16 }}>
                    <Code2 size={12}/> Meet the Developer
                  </div>
                  <h2 style={{ fontSize:'clamp(28px,5vw,40px)', fontWeight:900, color:'white', letterSpacing:'-1px' }}>
                    Built with <Heart size={20} color="#ef4444" fill="#ef4444" style={{display:'inline',verticalAlign:'middle'}}/> by a Student, for Students
                  </h2>
                </div>
              </Reveal>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:28, alignItems:'start' }}>
                {/* Dev card */}
                <Reveal direction="left">
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:28, padding:'32px 28px', textAlign:'center' }}>
                    <div style={{ marginBottom:20, display:'flex', justifyContent:'center' }}>
                      <div className="hp-avatar-ring" style={{ position:'relative', display:'inline-block' }}>
  <div style={{ width:110, height:110, borderRadius:'50%', background:'linear-gradient(135deg,#0891b2,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', border:'3px solid #0c1e35', overflow:'hidden', position:'relative', zIndex:1 }}>
    
    {/* Swapped the icon for your image! */}
    <img 
      src="/profile.JPG" /* Make sure this matches your exact filename! */
      alt="Ahmad Muqri"
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover', /* 'cover' ensures your photo fills the circle perfectly without stretching */
      }} 
    />

  </div>
  <div style={{ position:'absolute', bottom:6, right:6, width:18, height:18, borderRadius:'50%', background:'#22c55e', border:'3px solid #0c1e35', zIndex:2 }}/>
</div>
                    </div>
                    <h3 style={{ fontSize:22, fontWeight:900, color:'white', letterSpacing:'-0.4px', marginBottom:4 }}>Ahmad Muqri</h3>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:8 }}>
                      <GraduationCap size={13} color="#38bdf8"/>
                      <span style={{ fontSize:13, color:'#38bdf8', fontWeight:600 }}>Final Year Diploma Student</span>
                    </div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>MAIWP Professional College (KPMAIWP)<br/>Diploma in Information Technology</div>
                    <div style={{ background:'rgba(8,145,178,0.1)', border:'1px solid rgba(8,145,178,0.2)', borderRadius:16, padding:'16px 18px', marginBottom:22 }}>
                      <div style={{ fontSize:28, color:'#0891b2', lineHeight:1, marginBottom:8, fontFamily:'serif' }}>"</div>
                      <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.7, fontStyle:'italic' }}>I built this because IT students have enough bugs to worry about — missing a replacement class shouldn't be one of them.</p>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:7, justifyContent:'center', marginBottom:22 }}>
                      {['React','Firebase','UI/UX','JavaScript','Node.js'].map(s=>(
                        <span key={s} style={{ background:'rgba(8,145,178,0.12)', border:'1px solid rgba(8,145,178,0.2)', borderRadius:20, padding:'4px 12px', fontSize:11, fontWeight:700, color:'#38bdf8' }}>{s}</span>
                      ))}
                    </div>
                    <div style={{ display:'flex', justifyContent:'center', gap:10 }}>
                      <a href="https://github.com/ahmadmuqri" target="_blank" rel="noreferrer" className="hp-social"><Github size={18}/></a>
                      <a href="https://linkedin.com/in/ahmadmuqri" target="_blank" rel="noreferrer" className="hp-social"><Linkedin size={18}/></a>
                      <a href="https://instagram.com/ahmadmuqri" target="_blank" rel="noreferrer" className="hp-social"><Instagram size={18}/></a>
                    </div>
                  </div>
                </Reveal>
                {/* Contact form */}
                <Reveal direction="right" delay={100}>
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:28, padding:'32px 28px' }}>
                    <h3 style={{ fontSize:19, fontWeight:800, color:'white', marginBottom:6 }}>Get in Touch</h3>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24, lineHeight:1.6 }}>Found a bug? Have an idea? Want to collaborate?</p>
                    <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
                      {[{val:'Bug Report',icon:<Bug size={11}/>,color:'#ef4444'},{val:'Feature Idea',icon:<Lightbulb size={11}/>,color:'#f59e0b'},{val:'Collaboration',icon:<Users size={11}/>,color:'#0891b2'}].map(t=>(
                        <button key={t.val} onClick={()=>setContactForm(f=>({...f,type:t.val}))} style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${contactForm.type===t.val?t.color:'rgba(255,255,255,0.12)'}`, background:contactForm.type===t.val?t.color+'18':'transparent', color:contactForm.type===t.val?t.color:'rgba(255,255,255,0.4)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", display:'flex', alignItems:'center', gap:5 }}>
                          {t.icon} {t.val}
                        </button>
                      ))}
                    </div>
                    {contactSent ? (
                      <div style={{ textAlign:'center', padding:'40px 20px' }}>
                        <div style={{ marginBottom:12, display:'flex', justifyContent:'center' }}>
                          <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(8,145,178,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <CheckCircle2 size={30} color="#0891b2"/>
                          </div>
                        </div>
                        <div style={{ fontSize:18, fontWeight:800, color:'white', marginBottom:6 }}>Message Sent!</div>
                        <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>Thanks! I'll get back to you soon.</div>
                        <button onClick={()=>{setContactSent(false);setContactForm({name:'',type:'Bug Report',message:''}); }} style={{ marginTop:20, background:'rgba(8,145,178,0.2)', border:'1px solid rgba(8,145,178,0.3)', color:'#38bdf8', borderRadius:12, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                          Send Another
                        </button>
                      </div>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                        <input className="hp-input" placeholder="Your Name" value={contactForm.name} onChange={e=>setContactForm(f=>({...f,name:e.target.value}))}/>
                        <textarea className="hp-input hp-textarea" placeholder={`Describe your ${contactForm.type.toLowerCase()}...`} value={contactForm.message} onChange={e=>setContactForm(f=>({...f,message:e.target.value}))}/>
                        <button onClick={()=>{
                          if(contactForm.name&&contactForm.message){
                            window.location.href=`mailto:ahmadmuqri31@gmail.com?subject=[${contactForm.type}] from ${contactForm.name}&body=${encodeURIComponent(contactForm.message)}`;
                            setContactSent(true);
                          }
                        }} style={{ background:'linear-gradient(135deg,#0891b2,#0e7490)', color:'white', border:'none', borderRadius:14, padding:'14px', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                          <Send size={16}/> Send Message
                        </button>
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ background:'#080e1c', padding:'28px 24px', textAlign:'center' }}>
            <div style={{ maxWidth:1000, margin:'0 auto' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
                <LogoF dark={true} size="sm"/>
              </div>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', gap:5, flexWrap:'wrap' }}>
                © {new Date().getFullYear()} Ahmad Muqri · KPMAIWP ·
                <span style={{ display:'flex', alignItems:'center', gap:4 }}>Built with <Heart size={11} color="#ef4444" fill="#ef4444"/> in React &amp; Firebase</span>
              </p>
            </div>
          </footer>
        </div>
      )}

      {/* ════════════ AUTH ════════════ */}
      {screen==='auth' && (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:22, position:'relative' }}>
          <div style={{ position:'fixed', width:500, height:300, borderRadius:'50%', background:'linear-gradient(135deg,rgba(6,182,212,0.1),rgba(20,184,166,0.07))', top:-80, right:-120, pointerEvents:'none', transform:'rotate(-15deg)' }}/>
          <div style={{ position:'fixed', width:300, height:300, borderRadius:'50%', background:'linear-gradient(135deg,rgba(139,92,246,0.06),rgba(99,102,241,0.04))', bottom:40, left:-80, pointerEvents:'none' }}/>

          {showForgot && <ForgotPasswordModal onClose={()=>setShowForgot(false)}/>}

          <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
            <button onClick={()=>setScreen('home')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:'#64748b', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:700, marginBottom:28 }}>
              <ChevronLeft size={16}/> Back to Home
            </button>
            <div style={{ background:'white', borderRadius:28, padding:'32px 28px', border:'1px solid rgba(8,145,178,0.1)', boxShadow:'0 8px 40px rgba(8,145,178,0.1)' }}>
              <div style={{ textAlign:'center', marginBottom:26 }}>
                <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
                  <LogoF dark={false} size="lg"/>
                </div>
                <h2 style={{ fontSize:22, fontWeight:900, color:'#0c1e35', letterSpacing:'-0.5px' }}>
                  {authMode==='login' ? 'Welcome Back!' : 'Create Account'}
                </h2>
                <p style={{ fontSize:13, color:'#94a3b8', marginTop:4 }}>Keep your schedule in sync</p>
              </div>
              {/* Toggle */}
              <div style={{ display:'flex', background:'#f1f5f9', borderRadius:16, padding:4, marginBottom:24, gap:4 }}>
                {['login','signup'].map(m=>(
                  <button key={m} onClick={()=>{ setAuthMode(m); setAuthEmail(''); setAuthPwd(''); }}
                    className={authMode===m?'dash-tab-active':'dash-tab-inactive'}
                    style={{ flex:1, padding:'9px 0', border:'none', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:700, borderRadius:12, transition:'all 0.2s' }}>
                    {m==='login' ? 'Login' : 'Sign Up'}
                  </button>
                ))}
              </div>
              <form onSubmit={handleAuth} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label className="app-label">Email</label>
                  <input className="app-input" placeholder="your@email.com" type="email" required value={authEmail} onChange={e=>setAuthEmail(e.target.value)}/>
                </div>
                <div>
                  <label className="app-label">Password</label>
                  <div style={{ position:'relative' }}>
                    <input className="app-input" placeholder="••••••••" type={showPwd?'text':'password'} required value={authPwd} onChange={e=>setAuthPwd(e.target.value)} style={{ paddingRight:46 }}/>
                    <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex' }}>
                      {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
                {authMode==='login' && (
                  <div style={{ textAlign:'right', marginTop:-6 }}>
                    <button type="button" onClick={()=>setShowForgot(true)} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, color:'#0891b2', fontWeight:700 }}>
                      Forgot password?
                    </button>
                  </div>
                )}
                <button className="btn-primary" style={{ padding:'15px', fontSize:15, marginTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} disabled={authLoading}>
                  {authLoading ? <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }}/> : (authMode==='login' ? 'Login' : 'Create Account')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ DASHBOARD ════════════ */}
      {screen==='dashboard' && (
        <div style={{ minHeight:'100vh', paddingBottom:100 }}>
          <div style={{ position:'sticky', top:0, zIndex:10, background:'rgba(240,249,255,0.94)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(8,145,178,0.1)', padding:'14px 20px 0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <LogoF dark={false} size="md"/>
              <button onClick={()=>setShowLogout(true)} style={{ background:'#fff5f5', border:'none', borderRadius:12, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <LogOut size={16} color="#ef4444"/>
              </button>
            </div>
            <div style={{ display:'flex', background:'#f1f5f9', borderRadius:16, padding:4, marginBottom:14, gap:4 }}>
              {['classes','exams'].map(t=>(
                <button key={t} onClick={()=>setActiveTab(t)}
                  className={activeTab===t?'dash-tab-active':'dash-tab-inactive'}
                  style={{ flex:1, padding:'9px 0', border:'none', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:700, borderRadius:12, transition:'all 0.2s' }}>
                  {t==='classes' ? '📋 Classes' : '📝 Exams'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding:'14px 16px' }}>
            {dataLoading ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 20px', gap:16 }}>
                <LogoF dark={false} size="md"/>
                <Loader2 size={28} color="#0891b2" style={{ animation:'spin 1s linear infinite' }}/>
                <p style={{ fontSize:13, color:'#94a3b8', fontWeight:600 }}>Loading your schedule...</p>
              </div>
            ) : activeTab==='classes' ? (
              classes.length===0 ? (
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
  <button onClick={() => openAddClass()} style={{ 
    background: 'white', border: '1px solid rgba(8,145,178,0.2)', 
    color: '#0891b2', fontWeight: 800, fontSize: 13, 
    padding: '10px 20px', borderRadius: 16, cursor: 'pointer', 
    display: 'inline-flex', alignItems: 'center', gap: 6,
    boxShadow: '0 4px 12px rgba(8,145,178,0.08)'
  }}>
    <Plus size={16}/> Add Class Swap
  </button>
</div>
              ) : classes.map((item,i)=>{
                const st = getStatus(item.repDate);
                return (
                  <div key={item.id} className="dash-card">
                    <div style={{ height:4, background:'linear-gradient(90deg,#0891b2,#06b6d4,#22d3ee)' }}/>
                    <div style={{ padding:'16px 18px 10px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:10, fontWeight:800, color:C.primary, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:3, display:'flex', alignItems:'center', gap:5 }}>
                            <span style={{ display:'inline-block', width:3, height:10, background:C.primary, borderRadius:2 }}/>{item.courseCode}
                          </div>
                          <div style={{ fontSize:17, fontWeight:800, color:C.text, letterSpacing:'-0.3px' }}>{item.subject}</div>
                          {st && <span style={{ background:st.bg, color:st.color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:800, display:'inline-flex', alignItems:'center', gap:4, marginTop:6 }}>{st.icon} {st.label}</span>}
                        </div>
                        <div style={{ display:'flex', gap:2, marginLeft:8 }}>
                          <button className="dash-action" onClick={()=>openAddClass(item)}><Edit2 size={13} color="#94a3b8"/></button>
                          <button className="dash-action" onClick={()=>deleteClass(item.id)}><Trash2 size={13} color="#fca5a5"/></button>
                        </div>
                      </div>
                      <div style={{ marginBottom:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                          <div style={{ width:24, height:24, borderRadius:7, background:'#ecfdf5', display:'flex', alignItems:'center', justifyContent:'center' }}><CalendarCheck size={12} color="#059669"/></div>
                          <span style={{ fontSize:9, fontWeight:900, color:'#059669', textTransform:'uppercase', letterSpacing:'0.08em' }}>Replacement</span>
                        </div>
                        <div style={{ background:'#f8faff', borderRadius:12, padding:'10px 14px' }}>
                          <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{fmt(item.repDate)} · {item.repStart}–{item.repEnd}</div>
                          <div style={{ fontSize:11, color:C.muted, marginTop:2, display:'flex', alignItems:'center', gap:4 }}><MapPin size={10}/>{item.repVenue}</div>
                        </div>
                      </div>
                      <div style={{ marginBottom:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                          <div style={{ width:24, height:24, borderRadius:7, background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center' }}><CalendarX size={12} color="#ef4444"/></div>
                          <span style={{ fontSize:9, fontWeight:900, color:'#ef4444', textTransform:'uppercase', letterSpacing:'0.08em' }}>Cancelled</span>
                        </div>
                        <div style={{ background:'#fff5f5', borderRadius:12, padding:'10px 14px', borderLeft:'3px solid #fca5a5' }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8', textDecoration:'line-through' }}>{fmt(item.canDate)}</div>
                          <div style={{ fontSize:11, fontStyle:'italic', color:'#ef4444', marginTop:2 }}>"{item.canReason}"</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              exams.length===0 ? (
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
  <button onClick={() => openAddExam()} style={{ 
    background: 'white', border: '1px solid rgba(99,102,241,0.2)', 
    color: '#6366f1', fontWeight: 800, fontSize: 13, 
    padding: '10px 20px', borderRadius: 16, cursor: 'pointer', 
    display: 'inline-flex', alignItems: 'center', gap: 6,
    boxShadow: '0 4px 12px rgba(99,102,241,0.08)'
  }}>
    <Plus size={16}/> Add Exam
  </button>
</div>
              ) : exams.map((item)=>{
                const dl = getDaysLeft(item.date);
                return (
                  <div key={item.id} className="dash-card">
                    <div style={{ height:4, background:'linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa)' }}/>
                    <div style={{ padding:'16px 18px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                        <div>
                          <div style={{ fontSize:17, fontWeight:800, color:C.text }}>{item.subject}</div>
                          <div style={{ fontSize:12, color:C.muted, marginTop:3, fontWeight:500 }}>{item.topic}</div>
                        </div>
                        <div style={{ display:'flex', gap:2 }}>
                          <button className="dash-action" onClick={()=>openAddExam(item)}><Edit2 size={13} color="#94a3b8"/></button>
                          <button className="dash-action" onClick={()=>deleteExam(item.id)}><Trash2 size={13} color="#fca5a5"/></button>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap' }}>
                        <span className="dash-chip" style={{ background:'#eff6ff', color:'#3b82f6' }}><CalendarCheck size={11} color="#3b82f6"/> {fmt(item.date)}</span>
                        {dl && <span className="dash-chip" style={{ background:dl.color+'12', color:dl.color }}><Clock size={11} color={dl.color}/> {dl.label}</span>}
                        <span className="dash-chip" style={{ background:'#f8faff', color:C.muted }}><Clock size={11} color={C.muted}/> {item.start}–{item.end}</span>
                        <span className="dash-chip" style={{ background:'#f8faff', color:C.muted }}><MapPin size={11} color={C.muted}/> {item.venue}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* FAB */}
          <div style={{ position:'fixed', bottom:28, right:22, zIndex:100, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
            {fabOpen && (
              <>
                <div onClick={()=>setFabOpen(false)} style={{ position:'fixed', inset:0, zIndex:-1 }}/>
                <div style={{ display:'flex', alignItems:'center', gap:10, animation:'heroIn 0.18s ease both' }}>
                  <span style={{ background:'white', borderRadius:12, padding:'7px 14px', fontSize:12, fontWeight:800, color:'#6366f1', boxShadow:'0 4px 16px rgba(0,0,0,0.1)', whiteSpace:'nowrap' }}>Add Exam</span>
                  <button onClick={()=>{ setFabOpen(false); openAddExam(); }} style={{ width:46, height:46, borderRadius:'50%', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 18px rgba(99,102,241,0.4)', flexShrink:0 }}>
                    <BookOpen size={18} color="white"/>
                  </button>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, animation:'heroIn 0.18s ease 70ms both' }}>
                  <span style={{ background:'white', borderRadius:12, padding:'7px 14px', fontSize:12, fontWeight:800, color:'#059669', boxShadow:'0 4px 16px rgba(0,0,0,0.1)', whiteSpace:'nowrap' }}>Add Class</span>
                  <button onClick={()=>{ setFabOpen(false); openAddClass(); }} style={{ width:46, height:46, borderRadius:'50%', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#059669,#10b981)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 18px rgba(5,150,105,0.4)', flexShrink:0 }}>
                    <CalendarCheck size={18} color="white"/>
                  </button>
                </div>
              </>
            )}
            <button onClick={()=>setFabOpen(o=>!o)} className="fab" style={{ width:58, height:58, transform:fabOpen?'rotate(45deg)':'rotate(0deg)', transition:'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <Plus size={26}/>
            </button>
          </div>
        </div>
      )}

      {/* ════════════ ADD CLASS ════════════ */}
      {screen==='addClass' && (
        <div style={{ minHeight:'100vh', paddingBottom:40 }}>
          <div style={{ position:'sticky', top:0, zIndex:10, background:'rgba(240,249,255,0.96)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(8,145,178,0.1)', padding:'14px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={()=>setScreen('dashboard')} style={{ background:'#f1f5f9', border:'none', borderRadius:12, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <ChevronLeft size={17} color={C.muted}/>
              </button>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:C.primary, textTransform:'uppercase', letterSpacing:'0.08em' }}>{editItem?'Edit':'New'} Entry</div>
                <h2 style={{ fontSize:18, fontWeight:900, color:C.text, letterSpacing:'-0.3px' }}>Class Swap</h2>
              </div>
            </div>
          </div>
          <div style={{ padding:'20px 18px' }}>
            <div style={{ marginBottom:14 }}>
              <label className="app-label">Subject Name *</label>
              <input className="app-input" placeholder="e.g. System Paradigm" value={classForm.subject} onChange={e=>setClassForm({...classForm,subject:e.target.value})}/>
            </div>
            <div style={{ marginBottom:16 }}>
              <label className="app-label">Course Code</label>
              <input className="app-input" placeholder="e.g. ITT 2263" value={classForm.courseCode} onChange={e=>setClassForm({...classForm,courseCode:e.target.value})}/>
            </div>
            <div className="form-section" style={{ borderTop:'3px solid #059669' }}>
              <div style={{ fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', color:'#059669', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
                <CalendarCheck size={13} color="#059669"/> Replacement Schedule
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="app-label">Date *</label>
                <input className="app-input" type="date" value={classForm.repDate} onChange={e=>setClassForm({...classForm,repDate:e.target.value})}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div>
                  <label className="app-label">Start</label>
                  <select className="app-input" value={classForm.repStart} onChange={e=>setClassForm({...classForm,repStart:e.target.value})}>
                    {TIME_SLOTS.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="app-label">End</label>
                  <select className="app-input" value={classForm.repEnd} onChange={e=>setClassForm({...classForm,repEnd:e.target.value})}>
                    {validEnd(classForm.repStart).map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="app-label">Venue</label>
                <input className="app-input" placeholder="e.g. Lab 4 / Online via Zoom" value={classForm.repVenue} onChange={e=>setClassForm({...classForm,repVenue:e.target.value})}/>
              </div>
            </div>
            <div className="form-section" style={{ borderTop:'3px solid #ef4444' }}>
              <div style={{ fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', color:'#ef4444', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
                <CalendarX size={13} color="#ef4444"/> Cancelled Class Info
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="app-label">Cancelled Date *</label>
                <input className="app-input" type="date" value={classForm.canDate} onChange={e=>setClassForm({...classForm,canDate:e.target.value})}/>
              </div>
              <div>
                <label className="app-label">Reason</label>
                <div style={{ position:'relative' }}>
                  <input className="app-input" placeholder="e.g. Emergency Leave" maxLength={60} value={classForm.canReason} onChange={e=>setClassForm({...classForm,canReason:e.target.value})} style={{ paddingRight:44 }}/>
                  <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:10, color:C.light }}>{classForm.canReason.length}/60</span>
                </div>
              </div>
            </div>
            <button className="btn-primary" style={{ width:'100%', padding:'16px', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={saveClass}>
              {editItem ? 'Update Class Swap' : 'Save Class Swap'}
            </button>
          </div>
        </div>
      )}

      {/* ════════════ ADD EXAM ════════════ */}
      {screen==='addExam' && (
        <div style={{ minHeight:'100vh', paddingBottom:40 }}>
          <div style={{ position:'sticky', top:0, zIndex:10, background:'rgba(240,249,255,0.96)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(8,145,178,0.1)', padding:'14px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={()=>setScreen('dashboard')} style={{ background:'#f1f5f9', border:'none', borderRadius:12, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <ChevronLeft size={17} color={C.muted}/>
              </button>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:C.primary, textTransform:'uppercase', letterSpacing:'0.08em' }}>{editItem?'Edit':'New'} Entry</div>
                <h2 style={{ fontSize:18, fontWeight:900, color:C.text, letterSpacing:'-0.3px' }}>Exam Reminder</h2>
              </div>
            </div>
          </div>
          <div style={{ padding:'20px 18px' }}>
            <div style={{ marginBottom:14 }}>
              <label className="app-label">Subject *</label>
              <input className="app-input" placeholder="e.g. Data Structures" value={examForm.subject} onChange={e=>setExamForm({...examForm,subject:e.target.value})}/>
            </div>
            <div style={{ marginBottom:14 }}>
              <label className="app-label">Topic / Scope</label>
              <input className="app-input" placeholder="e.g. Final Exam (Ch 1–5)" value={examForm.topic} onChange={e=>setExamForm({...examForm,topic:e.target.value})}/>
            </div>
            <div style={{ marginBottom:14 }}>
              <label className="app-label">Exam Date *</label>
              <input className="app-input" type="date" value={examForm.date} onChange={e=>setExamForm({...examForm,date:e.target.value})}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              <div>
                <label className="app-label">Start Time</label>
                <select className="app-input" value={examForm.start} onChange={e=>setExamForm({...examForm,start:e.target.value})}>
                  {TIME_SLOTS.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="app-label">End Time</label>
                <select className="app-input" value={examForm.end} onChange={e=>setExamForm({...examForm,end:e.target.value})}>
                  {validEnd(examForm.start).map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:26 }}>
              <label className="app-label">Venue</label>
              <input className="app-input" placeholder="e.g. Main Hall A" value={examForm.venue} onChange={e=>setExamForm({...examForm,venue:e.target.value})}/>
            </div>
            <button className="btn-primary" style={{ width:'100%', padding:'16px', fontSize:15, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow:'0 4px 14px rgba(99,102,241,0.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={saveExam}>
              {editItem ? 'Update Exam' : 'Save Exam Reminder'}
            </button>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogout && (
        <div className="overlay">
          <div className="modal">
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <LogOut size={24} color="#ef4444"/>
            </div>
            <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:7 }}>Log Out?</div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:26, fontWeight:500 }}>You'll need to sign in again to access your schedule.</div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn-ghost" style={{ flex:1, padding:'13px 0', fontSize:14 }} onClick={()=>setShowLogout(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex:1, padding:'13px 0', fontSize:14, background:'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow:'0 4px 14px rgba(239,68,68,0.3)' }} onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast-bar" style={{ background: toastType==='error' ? '#ef4444' : '#059669', color: 'white' }}>
          {toast}
        </div>
      )}
    </div>
  );
}