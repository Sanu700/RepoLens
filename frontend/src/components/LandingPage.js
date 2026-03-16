import React, { useState, useEffect } from 'react';
import { Github, Zap, User, GitBranch } from 'lucide-react';

const REPO_EXAMPLES = ['facebook/react', 'vercel/next.js', 'microsoft/vscode'];
const PROFILE_EXAMPLES = ['torvalds', 'gaearon', 'sindresorhus', 'tj'];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 6,
  dur: Math.random() * 4 + 4,
}));

export default function LandingPage({ mode, setMode, onAnalyzeRepo, onAnalyzeProfile, loading, error }) {
  const [input, setInput] = useState('');
  const [exIdx, setExIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const examples = mode === 'profile' ? PROFILE_EXAMPLES : REPO_EXAMPLES;

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    setInput(''); setExIdx(0);
    const t = setInterval(() => setExIdx(i => (i + 1) % examples.length), 2600);
    return () => clearInterval(t);
  }, [mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (mode === 'profile') onAnalyzeProfile(input.trim());
    else onAnalyzeRepo(input.trim().includes('github.com') ? input.trim() : `https://github.com/${input.trim()}`);
  };

  return (
    <div style={s.page}>
      {/* Animated grid */}
      <div style={s.grid} className="orb-drift" />

      {/* Floating orbs */}
      <div style={{ ...s.orb, top: '8%', left: '8%', width: 520, height: 520, background: 'rgba(0,212,255,0.07)' }} className="orb-float-a" />
      <div style={{ ...s.orb, bottom: '5%', right: '6%', width: 460, height: 460, background: 'rgba(124,58,237,0.09)' }} className="orb-float-b" />
      <div style={{ ...s.orb, top: '40%', left: '40%', width: 300, height: 300, background: 'rgba(16,185,129,0.04)', transform: 'translate(-50%,-50%)' }} className="orb-drift" />

      {/* Particles */}
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'fixed', left: p.left, top: p.top,
          width: p.size, height: p.size,
          borderRadius: '50%', background: 'rgba(0,212,255,0.5)',
          animation: `particleDrift ${p.dur}s ${p.delay}s ease-in infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <div style={{ ...s.container, opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.logoDot} className="glow-dot" />
          <span style={s.logoText}>RepoLens</span>
        </div>

        {/* Mode toggle */}
        <div style={s.toggle} className="scale-in">
          <button style={{ ...s.toggleBtn, ...(mode === 'profile' ? s.toggleActive : {}) }} onClick={() => setMode('profile')}>
            <User size={15} /> Profile Analysis
          </button>
          <button style={{ ...s.toggleBtn, ...(mode === 'repo' ? s.toggleActive : {}) }} onClick={() => setMode('repo')}>
            <GitBranch size={15} /> Repo Analysis
          </button>
        </div>

        <h1 style={s.title} className="fade-up">
          {mode === 'profile'
            ? <><span style={s.titleLine}>Decode any</span><br /><span style={s.highlight}>GitHub Developer</span></>
            : <><span style={s.titleLine}>Dissect any</span><br /><span style={s.highlight}>GitHub Repository</span></>}
        </h1>

        <p style={s.sub} className="fade-up">
          {mode === 'profile'
            ? 'Persona type · career timeline · coding habits · skill radar · top repos — all from a username.'
            : 'Commit analytics · language breakdown · productivity score · insights · suggestions.'}
        </p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.inputWrap}>
            {mode === 'profile' ? <User size={17} color="var(--text3)" /> : <Github size={17} color="var(--text3)" />}
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder={mode === 'profile' ? `e.g. ${examples[exIdx]}` : `e.g. github.com/${examples[exIdx]}`}
              style={s.input} disabled={loading} autoFocus />
            <button type="submit" style={{ ...s.btn, ...((!input.trim() || loading) ? { opacity: 0.5 } : {}) }} disabled={loading || !input.trim()}>
              {loading ? <div style={s.spinner} /> : <><Zap size={15} /> Analyze</>}
            </button>
          </div>
          {error && <div style={s.error} className="fade-up">{error}</div>}
        </form>

        <div style={s.picks} className="stagger">
          <span style={s.picksLabel}>Try:</span>
          {examples.slice(0, 3).map(ex => (
            <button key={ex} style={s.pickBtn} className="card-hover" onClick={() => setInput(ex)}>{ex}</button>
          ))}
        </div>

        <div style={s.features} className="stagger">
          {(mode === 'profile' ? [
            ['🧠','Dev Persona'],['📈','Career Timeline'],['🦉','Coding Habits'],['🎯','Skill Radar'],['🏆','Top Repos'],['💡','Suggestions'],['🃏','Share Card'],
          ] : [
            ['📊','Commit Charts'],['🏆','Score 0–100'],['💡','Insights'],['🛠️','Suggestions'],['🌐','Language Map'],['🃏','Share Card'],
          ]).map(([icon, label]) => (
            <div key={label} style={s.pill} className="card-hover">
              <span>{icon}</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading && <LoadingOverlay mode={mode} />}
    </div>
  );
}

function LoadingOverlay({ mode }) {
  const [step, setStep] = useState(0);
  const steps = mode === 'profile'
    ? ['Fetching GitHub profile...','Analyzing repositories...','Detecting dev persona...','Building skill radar...','Mapping career timeline...','Generating suggestions...']
    : ['Fetching repository...','Loading commit history...','Analyzing contributors...','Calculating productivity score...','Generating insights...'];

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 1100);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={s.overlay}>
      <div style={s.overlayInner}>
        <div style={s.ring1} /><div style={s.ring2} /><div style={s.ring3} />
        <Github size={28} color="var(--accent)" style={{ position: 'relative', zIndex: 3 }} />
        <p style={s.overlayText}>{steps[step]}<span style={{ animation: 'blink 1s infinite' }}>_</span></p>
        <div style={s.progress}><div style={{ ...s.progressFill, width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <div style={s.stepDots}>
          {steps.map((_, i) => (
            <div key={i} style={{ ...s.stepDot, background: i <= step ? 'var(--accent)' : 'var(--border2)', boxShadow: i === step ? '0 0 8px var(--accent)' : 'none' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' },
  grid: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(30,42,58,0.35) 1px,transparent 1px),linear-gradient(90deg,rgba(30,42,58,0.35) 1px,transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' },
  orb: { position: 'fixed', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' },
  container: { maxWidth: 660, width: '100%', textAlign: 'center', position: 'relative' },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 },
  logoDot: { width: 10, height: 10, borderRadius: '50%', background: '#00d4ff', color: '#00d4ff' },
  logoText: { fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, letterSpacing: '0.25em', color: '#00d4ff', textTransform: 'uppercase' },
  toggle: { display: 'inline-flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, gap: 4, marginBottom: 40 },
  toggleBtn: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 7, border: 'none', background: 'none', color: 'var(--text3)', fontFamily: 'var(--font)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.25s' },
  toggleActive: { background: 'var(--surface3)', color: 'var(--text)', boxShadow: '0 1px 8px rgba(0,0,0,0.4)' },
  title: { fontSize: 'clamp(44px,9vw,82px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', color: '#fff', marginBottom: 18 },
  titleLine: { display: 'inline' },
  highlight: { background: 'linear-gradient(120deg,#00d4ff 0%,#7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  sub: { fontSize: 15, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 44, maxWidth: 500, margin: '0 auto 44px' },
  form: { marginBottom: 16 },
  inputWrap: { display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '13px 18px', transition: 'border-color 0.2s, box-shadow 0.2s' },
  input: { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 14, minWidth: 0 },
  btn: { display: 'flex', alignItems: 'center', gap: 7, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, padding: '10px 22px', fontFamily: 'var(--font)', fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.2s, transform 0.15s', },
  spinner: { width: 15, height: 15, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  error: { marginTop: 10, color: '#ef4444', fontSize: 13, fontFamily: 'var(--mono)', textAlign: 'left', padding: '9px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' },
  picks: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 52, marginTop: 14 },
  picksLabel: { fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' },
  pickBtn: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer' },
  features: { display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  pill: { display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 100, padding: '7px 14px', cursor: 'default' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(5,8,16,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(12px)', animation: 'fadeIn 0.3s ease' },
  overlayInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', padding: 40 },
  ring1: { position: 'absolute', width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.6)', animation: 'pulse-ring 1.6s ease-out infinite' },
  ring2: { position: 'absolute', width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.3)', animation: 'pulse-ring 1.6s ease-out infinite 0.45s' },
  ring3: { position: 'absolute', width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(124,58,237,0.3)', animation: 'pulse-ring 1.6s ease-out infinite 0.9s' },
  overlayText: { color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, marginTop: 22, minHeight: 22, letterSpacing: '0.03em' },
  progress: { marginTop: 16, width: 240, height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--accent2))', borderRadius: 2, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 8px var(--accent)' },
  stepDots: { display: 'flex', gap: 6, marginTop: 14 },
  stepDot: { width: 6, height: 6, borderRadius: '50%', transition: 'all 0.3s ease' },
};
