import React, { useState } from 'react';
import { Star, GitFork, GitBranch, Clock, Users, Code2, AlertCircle, GitPullRequest, ArrowLeft, ExternalLink, CheckCircle, Search, Share2 } from 'lucide-react';
import ScoreRing from './ScoreRing';
import { CommitChart, LanguageChart, ContributorChart } from './Charts';
import ShareCard from './ShareCard';
import useWindowSize from '../hooks/useWindowSize';

const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : n;
const timeAgo = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff/2592000)}mo ago`;
  return `${Math.floor(diff/31536000)}y ago`;
};

export default function Dashboard({ data, onReset, onAnalyze }) {
  const [newUrl, setNewUrl] = useState('');
  const [showShare, setShowShare] = useState(false);
  const { isMobile, isTablet } = useWindowSize();
  const { overview, score, analytics, insights, suggestions } = data;

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (newUrl.trim()) onAnalyze(newUrl.trim());
  };

  return (
    <div style={s.page}>
      <div style={s.grid} />

      <header style={{ ...s.header, flexWrap: isMobile ? 'wrap' : 'nowrap', padding: isMobile ? '10px 12px' : '12px 24px' }}>
        <button onClick={onReset} style={s.backBtn}><ArrowLeft size={15} /> RepoLens</button>
        <form onSubmit={handleAnalyze} style={{ ...s.searchForm, order: isMobile ? 3 : 0, width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? '100%' : 400 }}>
          <Search size={14} color="var(--text3)" />
          <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="Analyze another repo..." style={s.searchInput} />
          <button type="submit" style={s.searchBtn} disabled={!newUrl.trim()}>Go</button>
        </form>
        <button onClick={() => setShowShare(true)} style={s.shareBtn}><Share2 size={14} />{!isMobile && ' Share'}</button>
        {!isMobile && <a href={overview.url} target="_blank" rel="noreferrer" style={s.ghLink}><ExternalLink size={14} /> GitHub</a>}
      </header>

      {showShare && <ShareCard overview={overview} score={score} analytics={analytics} onClose={() => setShowShare(false)} />}

      <div style={{ ...s.content, padding: isMobile ? '16px 12px' : '32px 24px' }}>

        {/* Repo header */}
        <div style={{ ...s.repoHeader, flexDirection: isMobile ? 'column' : 'row' }}>
          {overview.avatarUrl && <img src={overview.avatarUrl} alt="" style={s.avatar} />}
          <div>
            <div style={{ ...s.repoName, fontSize: isMobile ? 20 : 28 }}>{overview.fullName}</div>
            {overview.description && <p style={s.repoDesc}>{overview.description}</p>}
            <div style={s.topicWrap}>
              {overview.topics?.slice(0,6).map(t => <span key={t} style={s.topic}>{t}</span>)}
              {overview.license && <span style={{ ...s.topic, borderColor: 'rgba(16,185,129,0.3)', color: 'var(--accent3)' }}>{overview.license}</span>}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ ...s.statsGrid, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill,minmax(130px,1fr))' }}>
          {[
            { icon: <Star size={16}/>, label: 'Stars', value: fmt(overview.stars), color: '#f59e0b' },
            { icon: <GitFork size={16}/>, label: 'Forks', value: fmt(overview.forks), color: '#7c3aed' },
            { icon: <Users size={16}/>, label: 'Contributors', value: overview.contributors, color: '#00d4ff' },
            { icon: <GitBranch size={16}/>, label: 'Commits', value: fmt(overview.totalCommits), color: '#10b981' },
            { icon: <AlertCircle size={16}/>, label: 'Open Issues', value: analytics.issueStats.open, color: '#ef4444' },
            { icon: <GitPullRequest size={16}/>, label: 'Pull Requests', value: analytics.prStats.open + analytics.prStats.closed, color: '#ec4899' },
            { icon: <Code2 size={16}/>, label: 'Language', value: overview.primaryLanguage || 'N/A', color: '#84cc16' },
            { icon: <Clock size={16}/>, label: 'Last Push', value: timeAgo(overview.lastUpdated), color: '#f97316' },
          ].map(stat => (
            <div key={stat.label} style={s.statCard} className="card-hover">
              <span style={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</span>
              <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: stat.color, fontFamily: 'var(--mono)' }}>{stat.value}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Score + Insights */}
        <div style={{ ...s.mainGrid, gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 1.6fr', gap: 16, marginBottom: 16 }}>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Productivity Score</h3>
            <ScoreRing score={score.total} breakdown={score.breakdown} />
          </div>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Insights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {insights.map((ins, i) => (
                <div key={i} style={{ ...s.insightRow, borderColor: ins.type === 'positive' ? 'rgba(16,185,129,0.2)' : ins.type === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{ins.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Commit Activity (Last 30 days)</h3>
            {analytics.commitTimeline.length > 0 ? <CommitChart data={analytics.commitTimeline} /> : <EmptyState text="No recent commit data" />}
          </div>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Language Distribution</h3>
            {analytics.languageData.length > 0 ? <LanguageChart data={analytics.languageData} /> : <EmptyState text="No language data" />}
          </div>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Top Contributors</h3>
            {analytics.contributorActivity.length > 0 ? <ContributorChart data={analytics.contributorActivity} /> : <EmptyState text="No contributor data" />}
          </div>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Issue & PR Stats</h3>
            <IssueStats issueStats={analytics.issueStats} prStats={analytics.prStats} />
          </div>
        </div>

        {/* Suggestions */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Improvement Suggestions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
            {suggestions.map((sg, i) => (
              <div key={i} style={s.suggestCard} className="card-hover">
                <div style={s.suggestTop}>
                  <span style={{ fontSize: 24 }}>{sg.icon}</span>
                  <span style={{ ...s.priorityBadge, background: sg.priority === 'high' ? 'rgba(239,68,68,0.15)' : sg.priority === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)', color: sg.priority === 'high' ? '#ef4444' : sg.priority === 'medium' ? '#f59e0b' : 'var(--text3)' }}>
                    {sg.priority}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{sg.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{sg.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IssueStats({ issueStats, prStats }) {
  const total = issueStats.open + issueStats.closed;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: 'var(--text2)' }}>Issues</span>
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{issueStats.open} open · {issueStats.closed} closed</span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: total > 0 ? `${(issueStats.closed/total)*100}%` : '0%', background: 'var(--accent3)', transition: 'width 1s ease', borderRadius: 3 }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Resolution rate: {issueStats.resolutionRate}%</div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: 'var(--text2)' }}>Pull Requests</span>
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{prStats.open} open · {prStats.closed} merged</span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: (prStats.open+prStats.closed) > 0 ? `${(prStats.closed/(prStats.open+prStats.closed))*100}%` : '0%', background: 'var(--accent2)', transition: 'width 1s ease', borderRadius: 3 }} />
        </div>
      </div>
      {[
        { label: 'Open Issues', val: issueStats.open, color: '#ef4444', icon: <AlertCircle size={14}/> },
        { label: 'Closed Issues', val: issueStats.closed, color: '#10b981', icon: <CheckCircle size={14}/> },
        { label: 'Open PRs', val: prStats.open, color: '#f59e0b', icon: <GitPullRequest size={14}/> },
        { label: 'Merged PRs', val: prStats.closed, color: '#7c3aed', icon: <GitPullRequest size={14}/> },
      ].map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: item.color }}>{item.icon}</span>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--text2)' }}>{item.label}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: item.color, fontWeight: 600 }}>{item.val}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13 }}>{text}</div>;
}

const s = {
  page: { minHeight: '100vh', position: 'relative' },
  grid: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(30,42,58,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(30,42,58,0.3) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 },
  header: { position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5,8,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text2)', padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' },
  searchForm: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px' },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 12, minWidth: 0 },
  searchBtn: { background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '4px 10px', fontFamily: 'var(--font)', fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0 },
  shareBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.15))', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8, color: 'var(--accent)', padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)', fontWeight: 700, flexShrink: 0 },
  ghLink: { display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontSize: 13, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' },
  content: { maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 },
  repoHeader: { display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24, animation: 'fadeUp 0.5s ease' },
  avatar: { width: 56, height: 56, borderRadius: 12, border: '1px solid var(--border)', flexShrink: 0 },
  repoName: { fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 },
  repoDesc: { color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, marginBottom: 10, maxWidth: 600 },
  topicWrap: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  topic: { fontSize: 11, color: 'var(--accent)', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 100, padding: '3px 10px', fontFamily: 'var(--mono)' },
  statsGrid: { display: 'grid', gap: 10, marginBottom: 16 },
  statCard: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 },
  mainGrid: { display: 'grid' },
  card: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, animation: 'fadeUp 0.5s ease' },
  cardTitle: { fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 },
  insightRow: { display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', border: '1px solid', borderRadius: 8, background: 'rgba(255,255,255,0.02)' },
  suggestCard: { background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: 14 },
  suggestTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  priorityBadge: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, letterSpacing: '0.1em', textTransform: 'uppercase' },
};
