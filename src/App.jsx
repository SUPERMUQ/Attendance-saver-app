import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, MapPin, AlertCircle, Plus, Trash2, Edit2, Share2, 
  X, ArrowRight, CheckCircle2, Sparkles, MessageSquare, Loader2, 
  BookOpen, RefreshCw, StickyNote, ShieldCheck, Zap, Users, LogOut, Mail, Lock,
  GraduationCap, Code, LayoutDashboard, Fingerprint, ChevronDown, Send, Bug, Lightbulb, 
  Github, Linkedin, Instagram, Heart, Menu
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
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
  orderBy
} from 'firebase/firestore';

// --- CONFIGURATION ---
// 🔴 IMPORTANT: Replace these with your actual keys from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const apiKey = ""; // Gemini API Key (Optional)

// Initialize Firebase
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase initialization failed. Check your config.");
}

// --- UTILITY FUNCTIONS ---
const formatDate = (dateString) => {
  if (!dateString) return 'TBD';
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const getDaysLeft = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(dateStr);
  exam.setHours(0, 0, 0, 0);
  const diff = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: 'Past', style: 'bg-stone-100 text-stone-400' };
  if (diff === 0) return { label: 'Today!', style: 'bg-amber-100 text-amber-600' };
  if (diff <= 7) return { label: `${diff}d left`, style: 'bg-rose-100 text-rose-600' };
  return { label: `${diff}d left`, style: 'bg-indigo-50 text-indigo-600' };
};

const getStatusBadge = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: 'Passed', style: 'bg-stone-100 text-stone-400' };
  if (diff === 0) return { label: '📅 Today!', style: 'bg-amber-100 text-amber-600' };
  if (diff <= 3) return { label: 'Soon', style: 'bg-rose-100 text-rose-600' };
  return { label: 'Upcoming', style: 'bg-emerald-100 text-emerald-600' };
};

const generateTimeSlots = () => {
  const slots = [];
  for (let h = 8; h <= 18; h++) {
    slots.push(`${h.toString().padStart(2, '0')}.00`);
    if (h < 18) slots.push(`${h.toString().padStart(2, '0')}.30`);
  }
  return slots;
};
const TIME_SLOTS = generateTimeSlots();

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split('.').map(Number);
  return h * 60 + m;
};

const getValidEndTimes = (startTime) => {
  if (!startTime) return [];
  const startMins = timeToMinutes(startTime);
  return TIME_SLOTS.filter(slot => timeToMinutes(slot) > startMins);
};

// --- ANIMATION WRAPPER ---
const ScrollReveal = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const Navbar = ({ onLoginClick, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl text-stone-900 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="bg-stone-900 text-white p-1.5 rounded-lg"><CheckCircle2 size={18} /></div>
          <span>Attendance Saver</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-500">
          <button onClick={() => scrollTo('features')} className="hover:text-stone-900 transition-colors">Features</button>
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-stone-900 transition-colors">How it Works</button>
          <button onClick={() => scrollTo('about')} className="hover:text-stone-900 transition-colors">About</button>
        </div>
        <button onClick={onLoginClick} className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
          {user ? 'Dashboard' : 'Login'}
        </button>
        <button className="md:hidden text-stone-900" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-b p-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
          <button onClick={() => scrollTo('features')} className="text-left font-bold text-stone-600">Features</button>
          <button onClick={() => scrollTo('how-it-works')} className="text-left font-bold text-stone-600">How it Works</button>
          <button onClick={() => scrollTo('about')} className="text-left font-bold text-stone-600">About</button>
        </div>
      )}
    </nav>
  );
};

