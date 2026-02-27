import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, MapPin, AlertCircle, Plus, Trash2, Edit2, Share2, 
  X, ArrowRight, CheckCircle2, Sparkles, MessageSquare, Loader2, 
  BookOpen, RefreshCw, StickyNote, ShieldCheck, Zap, Users, LogOut, Mail, Lock,
  GraduationCap, Code, LayoutDashboard, Fingerprint, ChevronDown, Send, Bug, Lightbulb, 
  Github, Linkedin, Instagram, Heart, Menu, Eye, EyeOff
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
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
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

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
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- SHARED TOAST (used in AuthPage) ---
// FIX: Responsive toast — full width on mobile, centered on desktop
const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:min-w-72 md:w-auto z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold border
      ${type === 'error' ? 'bg-rose-500 border-rose-400 text-white' : 'bg-emerald-500 border-emerald-400 text-white'}`}
    >
      <span>{type === 'error' ? '❌' : '✅'}</span>
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 shrink-0">✕</button>
    </div>
  );
};

// --- LOGOUT CONFIRM MODAL ---
// FIX: Moved OUTSIDE App component so it doesn't re-render on every state change
const LogoutConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center border">
      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <LogOut size={28} className="text-rose-500" />
      </div>
      <h3 className="text-xl font-bold text-stone-900 mb-2">Log Out?</h3>
      <p className="text-stone-400 text-sm mb-7">You'll need to sign in again to access your schedule.</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-3.5 rounded-xl transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl transition-all"
        >
          Log Out
        </button>
      </div>
    </div>
  </div>
);

// --- FORGOT PASSWORD MODAL ---
// FIX: Moved OUTSIDE AuthPage so it doesn't get re-created on every render
const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      // silently fail — don't reveal if email exists
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* FIX: max-h + overflow scroll so it doesn't clip on small phones */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl border max-h-[90vh] overflow-y-auto">
        <button type="button" onClick={onClose} className="float-right text-stone-400 hover:text-stone-700">
          <X size={20} />
        </button>
        {!sent ? (
          <>
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-5">
              <Mail size={24} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-1">Reset Password</h3>
            <p className="text-stone-400 text-sm mb-6">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSend} className="space-y-4">
              <input
                required type="email" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
              />
              <button
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">Email Sent! 📬</h3>
            <p className="text-stone-400 text-sm">Check your inbox for the reset link. Don't forget to check spam!</p>
            <button
              onClick={onClose}
              className="mt-6 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 px-8 rounded-xl transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- NAVBAR ---
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        <div
          className="flex items-center gap-2 font-bold text-lg sm:text-xl text-stone-900 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="bg-stone-900 text-white p-1.5 rounded-lg"><CheckCircle2 size={18} /></div>
          <span>Attendance Saver</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-500">
          <button onClick={() => scrollTo('features')} className="hover:text-stone-900 transition-colors">Features</button>
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-stone-900 transition-colors">How it Works</button>
          <button onClick={() => scrollTo('about')} className="hover:text-stone-900 transition-colors">About</button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onLoginClick}
            className="bg-stone-900 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
          >
            {user ? 'Dashboard' : 'Login'}
          </button>
          <button className="md:hidden text-stone-900 p-1" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-b px-6 py-4 flex flex-col gap-4">
          <button onClick={() => scrollTo('features')} className="text-left font-bold text-stone-600 py-1">Features</button>
          <button onClick={() => scrollTo('how-it-works')} className="text-left font-bold text-stone-600 py-1">How it Works</button>
          <button onClick={() => scrollTo('about')} className="text-left font-bold text-stone-600 py-1">About</button>
        </div>
      )}
    </nav>
  );
};

// --- LANDING PAGE ---
const LandingPage = ({ onGetStarted }) => {
  const [contactData, setContactData] = useState({ name: '', type: 'Collaboration', message: '' });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const MY_EMAIL = "ahmadmuqri31@gmail.com";
    window.location.href = `mailto:${MY_EMAIL}?subject=[${contactData.type}] from ${contactData.name}&body=${encodeURIComponent(contactData.message)}`;
  };

  return (
    <div className="min-h-screen bg-stone-50 overflow-x-hidden relative">
      <Navbar onLoginClick={onGetStarted} />

      {/* HERO */}
      {/* FIX: Reduced pt on mobile so content isn't buried under navbar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-40 pb-16 sm:pb-20 text-center">
        <ScrollReveal>
          <CheckCircle2 size={50} className="text-emerald-500 mx-auto mb-6 bg-white p-3 rounded-2xl shadow-xl rotate-3" />
        </ScrollReveal>
        {/* FIX: Replaced <br/> with a responsive text approach to avoid awkward wrapping */}
        <ScrollReveal delay={200}>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-stone-900 mb-6 leading-[1.1]">
            Stop Walking Into{' '}
            <span className="text-rose-500">Empty Classrooms.</span>
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={400}>
          <p className="text-stone-500 text-base sm:text-lg md:text-2xl mb-10 max-w-2xl mx-auto">
            Track cancelled classes and{' '}
            <span className="text-stone-900 font-bold underline decoration-emerald-400 decoration-4">
              never miss a replacement class.
            </span>
          </p>
        </ScrollReveal>
        <ScrollReveal delay={600}>
          <button
            onClick={onGetStarted}
            className="px-8 sm:px-10 py-4 sm:py-5 bg-stone-900 text-white font-bold text-lg sm:text-xl rounded-2xl shadow-2xl hover:scale-105 transition-all"
          >
            Start Tracking Now <ArrowRight className="inline ml-2" />
          </button>
        </ScrollReveal>
      </div>

      {/* FEATURES */}
      <div id="features" className="bg-white py-16 sm:py-24 border-y">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <ScrollReveal delay={100} className="bg-stone-50 p-6 sm:p-8 rounded-3xl border">
            <ShieldCheck size={32} className="text-rose-500 mb-4" />
            <h3 className="font-bold text-xl mb-2">Attendance Saver</h3>
            <p className="text-stone-500 text-sm">Rescheduled classes ruin your record. We ensure you're always in the right room at the right time.</p>
          </ScrollReveal>
          <ScrollReveal delay={200} className="bg-stone-50 p-6 sm:p-8 rounded-3xl border">
            <Zap size={32} className="text-indigo-500 mb-4" />
            <h3 className="font-bold text-xl mb-2">AI Magic Fill</h3>
            <p className="text-stone-500 text-sm">Paste that long, messy WhatsApp message from your lecturer. Our AI parses the details for you instantly.</p>
          </ScrollReveal>
          <ScrollReveal delay={300} className="bg-stone-50 p-6 sm:p-8 rounded-3xl border sm:col-span-2 md:col-span-1">
            <Users size={32} className="text-emerald-500 mb-4" />
            <h3 className="font-bold text-xl mb-2">Class Hero</h3>
            <p className="text-stone-500 text-sm">Generate professional summary messages with one click to share back into your class groups.</p>
          </ScrollReveal>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how-it-works" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-12 sm:mb-16">How to Use</h2>
        <div className="space-y-6 sm:space-y-8">
          {[
            { step: 1, title: "Sign Up", desc: "Create an account so your schedule stays synced on your phone." },
            { step: 2, title: "Add Swap", desc: "Choose 'Class Swap' when a lecturer cancels or moves a class." },
            { step: 3, title: "Stay Alert", desc: "Get a clear view of your upcoming week so you never miss a lesson." }
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 100} className="flex gap-4 sm:gap-6 items-center p-5 sm:p-6 bg-white rounded-3xl border">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-stone-900 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shrink-0">
                {item.step}
              </div>
              <div>
                <h4 className="font-bold text-base sm:text-lg">{item.title}</h4>
                <p className="text-stone-500 text-sm">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ABOUT & CONTACT */}
      <div id="about" className="bg-stone-900 text-white py-16 sm:py-24 rounded-t-[2rem] sm:rounded-t-[3rem]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 sm:gap-16">
          <ScrollReveal>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6">
              <Code size={32} className="sm:hidden" /><Code size={40} className="hidden sm:block" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Built by Ahmad Muqri</h2>
            <p className="text-stone-400 mb-6 text-sm sm:text-base">Final Year Diploma Student @ MAIWP Professional College (KPMAIWP)</p>
            <p className="text-stone-300 italic text-sm sm:text-base">"I built this because IT students have enough bugs to worry about—missing a replacement class shouldn't be one of them."</p>
            <div className="mt-8 flex gap-4 text-stone-500">
              <Github className="hover:text-white cursor-pointer" />
              <Linkedin className="hover:text-white cursor-pointer" />
              <Instagram className="hover:text-white cursor-pointer" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} className="bg-stone-800 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-stone-700">
            <h3 className="font-bold text-lg sm:text-xl mb-6">Collaborate or Report Bugs</h3>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <input
                required
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 sm:p-4 text-sm text-white placeholder-stone-500"
                placeholder="Your Name"
                value={contactData.name}
                onChange={e => setContactData({ ...contactData, name: e.target.value })}
              />
              <select
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 sm:p-4 text-sm text-white"
                value={contactData.type}
                onChange={e => setContactData({ ...contactData, type: e.target.value })}
              >
                <option>Collaboration</option>
                <option>Bug Report</option>
                <option>Feature Idea</option>
              </select>
              <textarea
                required
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 sm:p-4 text-sm text-white placeholder-stone-500"
                rows="3"
                placeholder="Tell me more..."
                value={contactData.message}
                onChange={e => setContactData({ ...contactData, message: e.target.value })}
              />
              <button className="w-full bg-indigo-600 py-3 sm:py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                Send Message
              </button>
            </form>
          </ScrollReveal>
        </div>
        <footer className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 sm:mt-20 pt-8 border-t border-stone-800 text-center text-stone-500 text-xs">
          © {new Date().getFullYear()} Ahmad Muqri • Built with React & Firebase
        </footer>
      </div>
    </div>
  );
};

// --- AUTH PAGE ---
const AuthPage = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const showToast = (message, type = 'error') => setToast({ message, type });

  const getFirebaseError = (code) => {
    const map = {
      'auth/user-not-found': '❌ No account found with this email.',
      'auth/wrong-password': '🔑 Wrong password. Please try again.',
      'auth/invalid-credential': '🔑 Wrong email or password. Please try again.',
      'auth/email-already-in-use': '📧 This email is already registered. Try logging in.',
      'auth/too-many-requests': '🚫 Too many attempts. Please wait a moment.',
      'auth/invalid-email': "📧 That email address doesn't look right.",
      'auth/network-request-failed': '🌐 Network error. Check your connection.',
    };
    return map[code] || '⚠️ Something went wrong. Please try again.';
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      showToast('📧 Please enter a valid email address.', 'error');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('👋 Welcome back!', 'success');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast('🎉 Account created! Welcome!', 'success');
      }
    } catch (err) {
      showToast(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX: Added relative + overflow-hidden so background decorations work
    // FIX: p-4 on mobile, p-6 on larger screens
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-stone-50 relative overflow-hidden">

      {/* 👇 YOUR BACKGROUND GOES HERE — add your ClassroomBackground component here */}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      {/* FIX: max-h + overflow-y-auto so card scrolls on very small phones instead of clipping */}
      <div className="relative z-10 w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-xl border max-h-[95vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-black text-center mb-2">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>
        <p className="text-stone-500 text-sm text-center mb-6">Keep your schedule in sync</p>

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 sm:p-4 bg-stone-50 border rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors"
          />

          <div className="relative">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 sm:p-4 bg-stone-50 border rounded-xl pr-12 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isLogin && (
            <div className="text-right -mt-1">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-stone-900 text-white font-bold py-3.5 sm:py-4 rounded-xl hover:bg-stone-800 transition-all flex items-center justify-center"
          >
            {loading
              ? <Loader2 size={20} className="animate-spin" />
              : (isLogin ? 'Login' : 'Sign Up')
            }
          </button>
        </form>

        <button
          onClick={() => { setIsLogin(!isLogin); setEmail(''); setPassword(''); }}
          className="w-full mt-5 text-sm text-stone-500 hover:text-stone-800 transition-colors py-1"
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className="font-bold text-stone-800">{isLogin ? 'Sign Up' : 'Login'}</span>
        </button>

        <button
          onClick={onBack}
          className="w-full mt-3 text-xs text-stone-400 hover:text-stone-600 transition-colors py-1"
        >
          ← Back to home
        </button>
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
  const [dataLoading, setDataLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [classForm, setClassForm] = useState({ subject: '', repDate: '', repStart: '08.00', repEnd: '10.00', repVenue: '', canDate: '', canStart: '08.00', canEnd: '10.00', canReason: '' });
  const [examForm, setExamForm] = useState({ subject: '', topic: '', date: '', start: '08.00', end: '10.00', venue: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // FIX: showToast defined BEFORE onAuthStateChanged so it can be called safely
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // FIX: Removed broken (u && !user) condition — replaced with simpler reliable logic
  // FIX: Delay view switch by 1.5s so success toast is visible before navigating
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setTimeout(() => setView('app'), 1500);
      } else {
        setUser(null);
        setView('landing');
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    let classesLoaded = false;
    let examsLoaded = false;

    const checkDone = () => {
      if (classesLoaded && examsLoaded) {
        setTimeout(() => setDataLoading(false), 1500);
      }
    };

    const unsubC = onSnapshot(
      query(collection(db, 'users', user.uid, 'classes'), orderBy('repDate', 'asc')),
      s => { setUpdates(s.docs.map(d => ({ id: d.id, ...d.data() }))); classesLoaded = true; checkDone(); }
    );
    const unsubE = onSnapshot(
      query(collection(db, 'users', user.uid, 'exams'), orderBy('date', 'asc')),
      s => { setExams(s.docs.map(d => ({ id: d.id, ...d.data() }))); examsLoaded = true; checkDone(); }
    );
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
    showToast(editingId ? '✏️ Class swap updated!' : '✅ Class swap saved!');
  };

  const saveExam = async (e) => {
    e.preventDefault();
    if (editingId) await updateDoc(doc(db, 'users', user.uid, 'exams', editingId), examForm);
    else await addDoc(collection(db, 'users', user.uid, 'exams'), examForm);
    setIsFormOpen(false);
    setEditingId(null);
    setExamForm({ subject: '', topic: '', date: '', start: '08.00', end: '10.00', venue: '' });
    showToast(editingId ? '✏️ Exam updated!' : '📝 Exam reminder saved!');
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
    // FIX: pb-24 on mobile so + button doesn't overlap last card
    <div className={`min-h-screen pb-24 transition-colors duration-300 ${darkMode ? 'bg-stone-900' : 'bg-stone-50'}`}>

      <header className={`backdrop-blur sticky top-0 z-10 border-b px-4 py-3 sm:p-4 transition-colors duration-300 ${darkMode ? 'bg-stone-800/90 border-stone-700' : 'bg-white/80'}`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className={`font-bold text-base sm:text-lg ${darkMode ? 'text-white' : 'text-stone-900'}`}>
            Attendance Saver
          </h1>
          <div className="flex gap-1 items-center">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full text-base sm:text-lg transition-colors ${darkMode ? 'text-amber-400 hover:bg-stone-700' : 'text-stone-400 hover:bg-stone-100'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="text-rose-500 p-2 hover:bg-rose-50 rounded-full"
            >
              <LogOut size={18} className="sm:hidden" />
              <LogOut size={20} className="hidden sm:block" />
            </button>
          </div>
        </div>
        {/* FIX: Tab switcher max-w on mobile so it doesn't stretch full width awkwardly */}
        <div className="max-w-sm sm:max-w-md mx-auto mt-3 flex bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('classes')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'classes' ? 'bg-white shadow' : 'text-stone-500'}`}
          >
            Classes
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'exams' ? 'bg-white shadow' : 'text-stone-500'}`}
          >
            Exams
          </button>
        </div>
      </header>

      {/* FIX: col-span-full instead of col-span-3 so empty state works correctly on all screen sizes */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {dataLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={36} className="animate-spin text-stone-300" />
            <p className="text-stone-300 text-sm font-medium">Loading your schedule...</p>
          </div>
        ) : activeTab === 'classes' ? (
          updates.length === 0 ? (
            <div className="col-span-full text-center py-24">
              <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border">
                <CheckCircle2 size={36} className="text-stone-200" />
              </div>
              <h3 className="font-bold text-stone-400 text-lg">No class swaps yet</h3>
              <p className="text-stone-300 text-sm mt-2">Tap the + button below to log a cancelled class</p>
            </div>
          ) : updates.map(item => (
            <div key={item.id} className={`p-4 sm:p-5 rounded-3xl border shadow-sm relative transition-colors ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white'}`}>
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className={`font-bold mb-1 text-sm sm:text-base ${darkMode ? 'text-white' : 'text-stone-800'}`}>{item.subject}</h3>
                  {getStatusBadge(item.repDate) && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusBadge(item.repDate).style}`}>
                      {getStatusBadge(item.repDate).label}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEditClass(item)} className="text-stone-300 hover:text-indigo-500 p-1"><Edit2 size={15} /></button>
                  <button onClick={() => { if (window.confirm('Delete?')) deleteDoc(doc(db, 'users', user.uid, 'classes', item.id)) }} className="text-stone-300 hover:text-rose-500 p-1"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase">Replacement</p>
                    <p className="text-xs sm:text-sm">{formatDate(item.repDate)} • {item.repStart}-{item.repEnd}</p>
                    <p className="text-xs text-stone-400">{item.repVenue}</p>
                  </div>
                </div>
                <div className="flex gap-3 opacity-60">
                  <X size={16} className="text-rose-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-rose-600 uppercase">Cancelled</p>
                    <p className="text-xs sm:text-sm line-through">{formatDate(item.canDate)}</p>
                    <p className="text-xs italic text-rose-500">Reason: "{item.canReason}"</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          exams.length === 0 ? (
            <div className="col-span-full text-center py-24">
              <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border">
                <BookOpen size={36} className="text-stone-200" />
              </div>
              <h3 className="font-bold text-stone-400 text-lg">No exams added yet</h3>
              <p className="text-stone-300 text-sm mt-2">Tap the + button below to add an exam reminder</p>
            </div>
          ) : exams.map(item => (
            <div key={item.id} className={`p-4 sm:p-5 rounded-3xl border-l-4 border-l-indigo-500 shadow-sm transition-colors ${darkMode ? 'bg-stone-800' : 'bg-white'}`}>
              <div className="flex justify-between mb-2">
                <h3 className={`font-bold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-stone-900'}`}>{item.subject}</h3>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEditExam(item)} className="text-stone-300 hover:text-indigo-500 p-1"><Edit2 size={15} /></button>
                  <button onClick={() => { if (window.confirm('Delete?')) deleteDoc(doc(db, 'users', user.uid, 'exams', item.id)) }} className="text-stone-300 hover:text-rose-500 p-1"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mb-3 sm:mb-4">{item.topic}</p>
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

      {/* FIX: bottom-6 right-4 on mobile so it doesn't clip off screen edge */}
      <button
        onClick={() => { setEditingId(null); setIsFormOpen(true); }}
        className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 w-13 h-13 sm:w-14 sm:h-14 w-14 h-14 bg-stone-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-20"
      >
        <Plus />
      </button>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-full text-sm font-bold shadow-2xl whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* FIX: Slides up from bottom on mobile (items-end), centered modal on desktop */}
          <div className={`w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 sm:p-8 max-h-[92vh] overflow-y-auto transition-colors ${darkMode ? 'bg-stone-800 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold">
                {editingId ? 'Edit' : 'Log'} {activeTab === 'classes' ? 'Class Swap' : 'Exam'}
              </h2>
              <button onClick={() => { if (window.confirm('Discard changes?')) setIsFormOpen(false); }}>
                <X size={22} />
              </button>
            </div>

            {activeTab === 'classes' ? (
              <form onSubmit={saveClass} className="space-y-5">
                <input
                  required
                  placeholder="Subject Name (e.g. Intro to IT)"
                  value={classForm.subject}
                  onChange={e => setClassForm({ ...classForm, subject: e.target.value })}
                  className={`w-full p-3 sm:p-4 border rounded-2xl text-sm ${darkMode ? 'bg-stone-700 border-stone-600 text-white placeholder-stone-400' : 'bg-stone-50'}`}
                />
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-stone-700/50 border-emerald-800' : 'bg-emerald-50 border-emerald-100'}`}>
                  <p className="text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider">New Schedule</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" required value={classForm.repDate} onChange={e => setClassForm({ ...classForm, repDate: e.target.value })} className={`p-3 border rounded-xl text-sm col-span-2 ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white'}`} />
                    <select value={classForm.repStart} onChange={e => setClassForm({ ...classForm, repStart: e.target.value })} className={`p-3 border rounded-xl text-sm ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white'}`}>
                      {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select value={classForm.repEnd} onChange={e => setClassForm({ ...classForm, repEnd: e.target.value })} className={`p-3 border rounded-xl text-sm ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white'}`}>
                      {getValidEndTimes(classForm.repStart).map(t => <option key={t}>{t}</option>)}
                    </select>
                    <input placeholder="New Venue (e.g. Lab 4)" value={classForm.repVenue} onChange={e => setClassForm({ ...classForm, repVenue: e.target.value })} className={`p-3 border rounded-xl text-sm col-span-2 ${darkMode ? 'bg-stone-700 border-stone-600 text-white placeholder-stone-400' : 'bg-white'}`} />
                  </div>
                </div>
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-stone-700/50 border-rose-900' : 'bg-rose-50 border-rose-100'}`}>
                  <p className="text-xs font-bold text-rose-600 mb-3 uppercase tracking-wider">Cancelled Info</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" required value={classForm.canDate} onChange={e => setClassForm({ ...classForm, canDate: e.target.value })} className={`p-3 border rounded-xl text-sm col-span-2 ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white'}`} />
                    <div className="relative col-span-2">
                      <input
                        maxLength={60}
                        placeholder="Reason for cancellation (e.g. Sick)"
                        value={classForm.canReason}
                        onChange={e => setClassForm({ ...classForm, canReason: e.target.value })}
                        className={`w-full p-3 border rounded-xl text-sm pr-12 ${darkMode ? 'bg-stone-700 border-stone-600 text-white placeholder-stone-400' : 'bg-white'}`}
                      />
                      <span className="absolute right-3 bottom-3 text-xs text-stone-300">{classForm.canReason.length}/60</span>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl hover:bg-stone-800 transition-colors">
                  Save Update
                </button>
              </form>
            ) : (
              <form onSubmit={saveExam} className="space-y-4">
                <input required placeholder="e.g. Data Structures" value={examForm.subject} onChange={e => setExamForm({ ...examForm, subject: e.target.value })} className={`w-full p-3 sm:p-4 border rounded-xl text-sm ${darkMode ? 'bg-stone-700 border-stone-600 text-white placeholder-stone-400' : 'bg-stone-50'}`} />
                <input placeholder="e.g. Final Exam (Ch 1-5)" value={examForm.topic} onChange={e => setExamForm({ ...examForm, topic: e.target.value })} className={`w-full p-3 sm:p-4 border rounded-xl text-sm ${darkMode ? 'bg-stone-700 border-stone-600 text-white placeholder-stone-400' : 'bg-stone-50'}`} />
                <input type="date" required value={examForm.date} onChange={e => setExamForm({ ...examForm, date: e.target.value })} className={`w-full p-3 sm:p-4 border rounded-xl text-sm ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-stone-50'}`} />
                <div className="grid grid-cols-2 gap-3">
                  <select value={examForm.start} onChange={e => setExamForm({ ...examForm, start: e.target.value })} className={`p-3 sm:p-4 border rounded-xl text-sm ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-stone-50'}`}>
                    {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <select value={examForm.end} onChange={e => setExamForm({ ...examForm, end: e.target.value })} className={`p-3 sm:p-4 border rounded-xl text-sm ${darkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-stone-50'}`}>
                    {getValidEndTimes(examForm.start).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <input placeholder="e.g. Main Hall A" value={examForm.venue} onChange={e => setExamForm({ ...examForm, venue: e.target.value })} className={`w-full p-3 sm:p-4 border rounded-xl text-sm ${darkMode ? 'bg-stone-700 border-stone-600 text-white placeholder-stone-400' : 'bg-stone-50'}`} />
                <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors">
                  Save Exam Reminder
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={() => { signOut(auth); setShowLogoutConfirm(false); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
}