import React, { useRef, useState } from 'react';

const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0);
const LANG_COLORS = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function ProfileShareCard({ data, onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { profile, stats, persona, habits, topLanguages, radar } = data;

  const downloadCard = async () => {
    setDownloading(true);
    try {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(script);
      await new Promise(res => { script.onload = res; });
      const canvas = await window.html2canvas(cardRef.current, { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true, logging: false });
      const link = document.createElement('a');
      link.download = `repolens-${profile.username}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) { console.error(e); }
    setDownloading(false);
  };

  const copyShareText = () => {
    const habitStr = [habits.isNightOwl && '🦉 Night Owl', habits.isWeekendWarrior && '⚔️ Weekend Warrior', habits.isMorningDev && '☀️ Morning Dev'].filter(Boolean).join(' · ');
    const text = `${persona.emoji} I'm ${persona.name} on GitHub!\n\n👤 @${profile.username} · ${profile.accountAgeYears}y on GitHub\n⭐ ${fmt(stats.totalStars)} stars · 📁 ${profile.publicRepos} repos · 👥 ${fmt(profile.followers)} followers\n${habitStr ? `\n${habitStr}\n` : ''}\n"${persona.tagline}"\n\nDiscover your dev persona → repolens.dev`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const circumference = 2 * Math.PI * 36;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Share Your Dev Profile</h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {/* THE SHAREABLE CARD */}
        <div ref={cardRef} style={{ ...s.card, '--persona-color': persona.color }}>
          {/* Background */}
          <div style={s.cardBg} />
          <div style={s.cardGrid} />
          <div style={{ ...s.glow, top: -80, left: -80, background: `${persona.color}18` }} />
          <div style={{ ...s.glow, bottom: -60, right: -60, background: 'rgba(124,58,237,0.1)' }} />

          {/* Top bar */}
          <div style={s.topBar}>
            <div style={s.brand}><span style={s.brandDot} /><span style={s.brandName}>RepoLens</span></div>
            <span style={s.date}>{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Main: avatar + persona */}
          <div style={s.mainRow}>
            <div style={s.avatarCol}>
              <img src={profile.avatar} alt="" style={s.avatar} crossOrigin="anonymous" />
              <div style={{ ...s.personaBadge, background: `${persona.color}22`, color: persona.color, border: `1px solid ${persona.color}44` }}>
                {persona.emoji} {persona.name}
              </div>
            </div>
            <div style={s.infoCol}>
              <div style={s.name}>{profile.name || profile.username}</div>
              <div style={s.handle}>@{profile.username}</div>
              {profile.bio && <div style={s.bio}>{profile.bio.slice(0, 72)}{profile.bio.length > 72 ? '…' : ''}</div>}
              <div style={{ ...s.tagline, color: persona.color }}>"{persona.tagline}"</div>
              <div style={s.traits}>
                {persona.traits?.map(t => (
                  <span key={t} style={{ ...s.traitPill, color: persona.color, borderColor: `${persona.color}44` }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${persona.color}44,transparent)`, margin: '16px 0' }} />

          {/* Stats grid */}
          <div style={s.statsGrid}>
            {[
              { emoji: '⭐', label: 'Stars', val: fmt(stats.totalStars) },
              { emoji: '📁', label: 'Repos', val: profile.publicRepos },
              { emoji: '👥', label: 'Followers', val: fmt(profile.followers) },
              { emoji: '🌐', label: 'Languages', val: stats.languageCount },
              { emoji: '📅', label: 'GitHub Age', val: `${profile.accountAgeYears}y` },
              { emoji: '🔥', label: 'Recent', val: stats.recentActivityCount },
            ].map(item => (
              <div key={item.label} style={s.statBox}>
                <span style={s.statEmoji}>{item.emoji}</span>
                <span style={s.statVal}>{item.val}</span>
                <span style={s.statLabel}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Radar mini + Languages */}
          <div style={s.bottomRow}>
            {/* Radar as bar chart */}
            <div style={s.radarMini}>
              <div style={s.sectionLabel}>SKILL RADAR</div>
              {Object.entries(radar).map(([key, val]) => (
                <div key={key} style={s.radarRow}>
                  <span style={s.radarKey}>{key.replace(/([A-Z])/g, ' $1').slice(0, 12)}</span>
                  <div style={s.radarBarWrap}>
                    <div style={{ ...s.radarBarFill, width: `${val}%`, background: persona.color }} />
                  </div>
                  <span style={{ ...s.radarNum, color: persona.color }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Language bar */}
            <div style={s.langSection}>
              <div style={s.sectionLabel}>LANGUAGES</div>
              <div style={s.langBar}>
                {topLanguages.slice(0, 5).map((l, i) => (
                  <div key={l.name} style={{ width: `${l.percentage}%`, height: '100%', background: LANG_COLORS[i], minWidth: 3 }} title={l.name} />
                ))}
              </div>
              <div style={s.langList}>
                {topLanguages.slice(0, 5).map((l, i) => (
                  <div key={l.name} style={s.langItem}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: LANG_COLORS[i], flexShrink: 0 }} />
                    <span style={s.langName}>{l.name}</span>
                    <span style={s.langPct}>{l.percentage}%</span>
                  </div>
                ))}
              </div>

              {/* Habit badges */}
              <div style={s.sectionLabel}>CODING STYLE</div>
              <div style={s.habitRow}>
                {habits.isNightOwl && <span style={s.habitBadge}>🦉 Night Owl</span>}
                {habits.isWeekendWarrior && <span style={s.habitBadge}>⚔️ Weekend Warrior</span>}
                {habits.isMorningDev && <span style={s.habitBadge}>☀️ Morning Dev</span>}
                <span style={s.habitBadge}>⏰ {habits.peakHourLabel}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={s.footer}>
            <span style={s.footerTags}>#github #{profile.username} #developer #repolens</span>
            <span style={s.footerUrl}>repolens.dev</span>
          </div>
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <button onClick={downloadCard} style={s.dlBtn} disabled={downloading}>
            {downloading ? '⏳ Generating...' : '⬇️ Download Card'}
          </button>
          <button onClick={copyShareText} style={s.copyBtn}>
            {copied ? '✅ Copied!' : '📋 Copy Share Text'}
          </button>
        </div>

        <div style={s.hint}>
          💡 Post this card on LinkedIn or Twitter with #RepoLens to help the project grow!
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 700, maxHeight: '92vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 18, padding: '4px 8px' },

  card: { position: 'relative', background: '#060c18', borderRadius: 16, padding: 26, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 },
  cardBg: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#060c18 0%,#0d1929 60%,#060c18 100%)' },
  cardGrid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '30px 30px' },
  glow: { position: 'absolute', width: 280, height: 280, borderRadius: '50%', filter: 'blur(55px)', pointerEvents: 'none' },
  topBar: { position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brand: { display: 'flex', alignItems: 'center', gap: 7 },
  brandDot: { width: 7, height: 7, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' },
  brandName: { fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase' },
  date: { fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: "'JetBrains Mono',monospace" },
  mainRow: { position: 'relative', display: 'flex', gap: 20, marginBottom: 4, alignItems: 'flex-start' },
  avatarCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 },
  avatar: { width: 72, height: 72, borderRadius: 14, border: '2px solid rgba(255,255,255,0.1)' },
  personaBadge: { fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, letterSpacing: '0.05em', textAlign: 'center', whiteSpace: 'nowrap' },
  infoCol: { flex: 1 },
  name: { fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: "'Syne',sans-serif" },
  handle: { fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 },
  bio: { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" },
  tagline: { fontSize: 13, fontWeight: 600, fontStyle: 'italic', marginBottom: 10, lineHeight: 1.4 },
  traits: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  traitPill: { fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 100, border: '1px solid', background: 'transparent' },
  statsGrid: { position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8, marginBottom: 16 },
  statBox: { background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  statEmoji: { fontSize: 14 },
  statVal: { fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 },
  statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' },
  bottomRow: { position: 'relative', display: 'flex', gap: 20, marginBottom: 16 },
  radarMini: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  sectionLabel: { fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" },
  radarRow: { display: 'flex', alignItems: 'center', gap: 7 },
  radarKey: { fontSize: 9, color: 'rgba(255,255,255,0.3)', width: 72, flexShrink: 0, textTransform: 'capitalize', fontFamily: "'JetBrains Mono',monospace" },
  radarBarWrap: { flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  radarBarFill: { height: '100%', borderRadius: 2 },
  radarNum: { fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, width: 20, textAlign: 'right' },
  langSection: { flex: 1 },
  langBar: { height: 5, borderRadius: 4, overflow: 'hidden', display: 'flex', marginBottom: 8, background: 'rgba(255,255,255,0.05)' },
  langList: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 },
  langItem: { display: 'flex', alignItems: 'center', gap: 7 },
  langName: { flex: 1, fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono',monospace" },
  langPct: { fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: "'JetBrains Mono',monospace" },
  habitRow: { display: 'flex', flexWrap: 'wrap', gap: 5 },
  habitBadge: { fontSize: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '3px 8px', color: 'rgba(255,255,255,0.5)' },
  footer: { position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' },
  footerTags: { fontSize: 9, color: 'rgba(0,212,255,0.35)', fontFamily: "'JetBrains Mono',monospace" },
  footerUrl: { fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.1em' },

  actions: { display: 'flex', gap: 12, marginBottom: 14 },
  dlBtn: { flex: 1, background: '#00d4ff', color: '#000', border: 'none', borderRadius: 10, padding: '12px 20px', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  copyBtn: { flex: 1, background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 10, padding: '12px 20px', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  hint: { fontSize: 12, color: 'var(--text3)', textAlign: 'center', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: '10px 16px' },
};