const LandingPage = ({ onGetStarted }) => {
  const [contactData, setContactData] = useState({ name: '', type: 'Collaboration', message: '' });
  
  const handleContactSubmit = (e) => {
    e.preventDefault();
    const MY_EMAIL = "ahmadmuqri@example.com"; // 🔴 Change this to your real email
    window.location.href = `mailto:${MY_EMAIL}?subject=[${contactData.type}] from ${contactData.name}&body=${encodeURIComponent(contactData.message)}`;
  };

  return (
    <div className="min-h-screen bg-stone-50 overflow-x-hidden relative">
      <Navbar onLoginClick={onGetStarted} />
      
      {/* HERO */}
      <div className="max-w-4xl mx-auto px-6 pt-40 pb-20 text-center">
        <ScrollReveal><CheckCircle2 size={50} className="text-emerald-500 mx-auto mb-6 bg-white p-3 rounded-2xl shadow-xl rotate-3" /></ScrollReveal>
        <ScrollReveal delay={200}><h1 className="text-5xl md:text-8xl font-black text-stone-900 mb-6 leading-[1.1]">Stop Walking Into <br/><span className="text-rose-500">Empty Classrooms.</span></h1></ScrollReveal>
        <ScrollReveal delay={400}><p className="text-stone-500 text-lg md:text-2xl mb-10 max-w-2xl mx-auto">Track cancelled classes and <span className="text-stone-900 font-bold underline decoration-emerald-400 decoration-4">never miss a replacement class.</span></p></ScrollReveal>
        <ScrollReveal delay={600}><button onClick={onGetStarted} className="px-10 py-5 bg-stone-900 text-white font-bold text-xl rounded-2xl shadow-2xl hover:scale-105 transition-all">Start Tracking Now <ArrowRight className="inline ml-2"/></button></ScrollReveal>
      </div>

      {/* ADVANTAGES */}
      <div id="features" className="bg-white py-24 border-y">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <ScrollReveal delay={100} className="bg-stone-50 p-8 rounded-3xl border">
            <ShieldCheck size={32} className="text-rose-500 mb-4" />
            <h3 className="font-bold text-xl mb-2">Attendance Saver</h3>
            <p className="text-stone-500 text-sm">Rescheduled classes ruin your record. We ensure you're always in the right room at the right time.</p>
          </ScrollReveal>
          <ScrollReveal delay={200} className="bg-stone-50 p-8 rounded-3xl border">
            <Zap size={32} className="text-indigo-500 mb-4" />
            <h3 className="font-bold text-xl mb-2">AI Magic Fill</h3>
            <p className="text-stone-500 text-sm">Paste that long, messy WhatsApp message from your lecturer. Our AI parses the details for you instantly.</p>
          </ScrollReveal>
          <ScrollReveal delay={300} className="bg-stone-50 p-8 rounded-3xl border">
            <Users size={32} className="text-emerald-500 mb-4" />
            <h3 className="font-bold text-xl mb-2">Class Hero</h3>
            <p className="text-stone-500 text-sm">Generate professional summary messages with one click to share back into your class groups.</p>
          </ScrollReveal>
        </div>
      </div>

      {/* TUTORIAL */}
      <div id="how-it-works" className="py-24 max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-black text-center mb-16">How to Use</h2>
        <div className="space-y-8">
          {[
            { step: 1, title: "Sign Up", desc: "Create an account so your schedule stays synced on your phone." },
            { step: 2, title: "Add Swap", desc: "Choose 'Class Swap' when a lecturer cancels or moves a class." },
            { step: 3, title: "Stay Alert", desc: "Get a clear view of your upcoming week so you never miss a lesson." }
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 100} className="flex gap-6 items-center p-6 bg-white rounded-3xl border">
              <div className="w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center font-bold text-xl shrink-0">{item.step}</div>
              <div><h4 className="font-bold text-lg">{item.title}</h4><p className="text-stone-500">{item.desc}</p></div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ABOUT & CONTACT */}
      <div id="about" className="bg-stone-900 text-white py-24 rounded-t-[3rem]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16">
          <ScrollReveal>
            <div className="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6"><Code size={40} /></div>
            <h2 className="text-3xl font-bold mb-4">Built by Ahmad Muqri</h2>
            <p className="text-stone-400 mb-6">Final Year Diploma Student @ MAIWP Professional College (KPMAIWP)</p>
            <p className="text-stone-300 italic">"I built this because IT students have enough bugs to worry about—missing a replacement class shouldn't be one of them."</p>
            <div className="mt-8 flex gap-4 text-stone-500">
              <Github className="hover:text-white cursor-pointer" /> <Linkedin className="hover:text-white cursor-pointer" /> <Instagram className="hover:text-white cursor-pointer" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} className="bg-stone-800 p-8 rounded-[2rem] border border-stone-700">
            <h3 className="font-bold text-xl mb-6">Collaborate or Report Bugs</h3>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <input required className="w-full bg-stone-900 border-stone-700 rounded-xl p-4 text-sm" placeholder="Your Name" value={contactData.name} onChange={e => setContactData({...contactData, name: e.target.value})} />
              <select className="w-full bg-stone-900 border-stone-700 rounded-xl p-4 text-sm" value={contactData.type} onChange={e => setContactData({...contactData, type: e.target.value})}>
                <option>Collaboration</option><option>Bug Report</option><option>Feature Idea</option>
              </select>
              <textarea required className="w-full bg-stone-900 border-stone-700 rounded-xl p-4 text-sm" rows="3" placeholder="Tell me more..." value={contactData.message} onChange={e => setContactData({...contactData, message: e.target.value})} />
              <button className="w-full bg-indigo-600 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Send Message</button>
            </form>
          </ScrollReveal>
        </div>
        <footer className="max-w-6xl mx-auto px-6 mt-20 pt-8 border-t border-stone-800 text-center text-stone-500 text-xs">
          © {new Date().getFullYear()} Ahmad Muqri • Built with React & Firebase
        </footer>
      </div>
    </div>
  );
};

