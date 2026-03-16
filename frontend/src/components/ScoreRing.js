import React, { useEffect, useState } from 'react';

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

export default function ScoreRing({ score, breakdown }) {
  const [animated, setAnimated] = useState(0);
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = () => {
        start += 2;
        setAnimated(Math.min(start, score));
        if (start < score) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div style={styles.wrap}>
      <div style={styles.ringWrap}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div style={styles.scoreInner}>
          <span style={{ ...styles.scoreNum, color }}>{animated}</span>
          <span style={styles.scoreLabel}>{label}</span>
        </div>
      </div>

      {breakdown && (
        <div style={styles.breakdown}>
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key} style={styles.bRow}>
              <span style={styles.bLabel}>{formatKey(key)}</span>
              <div style={styles.bBar}>
                <div style={{ ...styles.bFill, width: `${(val / maxFor(key)) * 100}%`, background: color }} />
              </div>
              <span style={styles.bVal}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const maxFor = (key) => {
  const maxes = { commitFrequency: 20, recentActivity: 20, contributors: 15, issueResolution: 15, documentation: 15, communityEngagement: 15 };
  return maxes[key] || 20;
};

const formatKey = (key) => {
  const map = { commitFrequency: 'Commit Frequency', recentActivity: 'Recent Activity', contributors: 'Contributors', issueResolution: 'Issue Resolution', documentation: 'Documentation', communityEngagement: 'Community' };
  return map[key] || key;
};

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 },
  ringWrap: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  scoreInner: { position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  scoreNum: { fontSize: 44, fontWeight: 800, lineHeight: 1, fontFamily: 'var(--mono)' },
  scoreLabel: { fontSize: 12, color: 'var(--text2)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 },
  breakdown: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10 },
  bRow: { display: 'flex', alignItems: 'center', gap: 10 },
  bLabel: { fontSize: 11, color: 'var(--text3)', width: 120, flexShrink: 0 },
  bBar: { flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  bFill: { height: '100%', borderRadius: 2, transition: 'width 0.8s ease' },
  bVal: { fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)', width: 20, textAlign: 'right' },
};
