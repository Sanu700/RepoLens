import React, { useRef, useState } from 'react';

const getScoreColor = (score) => {
  if (score >= 75) return '#10b981';
  if (score >= 50) return '#f59e0b';
  if (score >= 25) return '#f97316';
  return '#ef4444';
};

const getScoreLabel = (score) => {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 25) return 'Needs Work';
  return 'Critical';
};

const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const LANG_COLORS = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function ShareCard({ overview, score, analytics, onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const scoreColor = getScoreColor(score.total);
  const scoreLabel = getScoreLabel(score.total);

  const downloadCard = async () => {
    setDownloading(true);
    try {
      // Dynamically load html2canvas
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(script);
      await new Promise((res) => { script.onload = res; });

      const canvas = await window.html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `repolens-${overview.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
    }
    setDownloading(false);
  };

  const copyShareText = () => {
    const text = `🔍 Just analyzed ${overview.fullName} with RepoLens!\n\n⭐ ${fmt(overview.stars)} stars · 🍴 ${fmt(overview.forks)} forks · 👥 ${overview.contributors} contributors\n🏆 Productivity Score: ${score.total}/100 (${scoreLabel})\n\nAnalyze your repo → repolens.dev`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const topLangs = analytics.languageData.slice(0, 4);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score.total / 100) * circumference;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Share Your Analysis</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* THE CARD — this gets captured */}
        <div ref={cardRef} style={styles.card}>
          {/* Background layers */}
          <div style={styles.cardBg} />
          <div style={styles.cardGrid} />
          <div style={{ ...styles.cardGlow, top: '-60px', left: '-60px', background: 'rgba(0,212,255,0.12)' }} />
          <div style={{ ...styles.cardGlow, bottom: '-80px', right: '-40px', background: 'rgba(124,58,237,0.1)' }} />

          {/* Top bar */}
          <div style={styles.cardTop}>
            <div style={styles.cardBrand}>
              <span style={styles.brandDot} />
              <span style={styles.brandName}>RepoLens</span>
            </div>
            <span style={styles.cardDate}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          {/* Repo identity */}
          <div style={styles.repoRow}>
            {overview.avatarUrl && (
              <img src={overview.avatarUrl} alt="" style={styles.avatar} crossOrigin="anonymous" />
            )}
            <div>
              <div style={styles.repoName}>{overview.fullName}</div>
              {overview.description && (
                <div style={styles.repoDesc}>
                  {overview.description.length > 80 ? overview.description.slice(0, 80) + '…' : overview.description}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Main content */}
          <div style={styles.mainRow}>
            {/* Score ring */}
            <div style={styles.scoreSection}>
              <svg width={100} height={100} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={50} cy={50} r={40} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
                <circle
                  cx={50} cy={50} r={40} fill="none"
                  stroke={scoreColor} strokeWidth={8}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }}
                />
              </svg>
              <div style={styles.scoreOverlay}>
                <span style={{ ...styles.scoreNum, color: scoreColor }}>{score.total}</span>
                <span style={styles.scoreOf}>/100</span>
              </div>
              <div style={{ ...styles.scoreBadge, background: `${scoreColor}22`, color: scoreColor }}>{scoreLabel}</div>
              <div style={styles.scoreSubtitle}>Productivity Score</div>
            </div>

            {/* Stats */}
            <div style={styles.statsSection}>
              {[
                { emoji: '⭐', label: 'Stars', value: fmt(overview.stars) },
                { emoji: '🍴', label: 'Forks', value: fmt(overview.forks) },
                { emoji: '👥', label: 'Contributors', value: overview.contributors },
                { emoji: '📝', label: 'Commits', value: fmt(overview.totalCommits) },
                { emoji: '🐛', label: 'Open Issues', value: analytics.issueStats.open },
                { emoji: '✅', label: 'Resolved', value: `${analytics.issueStats.resolutionRate}%` },
              ].map(s => (
                <div key={s.label} style={styles.statItem}>
                  <span style={styles.statEmoji}>{s.emoji}</span>
                  <div>
                    <div style={styles.statValue}>{s.value}</div>
                    <div style={styles.statLabel}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Languages bar */}
          {topLangs.length > 0 && (
            <div style={styles.langSection}>
              <div style={styles.langBar}>
                {topLangs.map((l, i) => (
                  <div key={l.name} style={{ width: `${l.percentage}%`, height: '100%', background: LANG_COLORS[i], borderRadius: i === 0 ? '4px 0 0 4px' : i === topLangs.length - 1 ? '0 4px 4px 0' : 0 }} />
                ))}
              </div>
              <div style={styles.langLegend}>
                {topLangs.map((l, i) => (
                  <div key={l.name} style={styles.langItem}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: LANG_COLORS[i], display: 'inline-block' }} />
                    <span style={styles.langName}>{l.name}</span>
                    <span style={styles.langPct}>{l.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score breakdown pills */}
          <div style={styles.pillsRow}>
            {Object.entries(score.breakdown).map(([key, val]) => (
              <div key={key} style={styles.pill}>
                <span style={styles.pillKey}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span style={{ ...styles.pillVal, color: val >= 10 ? '#10b981' : val >= 5 ? '#f59e0b' : '#ef4444' }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={styles.cardFooter}>
            <span style={styles.footerTag}>#{overview.primaryLanguage || 'code'} #opensource #github #repolens</span>
            <span style={styles.footerUrl}>repolens.dev</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={styles.actions}>
          <button onClick={downloadCard} style={styles.downloadBtn} disabled={downloading}>
            {downloading ? '⏳ Generating…' : '⬇️ Download Card'}
          </button>
          <button onClick={copyShareText} style={styles.copyBtn}>
            {copied ? '✅ Copied!' : '📋 Copy Share Text'}
          </button>
        </div>

        {/* Share text preview */}
        <div style={styles.shareTextBox}>
          <div style={styles.shareTextLabel}>Share text (for Twitter / LinkedIn)</div>
          <div style={styles.shareText}>
            🔍 Just analyzed <strong>{overview.fullName}</strong> with RepoLens!<br />
            ⭐ {fmt(overview.stars)} stars · 🍴 {fmt(overview.forks)} forks · 👥 {overview.contributors} contributors<br />
            🏆 Productivity Score: <span style={{ color: scoreColor }}>{score.total}/100 ({scoreLabel})</span><br />
            <span style={{ color: 'var(--accent)', opacity: 0.7 }}>Analyze your repo → repolens.dev</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 18, padding: '4px 8px' },

  // Card styles
  card: { position: 'relative', background: '#070d18', borderRadius: 16, padding: 28, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 },
  cardBg: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #070d18 0%, #0e1a2e 50%, #070d18 100%)' },
  cardGrid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' },
  cardGlow: { position: 'absolute', width: 300, height: 300, borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' },
  cardTop: { position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardBrand: { display: 'flex', alignItems: 'center', gap: 8 },
  brandDot: { width: 8, height: 8, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' },
  brandName: { fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', color: '#00d4ff', fontFamily: "'JetBrains Mono', monospace" },
  cardDate: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono', monospace" },
  repoRow: { position: 'relative', display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 },
  avatar: { width: 48, height: 48, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 },
  repoName: { fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: "'Syne', sans-serif" },
  repoDesc: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4, lineHeight: 1.5, fontFamily: "'JetBrains Mono', monospace" },
  divider: { position: 'relative', height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)', marginBottom: 20 },
  mainRow: { position: 'relative', display: 'flex', gap: 24, marginBottom: 20, alignItems: 'center' },
  scoreSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, position: 'relative' },
  scoreOverlay: { position: 'absolute', top: 25, display: 'flex', alignItems: 'baseline', gap: 2 },
  scoreNum: { fontSize: 28, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 },
  scoreOf: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono', monospace" },
  scoreBadge: { fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 100, letterSpacing: '0.1em', textTransform: 'uppercase' },
  scoreSubtitle: { fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' },
  statsSection: { flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  statItem: { display: 'flex', alignItems: 'center', gap: 8 },
  statEmoji: { fontSize: 16, flexShrink: 0 },
  statValue: { fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, letterSpacing: '0.05em' },
  langSection: { position: 'relative', marginBottom: 16 },
  langBar: { height: 6, borderRadius: 4, overflow: 'hidden', display: 'flex', marginBottom: 10, background: 'rgba(255,255,255,0.05)' },
  langLegend: { display: 'flex', gap: 14, flexWrap: 'wrap' },
  langItem: { display: 'flex', alignItems: 'center', gap: 6 },
  langName: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: "'JetBrains Mono', monospace" },
  langPct: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono', monospace" },
  pillsRow: { position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  pill: { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100, padding: '4px 10px' },
  pillKey: { fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' },
  pillVal: { fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  cardFooter: { position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' },
  footerTag: { fontSize: 10, color: 'rgba(0,212,255,0.4)', fontFamily: "'JetBrains Mono', monospace" },
  footerUrl: { fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' },

  // Action area
  actions: { display: 'flex', gap: 12, marginBottom: 16 },
  downloadBtn: { flex: 1, background: '#00d4ff', color: '#000', border: 'none', borderRadius: 10, padding: '12px 20px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  copyBtn: { flex: 1, background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 10, padding: '12px 20px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  shareTextBox: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 },
  shareTextLabel: { fontSize: 11, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 },
  shareText: { fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, fontFamily: "'JetBrains Mono', monospace" },
};