const AuthPage = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) { setError(err.message.replace('Firebase: ', '')); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border">
        <h2 className="text-2xl font-black text-center mb-2">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
        <p className="text-stone-500 text-sm text-center mb-6">Keep your schedule in sync</p>
        {error && <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
          <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-stone-50 border rounded-xl" />
          <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-stone-50 border rounded-xl" />
          <button disabled={loading} className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl hover:bg-stone-800 transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-sm text-stone-500">
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </button>
        <button onClick={onBack} className="w-full mt-4 text-xs text-stone-400">Back to home</button>
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [activeTab, setActiveTab] = useState('classes');
  const [updates, setUpdates] = useState([]);
  const [exams, setExams] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [dataLoading, setDataLoading] = useState(true);  // ← ADD this line
  const [editingId, setEditingId] = useState(null);
  const [classForm, setClassForm] = useState({ subject: '', repDate: '', repStart: '08.00', repEnd: '10.00', repVenue: '', canDate: '', canStart: '08.00', canEnd: '10.00', canReason: '' });
  const [examForm, setExamForm] = useState({ subject: '', topic: '', date: '', start: '08.00', end: '10.00', venue: '' });
  const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
  return onAuthStateChanged(auth, u => {
    setUser(u);
    if (u) setView('app');
    else setView('landing');
  });
}, []);

useEffect(() => {
  if (!user) return;
  setDataLoading(true); // ← add this
  let classesLoaded = false;
  let examsLoaded = false;

const checkDone = () => {
  if (classesLoaded && examsLoaded) {
    setTimeout(() => setDataLoading(false), 1500); // fake 1.5s delay
  }
};

  const unsubC = onSnapshot(query(collection(db, 'users', user.uid, 'classes'), orderBy('repDate', 'asc')), s => {
    setUpdates(s.docs.map(d => ({id: d.id, ...d.data()})));
    classesLoaded = true;
    checkDone();
  });
  const unsubE = onSnapshot(query(collection(db, 'users', user.uid, 'exams'), orderBy('date', 'asc')), s => {
    setExams(s.docs.map(d => ({id: d.id, ...d.data()})));
    examsLoaded = true;
    checkDone();
  });
  return () => { unsubC(); unsubE(); };
}, [user]);

