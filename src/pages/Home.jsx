import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Shield, Bell, Users, Menu, X, Bug, Lightbulb,
  GraduationCap, Code2, Heart, Github, Linkedin, Instagram,
  Mail, ClipboardList, BarChart3, CheckCircle2, Star, ChevronDown, Send
} from 'lucide-react';
import Logo from '../components/Logo';
import Reveal from '../components/Reveal';
import StatCounter from '../components/StatCounter';
import SchedulePreview from '../components/SchedulePreview';

export default function Home({ user, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', type: 'Bug Report', message: '' });
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const features = [
    { icon: <Shield size={22} color="#0891b2"/>, bg: '#e0f7fa', title: 'Attendance Saver', desc: "Rescheduled classes can ruin your attendance record. We make sure you're always in the right room at the right time.", tag: 'Core Feature' },
    { icon: <Bell size={22} color="#ea580c"/>,   bg: '#fff7ed', title: 'Exam Countdown',   desc: 'Never be caught off-guard by an exam again. Track every upcoming test with smart countdowns and venue reminders.', tag: 'Reminders' },
    { icon: <Users size={22} color="#059669"/>,  bg: '#ecfdf5', title: 'Always In Sync',   desc: 'Firebase-powered real-time sync keeps your schedule up to date across all your devices, anytime, anywhere.', tag: 'Reliable' },
  ];

  const steps = [
    { num: '01', title: 'Sign Up Free',    desc: "Create your account in seconds. No credit card, no hassle — just your email and you're in.", icon: <Mail size={28} color="#0891b2"/> },
    { num: '02', title: 'Log a Class Swap', desc: 'When your lecturer cancels a class, tap "+ Add Class". Fill in the replacement details instantly.', icon: <ClipboardList size={28} color="#7c3aed"/> },
    { num: '03', title: 'Stay Ahead',      desc: "See all your upcoming replacements and exams in one clean dashboard. Status badges show what's urgent.", icon: <BarChart3 size={28} color="#059669"/> },
  ];

  const testimonials = [
    { name: 'Izzati R.',   program: 'Diploma in IT, Sem 3',  text: 'I used to miss replacement classes all the time. This app literally saved my attendance record.', stars: 5, avatarColor: '#0891b2' },
    { name: 'Hafiz A.',    program: 'Diploma in CS, Sem 2',  text: 'The dashboard is so clean. I know exactly what\'s coming up each week without scrolling through group chats.', stars: 5, avatarColor: '#7c3aed' },
    { name: 'Syafiqah N.', program: 'Diploma in IT, Sem 4',  text: 'The exam countdown keeps me from panicking last minute. Wish I had this in Sem 1!', stars: 5, avatarColor: '#059669' },
  ];

  const stats = [
    { value: 120, suffix: '+', label: 'Students Using It',  icon: <Users size={22} color="#0891b2"/> },
    { value: 340, suffix: '+', label: 'Classes Tracked',    icon: <ClipboardList size={22} color="#7c3aed"/> },
    { value: 98,  suffix: '%', label: 'Attendance Saved',   icon: <CheckCircle2 size={22} color="#059669"/> },
    { value: 4.9, suffix: '★', label: 'Average Rating',     icon: <Star size={22} color="#f59e0b" fill="#f59e0b"/> },
  ];

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* NAVBAR */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, 
        background: navScrolled ? 'rgba(240,249,255,0.97)' : 'rgba(240,249,255,0.92)', 
        backdropFilter: 'blur(16px)', 
        borderBottom: '1px solid rgba(8,145,178,0.1)',
        transition: 'background 0.2s ease'
      }}>
        <div style={{ height: 58, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo dark={false} size="sm"/>
          </div>
          <div className="nav-links-desktop" style={{ display: 'none', gap: 28, alignItems: 'center' }}>
            {['features', 'how-it-works', 'testimonials', 'about'].map(id => (
              <button key={id} className="hp-nav-link" onClick={() => scrollTo(id)}>
                {id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, whiteSpace: 'nowrap', borderRadius: 12 }} onClick={() => onNavigate(user ? 'dashboard' : 'auth')}>
              {user ? 'Dashboard' : 'Get Started'}
            </button>
            <button onClick={() => setMenuOpen(o => !o)} style={{ background: menuOpen ? 'rgba(8,145,178,0.1)' : 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, flexShrink: 0 }}>
              {menuOpen ? <X size={18} color="#0891b2"/> : <Menu size={18} color="#0c1e35"/>}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div style={{ background: 'white', margin: '0 12px 10px', borderRadius: 18, padding: '6px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', border: '1px solid rgba(8,145,178,0.1)' }}>
            {[{ id: 'features', label: 'Features' }, { id: 'how-it-works', label: 'How It Works' }, { id: 'testimonials', label: 'Testimonials' }, { id: 'about', label: 'About' }].map(({ id, label }) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '13px 16px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, color: '#0c1e35', cursor: 'pointer', borderRadius: 12 }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                {label}
              </button>
            ))}
            <div style={{ height: 1, background: 'rgba(8,145,178,0.08)', margin: '4px 12px 8px' }}/>
            <button onClick={() => { setMenuOpen(false); onNavigate(user ? 'dashboard' : 'auth'); }} style={{ display: 'block', width: 'calc(100% - 16px)', margin: '0 8px 6px', background: 'linear-gradient(135deg,#0891b2,#0e7490)', color: 'white', border: 'none', borderRadius: 13, padding: '13px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              {user ? 'Go to Dashboard →' : 'Get Started Free →'}
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(8,145,178,0.08) 0%,transparent 70%)', top: -100, right: -100, pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)', bottom: 0, left: -80, pointerEvents: 'none' }}/>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.4 }}>
          <defs><pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="rgba(8,145,178,0.15)"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 48, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 560 }}>
            <div className="hp-badge h1" style={{ marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulseDot 2s infinite' }}/>
              Now live for KPMAIWP students
            </div>
            <h1 className="h2" style={{ fontSize: 'clamp(36px,7vw,60px)', fontWeight: 900, color: '#0c1e35', lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 22 }}>
              Never Walk Into<br/>
              <span style={{ color: '#0891b2', position: 'relative' }}>
                an Empty Room
                <svg style={{ position: 'absolute', bottom: -6, left: 0, width: '100%', overflow: 'visible' }} height="8">
                  <path d="M0,4 Q50%,0 100%,4" stroke="#06b6d4" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
              <br/>Again.
            </h1>
            <p className="h3" style={{ fontSize: 17, color: '#64748b', lineHeight: 1.7, marginBottom: 34, maxWidth: 440 }}>
              The smartest way for students to track <strong style={{ color: '#0c1e35' }}>cancelled classes</strong>, replacement schedules, and upcoming exams — all in one beautiful app.
            </p>
            <div className="h4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
              <button className="btn-primary" style={{ padding: '15px 30px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => onNavigate(user ? 'dashboard' : 'auth')}>
                {user ? 'Go to Dashboard' : 'Start Free'} <ArrowRight size={18}/>
              </button>
              <button onClick={() => scrollTo('how-it-works')} style={{ background: 'transparent', color: '#0891b2', border: '2px solid rgba(8,145,178,0.3)', borderRadius: 16, padding: '15px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                See How It Works
              </button>
            </div>
            <div className="h5" style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {[
                ['120+', 'Students'],
                ['340+', 'Classes Tracked'],
                ['Free', 'Forever']
              ].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0891b2', letterSpacing: '-0.5px' }}>{val}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 1 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ animation: 'floatCard 4s ease-in-out infinite', transform: 'rotate(-1deg)' }}>
              <SchedulePreview/>
            </div>
          </div>
        </div>
        <div className="scroll-hint" style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <span>Scroll to explore</span><ChevronDown size={16}/>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'white', borderTop: '1px solid rgba(8,145,178,0.08)', borderBottom: '1px solid rgba(8,145,178,0.08)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="hp-stat">
                <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: '#0891b2', letterSpacing: '-1px' }}><StatCounter end={s.value} suffix={s.suffix}/></div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginTop: 3 }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div className="hp-badge" style={{ justifyContent: 'center', marginBottom: 16 }}><SparklesIcon /> Everything You Need</div>
              <h2 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, color: '#0c1e35', letterSpacing: '-1px', marginBottom: 14 }}>Built for the Modern Student</h2>
              <p style={{ fontSize: 15, color: '#64748b', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>Ditch the messy WhatsApp group chats. Keep your academic calendar organized in one visual hub.</p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="hp-feat-card">
                  <span className="hp-tag">{f.tag}</span>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0c1e35', letterSpacing: '-0.3px', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: 'white', borderTop: '1px solid rgba(8,145,178,0.06)', borderBottom: '1px solid rgba(8,145,178,0.06)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="hp-badge" style={{ justifyContent: 'center', marginBottom: 16 }}>📋 Get Started</div>
              <h2 style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 900, color: '#0c1e35', letterSpacing: '-1px' }}>How It Works</h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
            {steps.map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="hp-step-card">
                  <div style={{ position: 'absolute', top: 12, right: 20, fontSize: 44, fontWeight: 900, color: 'rgba(8,145,178,0.07)' }}>{s.num}</div>
                  <div style={{ width: 54, height: 54, borderRadius: 16, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, border: '1px solid rgba(0,0,0,0.04)' }}>{s.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0c1e35', marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div className="hp-badge" style={{ justifyContent: 'center', marginBottom: 16 }}>⭐ Love from Students</div>
              <h2 style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 900, color: '#0c1e35', letterSpacing: '-1px' }}>What Students Are Saying</h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="hp-testi">
                  <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                    {Array.from({ length: t.stars }).map((_, idx) => <Star key={idx} size={13} fill="#f59e0b" color="#f59e0b"/>)}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 20 }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: t.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 12 }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0c1e35' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{t.program}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div style={{ marginTop: 48, background: 'linear-gradient(135deg,#0891b2,#0e7490)', borderRadius: 28, padding: '36px 32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, boxShadow: '0 12px 40px rgba(8,145,178,0.3)' }}>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: 'white', marginBottom: 6 }}>Ready to save your attendance?</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>Join 120+ students already using Attendance Saver.</p>
              </div>
              <button onClick={() => onNavigate(user ? 'dashboard' : 'auth')} style={{ background: 'white', color: '#0891b2', border: 'none', borderRadius: 16, padding: '14px 28px', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                {user ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight size={17}/>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT / DEVELOPER */}
      <section id="about" style={{ background: '#0c1e35', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(8,145,178,0.15)', border: '1px solid rgba(8,145,178,0.25)', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 16 }}>
                <Code2 size={12}/> Meet the Developer
              </div>
              <h2 style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
                Built with <Heart size={20} color="#ef4444" fill="#ef4444" style={{ display: 'inline', verticalAlign: 'middle' }}/> by a Student, for Students
              </h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 28, alignItems: 'start' }}>
            {/* Dev card */}
            <Reveal direction="left">
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '32px 28px', textAlign: 'center' }}>
                <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
                  <div className="hp-avatar-ring" style={{ position: 'relative', display: 'inline-block' }}>
                    <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg,#0891b2,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #0c1e35', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                      <img 
                        src="/profile.JPG" 
                        alt="Ahmad Muqri"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                        }} 
                      />
                    </div>
                    <div style={{ position: 'absolute', bottom: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: '#22c55e', border: '3px solid #0c1e35', zIndex: 2 }}/>
                  </div>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.4px', marginBottom: 4 }}>Ahmad Muqri</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                  <GraduationCap size={13} color="#38bdf8"/>
                  <span style={{ fontSize: 13, color: '#38bdf8', fontWeight: 600 }}>Final Year Diploma Student</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>MAIWP Professional College (KPMAIWP)<br/>Diploma in Information Technology</div>
                <div style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: 16, padding: '16px 18px', marginBottom: 22 }}>
                  <div style={{ fontSize: 28, color: '#0891b2', lineHeight: 1, marginBottom: 8, fontFamily: 'serif' }}>"</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontStyle: 'italic' }}>I built this because IT students have enough bugs to worry about — missing a replacement class shouldn't be one of them.</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginBottom: 22 }}>
                  {['React', 'Firebase', 'UI/UX', 'JavaScript', 'Node.js'].map(s => (
                    <span key={s} style={{ background: 'rgba(8,145,178,0.12)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>{s}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <a href="https://github.com/ahmadmuqri" target="_blank" rel="noreferrer" className="hp-social"><Github size={18}/></a>
                  <a href="https://linkedin.com/in/ahmadmuqri" target="_blank" rel="noreferrer" className="hp-social"><Linkedin size={18}/></a>
                  <a href="https://instagram.com/ahmadmuqri" target="_blank" rel="noreferrer" className="hp-social"><Instagram size={18}/></a>
                </div>
              </div>
            </Reveal>
            {/* Contact form */}
            <Reveal direction="right" delay={100}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '32px 28px' }}>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: 'white', marginBottom: 6 }}>Get in Touch</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24, lineHeight: 1.6 }}>Found a bug? Have an idea? Want to collaborate?</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                  {[
                    { val: 'Bug Report', icon: <Bug size={11}/>, color: '#ef4444' },
                    { val: 'Feature Idea', icon: <Lightbulb size={11}/>, color: '#f59e0b' },
                    { val: 'Collaboration', icon: <Users size={11}/>, color: '#0891b2' }
                  ].map(t => (
                    <button key={t.val} onClick={() => setContactForm(f => ({ ...f, type: t.val }))} style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${contactForm.type === t.val ? t.color : 'rgba(255,255,255,0.12)'}`, background: contactForm.type === t.val ? t.color + '18' : 'transparent', color: contactForm.type === t.val ? t.color : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 5 }}>
                      {t.icon} {t.val}
                    </button>
                  ))}
                </div>
                {contactSent ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(8,145,178,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={30} color="#0891b2"/>
                      </div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 6 }}>Message Sent!</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Thanks! I'll get back to you soon.</div>
                    <button onClick={() => { setContactSent(false); setContactForm({ name: '', type: 'Bug Report', message: '' }); }} style={{ marginTop: 20, background: 'rgba(8,145,178,0.2)', border: '1px solid rgba(8,145,178,0.3)', color: '#38bdf8', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      Send Another
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input className="hp-input" placeholder="Your Name" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}/>
                    <textarea className="hp-input hp-textarea" placeholder={`Describe your ${contactForm.type.toLowerCase()}...`} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}/>
                    <button onClick={() => {
                      if (contactForm.name && contactForm.message) {
                        window.location.href = `mailto:ahmadmuqri31@gmail.com?subject=[${contactForm.type}] from ${contactForm.name}&body=${encodeURIComponent(contactForm.message)}`;
                        setContactSent(true);
                      }
                    }} style={{ background: 'linear-gradient(135deg,#0891b2,#0e7490)', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
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
      <footer style={{ background: '#080e1c', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Logo dark={true} size="sm"/>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, flexWrap: 'wrap' }}>
            © {new Date().getFullYear()} Ahmad Muqri · KPMAIWP ·
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Built with <Heart size={11} color="#ef4444" fill="#ef4444"/> in React &amp; Firebase</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Sparkles Helper Icon since Sparkles is used
function SparklesIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0891b2' }}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" style={{ opacity: 0.6 }}/>
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" style={{ opacity: 0.6 }}/>
    </svg>
  );
}
