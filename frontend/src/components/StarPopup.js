import React, { useEffect, useState } from 'react';
import { Star, X, Github, Heart } from 'lucide-react';

const REPO_URL = 'https://github.com/Sanu700/RepoLens';

export default function StarPopup({ onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleStar = () => {
    window.open(REPO_URL, '_blank');
    handleClose();
  };

  return (
    <div style={{ ...s.overlay, opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
      <div style={{ ...s.modal, transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)', transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease', opacity: visible ? 1 : 0 }}>

        {/* Background glow */}
        <div style={s.glowTop} />
        <div style={s.glowBottom} />

        {/* Close */}
        <button onClick={handleClose} style={s.closeBtn}><X size={16} /></button>

        {/* Icon */}
        <div style={s.iconWrap}>
          <div style={s.iconRing1} />
          <div style={s.iconRing2} />
          <Github size={28} color="#00d4ff" style={{ position: 'relative', zIndex: 2 }} />
        </div>

        {/* Text */}
        <h2 style={s.title}>Enjoying RepoLens?</h2>
        <p style={s.subtitle}>
          It takes <span style={{ color: '#f59e0b', fontWeight: 700 }}>2 seconds</span> to star it on GitHub —
          and it genuinely helps more developers discover it 🙏
        </p>

        {/* Star count visual */}
        <div style={s.starRow}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} fill="#f59e0b" color="#f59e0b"
              style={{ animation: `fadeUpStagger 0.4s ease ${i * 0.08}s both` }} />
          ))}
          <span style={s.starText}>Be one of the first to star!</span>
        </div>

        {/* Buttons */}
        <button onClick={handleStar} style={s.starBtn}>
          <Star size={16} fill="#000" />
          ⭐ Star on GitHub
        </button>

        <button onClick={handleClose} style={s.laterBtn}>
          Maybe later
        </button>

        {/* Footer */}
        <div style={s.footer}>
          <Heart size={11} fill="#ef4444" color="#ef4444" />
          <span>Built by Sanvi Udhan · Open Source · Free forever</span>
        </div>

      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(5,8,16,0.85)',
    backdropFilter: 'blur(10px)',
    zIndex: 300,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  modal: {
    position: 'relative',
    background: 'linear-gradient(135deg, #0c1018 0%, #121722 100%)',
    border: '1px solid rgba(0,212,255,0.2)',
    borderRadius: 20,
    padding: '36px 32px 28px',
    maxWidth: 400, width: '100%',
    textAlign: 'center',
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.1)',
  },
  glowTop: {
    position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
    width: 200, height: 200, borderRadius: '50%',
    background: 'rgba(0,212,255,0.1)', filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  glowBottom: {
    position: 'absolute', bottom: -60, right: -40,
    width: 160, height: 160, borderRadius: '50%',
    background: 'rgba(124,58,237,0.1)', filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  closeBtn: {
    position: 'absolute', top: 14, right: 14,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '50%', width: 30, height: 30,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text3)',
    transition: 'background 0.2s',
  },
  iconWrap: {
    position: 'relative', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
    width: 64, height: 64, marginBottom: 20,
  },
  iconRing1: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    border: '1px solid rgba(0,212,255,0.4)',
    animation: 'pulse-ring 2s ease-out infinite',
  },
  iconRing2: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    border: '1px solid rgba(0,212,255,0.2)',
    animation: 'pulse-ring 2s ease-out infinite 0.5s',
  },
  title: {
    fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em',
    marginBottom: 10, color: '#fff',
    fontFamily: 'var(--font)',
  },
  subtitle: {
    fontSize: 14, color: 'var(--text2)', lineHeight: 1.7,
    marginBottom: 20, fontFamily: 'var(--font)',
  },
  starRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginBottom: 24,
    background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 100, padding: '8px 18px',
    display: 'inline-flex',
  },
  starText: {
    fontSize: 12, color: '#f59e0b',
    fontFamily: 'var(--mono)', marginLeft: 4,
  },
  starBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
    border: 'none', borderRadius: 12,
    color: '#000', fontFamily: 'var(--font)',
    fontWeight: 800, fontSize: 15, cursor: 'pointer',
    marginBottom: 10,
    boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  laterBtn: {
    width: '100%', padding: '11px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 12, color: 'var(--text3)',
    fontFamily: 'var(--font)', fontWeight: 600,
    fontSize: 13, cursor: 'pointer',
    marginBottom: 20,
    transition: 'border-color 0.2s, color 0.2s',
  },
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, fontSize: 11, color: 'var(--text3)',
    fontFamily: 'var(--mono)',
  },
};