const saveClass = async (e) => {
  e.preventDefault();
  const data = { ...classForm, updatedAt: new Date().toISOString() };
  if (editingId) await updateDoc(doc(db, 'users', user.uid, 'classes', editingId), data);
  else await addDoc(collection(db, 'users', user.uid, 'classes'), data);
  setIsFormOpen(false);
  setEditingId(null);
  setClassForm({ subject: '', repDate: '', repStart: '08.00', repEnd: '10.00', repVenue: '', canDate: '', canStart: '08.00', canEnd: '10.00', canReason: '' });
  showToast(editingId ? '✏️ Class swap updated!' : '✅ Class swap saved!'); // ← add this
};

const showToast = (msg) => {
  setToast(msg);
  setTimeout(() => setToast(''), 3000);
};

const saveExam = async (e) => {
  e.preventDefault();
  if (editingId) await updateDoc(doc(db, 'users', user.uid, 'exams', editingId), examForm);
  else await addDoc(collection(db, 'users', user.uid, 'exams'), examForm);
  setIsFormOpen(false);
  setEditingId(null);
  setExamForm({ subject: '', topic: '', date: '', start: '08.00', end: '10.00', venue: '' });
  showToast(editingId ? '✏️ Exam updated!' : '📝 Exam reminder saved!'); // ← add this
};

const handleEditClass = (item) => {
  setClassForm({
    subject: item.subject || '',
    repDate: item.repDate || '',
    repStart: item.repStart || '08.00',
    repEnd: item.repEnd || '10.00',
    repVenue: item.repVenue || '',
    canDate: item.canDate || '',
    canStart: item.canStart || '08.00',
    canEnd: item.canEnd || '10.00',
    canReason: item.canReason || ''
  });
  setEditingId(item.id);
  setActiveTab('classes');
  setIsFormOpen(true);
};

const handleEditExam = (item) => {
  setExamForm({
    subject: item.subject || '',
    topic: item.topic || '',
    date: item.date || '',
    start: item.start || '08.00',
    end: item.end || '10.00',
    venue: item.venue || ''
  });
  setEditingId(item.id);
  setActiveTab('exams');
  setIsFormOpen(true);
};

  if (view === 'landing') return <LandingPage onGetStarted={() => setView('auth')} />;
  if (view === 'auth') return <AuthPage onBack={() => setView('landing')} />;

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${darkMode ? 'bg-stone-900' : 'bg-stone-50'}`}>
      <header className={`backdrop-blur sticky top-0 z-10 border-b p-4 transition-colors duration-300 ${darkMode ? 'bg-stone-800/90 border-stone-700' : 'bg-white/80'}`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-lg">Attendance Saver</h1>
          <div className="flex gap-1">
  <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full text-lg transition-colors ${darkMode ? 'text-amber-400 hover:bg-stone-700' : 'text-stone-400 hover:bg-stone-100'}`}>
    {darkMode ? '☀️' : '🌙'}
  </button>
  <button onClick={() => signOut(auth)} className="text-rose-500 p-2 hover:bg-rose-50 rounded-full"><LogOut size={20}/></button>
</div>
        </div>
        <div className="max-w-md mx-auto mt-4 flex bg-stone-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('classes')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${activeTab === 'classes' ? 'bg-white shadow' : 'text-stone-500'}`}>Classes</button>
          <button onClick={() => setActiveTab('exams')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${activeTab === 'exams' ? 'bg-white shadow' : 'text-stone-500'}`}>Exams</button>
        </div>
      </header>

<main className="max-w-4xl mx-auto p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {dataLoading ? (
    <div className="col-span-3 flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 size={36} className="animate-spin text-stone-300" />
      <p className="text-stone-300 text-sm font-medium">Loading your schedule...</p>
    </div>
  ) : activeTab === 'classes' ? (
    updates.length === 0 ? (
      <div className="col-span-3 text-center py-24">
        <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border">
          <CheckCircle2 size={36} className="text-stone-200" />
        </div>
        <h3 className="font-bold text-stone-400 text-lg">No class swaps yet</h3>
        <p className="text-stone-300 text-sm mt-2">Tap the + button below to log a cancelled class</p>
      </div>
    ) : updates.map(item => (
      <div key={item.id} className={`p-5 rounded-3xl border shadow-sm relative group transition-colors ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white'}`}>
       <div className="flex justify-between mb-4">
  <div>
    <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-stone-800'}`}>{item.subject}</h3>
    {getStatusBadge(item.repDate) && (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusBadge(item.repDate).style}`}>
        {getStatusBadge(item.repDate).label}
      </span>
    )}
  </div>
  <div className="flex gap-2">
            <button onClick={() => handleEditClass(item)} className="text-stone-300 hover:text-indigo-500"><Edit2 size={16}/></button>
            <button onClick={() => { if(window.confirm('Delete?')) deleteDoc(doc(db, 'users', user.uid, 'classes', item.id)) }} className="text-stone-300 hover:text-rose-500"><Trash2 size={16}/></button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex gap-3">
            <CheckCircle2 size={18} className="text-emerald-500 mt-1"/>
            <div><p className="text-xs font-bold text-emerald-600 uppercase">Replacement</p><p className="text-sm">{formatDate(item.repDate)} • {item.repStart}-{item.repEnd}</p><p className="text-xs text-stone-400">{item.repVenue}</p></div>
          </div>
          <div className="flex gap-3 opacity-60">
            <X size={18} className="text-rose-500 mt-1"/>
            <div><p className="text-xs font-bold text-rose-600 uppercase">Cancelled</p><p className="text-sm line-through">{formatDate(item.canDate)}</p><p className="text-xs italic text-rose-500">Reason: "{item.canReason}"</p></div>
          </div>
        </div>
      </div>
    ))
  ) : (
    exams.length === 0 ? (
      <div className="col-span-3 text-center py-24">
        <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border">
          <BookOpen size={36} className="text-stone-200" />
        </div>
        <h3 className="font-bold text-stone-400 text-lg">No exams added yet</h3>
        <p className="text-stone-300 text-sm mt-2">Tap the + button below to add an exam reminder</p>
      </div>
    ) : exams.map(item => (
      <div key={item.id} className={`p-5 rounded-3xl border-l-4 border-l-indigo-500 shadow-sm transition-colors ${darkMode ? 'bg-stone-800' : 'bg-white'}`}>
        <div className="flex justify-between mb-2">
          <h3 className="font-bold">{item.subject}</h3>
          <div className="flex gap-2">
            <button onClick={() => handleEditExam(item)} className="text-stone-300 hover:text-indigo-500"><Edit2 size={16}/></button>
            <button onClick={() => { if(window.confirm('Delete?')) deleteDoc(doc(db, 'users', user.uid, 'exams', item.id)) }} className="text-stone-300 hover:text-rose-500"><Trash2 size={16}/></button>
          </div>
        </div>
        <p className="text-sm text-stone-500 mb-4">{item.topic}</p>
        <div className="flex flex-wrap gap-2">
          <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">{formatDate(item.date)}</div>
{getDaysLeft(item.date) && (
  <div className={`${getDaysLeft(item.date).style} px-3 py-1 rounded-full text-xs font-bold`}>
    {getDaysLeft(item.date).label}
  </div>
)}
          <div className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs">{item.start}-{item.end}</div>
          <div className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs">{item.venue}</div>
        </div>
      </div>
    ))
  )}
</main>

      <button onClick={() => { setEditingId(null); setIsFormOpen(true); }} className="fixed bottom-8 right-8 w-14 h-14 bg-stone-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all"><Plus/></button>
      {toast && (
  <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4">
    {toast}
  </div>
)}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-[2rem] p-8 max-h-[90vh] overflow-y-auto transition-colors ${darkMode ? 'bg-stone-800 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Log {activeTab === 'classes' ? 'Class Swap' : 'Exam'}</h2>
              <button onClick={() => { if(window.confirm('Discard changes?')) setIsFormOpen(false); }}><X/></button>
            </div>
            {activeTab === 'classes' ? (
              <form onSubmit={saveClass} className="space-y-6">
                <input required placeholder="Subject Name (e.g. Intro to IT)" value={classForm.subject} onChange={e => setClassForm({...classForm, subject: e.target.value})} className="w-full p-4 bg-stone-50 border rounded-2xl" />
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider">New Schedule</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" required value={classForm.repDate} onChange={e => setClassForm({...classForm, repDate: e.target.value})} className="p-3 bg-white border rounded-xl text-sm col-span-2" />
                    <select value={classForm.repStart} onChange={e => setClassForm({...classForm, repStart: e.target.value})} className="p-3 bg-white border rounded-xl text-sm">{TIME_SLOTS.map(t => <option key={t}>{t}</option>)}</select>
                    <select value={classForm.repEnd} onChange={e => setClassForm({...classForm, repEnd: e.target.value})} className="p-3 bg-white border rounded-xl text-sm">{getValidEndTimes(classForm.repStart).map(t => <option key={t}>{t}</option>)}</select>
                    <input placeholder="New Venue (e.g. Lab 4)" value={classForm.repVenue} onChange={e => setClassForm({...classForm, repVenue: e.target.value})} className="p-3 bg-white border rounded-xl text-sm col-span-2" />
                  </div>
                </div>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <p className="text-xs font-bold text-rose-600 mb-3 uppercase tracking-wider">Cancelled Info</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" required value={classForm.canDate} onChange={e => setClassForm({...classForm, canDate: e.target.value})} className="p-3 bg-white border rounded-xl text-sm col-span-2" />
                    <div className="relative col-span-2">
  <input maxLength={60} placeholder="Reason for cancellation (e.g. Sick)" value={classForm.canReason} onChange={e => setClassForm({...classForm, canReason: e.target.value})} className="w-full p-3 bg-white border rounded-xl text-sm pr-12" />
  <span className="absolute right-3 bottom-3 text-xs text-stone-300">{classForm.canReason.length}/60</span>
</div>
                  </div>
                </div>
                <button className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl">Save Update</button>
              </form>
            ) : (
              <form onSubmit={saveExam} className="space-y-4">
                <input required placeholder="e.g. Data Structures" value={examForm.subject} onChange={e => setExamForm({...examForm, subject: e.target.value})} className="w-full p-4 bg-stone-50 border rounded-xl" />
                <input placeholder="e.g. Final Exam (Ch 1-5)" value={examForm.topic} onChange={e => setExamForm({...examForm, topic: e.target.value})} className="w-full p-4 bg-stone-50 border rounded-xl" />
                <input type="date" required value={examForm.date} onChange={e => setExamForm({...examForm, date: e.target.value})} className="w-full p-4 bg-stone-50 border rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={examForm.start} onChange={e => setExamForm({...examForm, start: e.target.value})} className="p-4 bg-stone-50 border rounded-xl text-sm">{TIME_SLOTS.map(t => <option key={t}>{t}</option>)}</select>
                  <select value={examForm.end} onChange={e => setExamForm({...examForm, end: e.target.value})} className="p-4 bg-stone-50 border rounded-xl text-sm">{getValidEndTimes(examForm.start).map(t => <option key={t}>{t}</option>)}</select>
                </div>
                <input placeholder="e.g. Main Hall A" value={examForm.venue} onChange={e => setExamForm({...examForm, venue: e.target.value})} className="w-full p-4 bg-stone-50 border rounded-xl" />
                <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl">Save Exam Reminder</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}