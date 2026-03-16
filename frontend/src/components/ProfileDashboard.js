import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, MapPin, Building2, Twitter, Users, GitBranch, Star, Calendar, Share2, GitFork } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import ProfileShareCard from './ProfileShareCard';
import useWindowSize from '../hooks/useWindowSize';

const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n ?? 0);
const timeAgo = (d) => {
  const diff = (Date.now() - new Date(d)) / (1000*60*60*24);
  if (diff < 30) return `${Math.floor(diff)}d ago`;
  if (diff < 365) return `${Math.floor(diff/30)}mo ago`;
  return `${Math.floor(diff/365)}y ago`;
};
const LANG_COLORS = ['#00d4ff','#7c3aed','#10b981','#f59e0b','#ef4444','#ec4899','#3b82f6','#84cc16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontFamily: 'var(--mono)' }}>
      {label && <div style={{ color: 'var(--text2)', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => <div key={i} style={{ color: p.color || 'var(--accent)' }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

export default function ProfileDashboard({ data, onReset, onAnalyzeProfile }) {
  const [showShare, setShowShare] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const { isMobile, isTablet } = useWindowSize();
  const { profile, stats, persona, habits, topLanguages, radar, timeline, topRepos, suggestions } = data;

  const handleSearch = (e) => { e.preventDefault(); if (searchInput.trim()) onAnalyzeProfile(searchInput.trim()); };

  const radarData = [
    { subject: 'Productivity', value: radar.productivity },
    { subject: 'Consistency', value: radar.consistency },
    { subject: 'Community', value: radar.community },
    { subject: 'Diversity', value: radar.diversity },
    { subject: 'Docs', value: radar.documentation },
    { subject: 'Open Source', value: radar.opensource },
  ];

  const col2 = isMobile ? '1fr' : '1fr 1fr';
  const col3 = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr';

  return (
    <div style={s.page}>
      <div style={s.grid} />

      {/* Header */}
      <header style={{ ...s.header, flexWrap: isMobile ? 'wrap' : 'nowrap', padding: isMobile ? '10px 12px' : '11px 24px' }}>
        <button onClick={onReset} style={s.backBtn}><ArrowLeft size={15} /> RepoLens</button>
        <form onSubmit={handleSearch} style={{ ...s.searchForm, order: isMobile ? 3 : 0, width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? '100%' : 360 }}>
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Analyze another profile..." style={s.searchInput} />
          <button type="submit" style={s.searchBtn} disabled={!searchInput.trim()}>Go</button>
        </form>
        <button onClick={() => setShowShare(true)} style={s.shareBtn}><Share2 size={14} />{!isMobile && ' Share'}</button>
        {!isMobile && <a href={profile.url} target="_blank" rel="noreferrer" style={s.ghLink}><ExternalLink size={13} /> GitHub</a>}
      </header>

      {showShare && <ProfileShareCard data={data} onClose={() => setShowShare(false)} />}

      <div style={{ ...s.content, padding: isMobile ? '14px 12px' : '28px 24px' }}>

        {/* ── HERO ROW ── */}
        <div style={{ display: 'flex', flexDirection: (isMobile || isTablet) ? 'column' : 'row', gap: 16, marginBottom: 16 }} className="stagger">

          {/* Profile card */}
          <div style={{ ...s.card, flexShrink: 0, width: (isMobile || isTablet) ? '100%' : 280, boxSizing: 'border-box' }}>
            <div style={s.avatarWrap}>
              <img src={profile.avatar} alt="" style={s.avatar} />
              <div style={{ ...s.personaBadgeSmall, background: `${persona.color}22`, color: persona.color }}>{persona.emoji} {persona.name}</div>
            </div>
            <div style={s.profileName}>{profile.name}</div>
            <div style={s.profileHandle}>@{profile.username}</div>
            {profile.bio && <p style={s.profileBio}>{profile.bio}</p>}
            <div style={s.profileMeta}>
              {profile.location && <span style={s.metaItem}><MapPin size={12}/>{profile.location}</span>}
              {profile.company && <span style={s.metaItem}><Building2 size={12}/>{profile.company}</span>}
              {profile.twitterUsername && <span style={s.metaItem}><Twitter size={12}/>@{profile.twitterUsername}</span>}
              {profile.hireable && <span style={{ ...s.metaItem, color: '#10b981' }}>✅ Open to work</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: <Users size={13}/>, label: 'Followers', val: fmt(profile.followers) },
                { icon: <Users size={13}/>, label: 'Following', val: fmt(profile.following) },
                { icon: <GitBranch size={13}/>, label: 'Repos', val: profile.publicRepos },
                { icon: <Calendar size={13}/>, label: 'Member', val: `${profile.accountAgeYears}y` },
              ].map(item => (
                <div key={item.label} style={s.profileStat}>
                  <span style={{ color: 'var(--text3)' }}>{item.icon}</span>
                  <span style={s.profileStatVal}>{item.val}</span>
                  <span style={s.profileStatLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Persona card */}
          <div style={{ ...s.card, flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div style={{ ...s.personaGlow, background: `${persona.color}15` }} />
            <div style={s.personaEmoji}>{persona.emoji}</div>
            <div style={{ ...s.personaName, fontSize: isMobile ? 22 : 28 }}>{persona.name}</div>
            <div style={{ ...s.personaTagline, color: persona.color }}>{persona.tagline}</div>
            <div style={s.traitsList}>
              {persona.traits?.map(t => <span key={t} style={{ ...s.traitPill, borderColor: `${persona.color}40`, color: persona.color }}>{t}</span>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { emoji: '⭐', label: 'Total Stars', val: fmt(stats.totalStars) },
                { emoji: '📝', label: 'Est. Commits', val: fmt(stats.totalCommits) },
                { emoji: '🌐', label: 'Languages', val: stats.languageCount },
                { emoji: '🔥', label: 'Recent', val: stats.recentActivityCount },
              ].map(item => (
                <div key={item.label} style={s.keyStat}>
                  <span style={{ fontSize: isMobile ? 18 : 20 }}>{item.emoji}</span>
                  <span style={s.keyStatVal}>{item.val}</span>
                  <span style={s.keyStatLabel}>{item.label}</span>
                </div>
              ))}
            </div>
            <div style={s.habitBadges}>
              {habits.isNightOwl && <span style={s.habitBadge}>🦉 Night Owl</span>}
              {habits.isWeekendWarrior && <span style={s.habitBadge}>⚔️ Weekend Warrior</span>}
              {habits.isMorningDev && <span style={s.habitBadge}>☀️ Morning Dev</span>}
              <span style={s.habitBadge}>⏰ Peak: {habits.peakHourLabel}</span>
              <span style={s.habitBadge}>📅 Active: {habits.peakDay}</span>
            </div>
          </div>

          {/* Skill Radar */}
          <div style={{ ...s.card, flexShrink: 0, width: (isMobile || isTablet) ? '100%' : 280, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={s.cardTitle}>Skill Radar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)' }} />
                <Radar name="Skills" dataKey="value" stroke={persona.color} fill={persona.color} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {radarData.map(d => (
                <div key={d.subject} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--text3)', width: 76, flexShrink: 0 }}>{d.subject}</span>
                  <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${d.value}%`, background: persona.color, borderRadius: 2, transition: 'width 1s ease' }} />
                  </div>
                  <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: persona.color, fontWeight: 600, width: 20, textAlign: 'right' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── HABITS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: col3, gap: 16, marginBottom: 16 }}>
          {[
            { title: 'Activity by Hour', chart: (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={habits.hourlyDistribution} margin={{ top: 5, right: 5, bottom: 5, left: -25 }} barSize={6}>
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'var(--text3)', fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} tickFormatter={h => h % 6 === 0 ? `${h}h` : ''} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Events" radius={[2,2,0,0]}>
                    {habits.hourlyDistribution.map((e, i) => <Cell key={i} fill={e.hour >= 22 || e.hour <= 4 ? '#7c3aed' : e.hour >= 9 && e.hour <= 17 ? '#00d4ff' : '#10b981'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )},
            { title: 'Activity by Day', chart: (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={habits.dailyDistribution} margin={{ top: 5, right: 5, bottom: 5, left: -25 }} barSize={24}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text3)', fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Events" radius={[4,4,0,0]}>
                    {habits.dailyDistribution.map((_, i) => <Cell key={i} fill={i === 0 || i === 6 ? '#f59e0b' : '#00d4ff'} opacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )},
            { title: 'Monthly Activity', chart: (
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={habits.monthlyTimeline} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <defs>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={persona.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={persona.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--text3)', fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} tickFormatter={m => m.slice(5)} interval="preserveStartEnd" />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke={persona.color} strokeWidth={2} fill="url(#aGrad)" name="Events" />
                </AreaChart>
              </ResponsiveContainer>
            )},
          ].map(({ title, chart }) => (
            <div key={title} style={s.card}>
              <h3 style={s.cardTitle}>{title}</h3>
              {chart}
            </div>
          ))}
        </div>

        {/* ── CAREER TIMELINE ── */}
        <div style={{ ...s.card, marginBottom: 16 }}>
          <h3 style={s.cardTitle}>Career Timeline</h3>
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', padding: '8px 0', WebkitOverflowScrolling: 'touch' }}>
            {timeline.map((year, i) => (
              <div key={year.year} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: isMobile ? 100 : 120, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12, position: 'relative', width: '100%' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: i === timeline.length-1 ? persona.color : 'var(--border2)', zIndex: 1, flexShrink: 0 }} />
                  {i < timeline.length-1 && <div style={{ position: 'absolute', top: 6, left: '50%', width: '100%', height: 1, background: 'var(--border2)' }} />}
                </div>
                <div style={{ textAlign: 'center', padding: '0 8px' }}>
                  <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 800, fontFamily: 'var(--mono)', marginBottom: 4 }}>{year.year}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>
                    <span>📁 {year.repoCount} repos</span>
                    {year.stars > 0 && <span>⭐ {year.stars}</span>}
                    {year.topRepo && <span style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 10 }}>{year.topRepo}</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                    {year.languages.slice(0,3).map((l, li) => (
                      <span key={l} style={{ fontSize: 9, fontFamily: 'var(--mono)', padding: '2px 6px', borderRadius: 4, background: `${LANG_COLORS[li]}22`, color: LANG_COLORS[li], border: `1px solid ${LANG_COLORS[li]}44` }}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── LANGUAGES + TOP REPOS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: col2, gap: 16, marginBottom: 16 }}>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Language Distribution</h3>
            <div style={{ height: 8, borderRadius: 6, overflow: 'hidden', display: 'flex', marginBottom: 16, background: 'var(--border)' }}>
              {topLanguages.slice(0,6).map((l, i) => <div key={l.name} style={{ width: `${l.percentage}%`, height: '100%', background: LANG_COLORS[i], minWidth: 4 }} />)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topLanguages.slice(0,8).map((l, i) => (
                <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: LANG_COLORS[i%LANG_COLORS.length], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{l.name}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{l.count} repos</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', width: 36, textAlign: 'right' }}>{l.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Top Repositories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {topRepos.map(repo => (
                <a key={repo.name} href={repo.url} target="_blank" rel="noreferrer" style={s.repoItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{repo.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text2)', flexShrink: 0 }}>
                      <Star size={11}/>{fmt(repo.stars)}<GitFork size={11} style={{ marginLeft: 6 }}/>{fmt(repo.forks)}
                    </span>
                  </div>
                  {repo.description && <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 6, wordBreak: 'break-word' }}>{repo.description.slice(0,80)}{repo.description.length > 80 ? '…' : ''}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {repo.language && <span style={{ fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: 'var(--text2)', border: '1px solid var(--border)', flexShrink: 0 }}>{repo.language}</span>}
                    <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{timeAgo(repo.updatedAt)}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── SUGGESTIONS ── */}
        {suggestions?.length > 0 && (
          <div style={s.card}>
            <h3 style={s.cardTitle}><span style={{ color: 'var(--accent)' }}>💡</span> Profile Improvement Suggestions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fill,minmax(210px,1fr))', gap: 12 }} className="stagger">
              {suggestions.map((sg, i) => (
                <div key={i} style={s.suggestCard} className="card-hover">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 22 }}>{sg.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 100, letterSpacing: '0.1em', textTransform: 'uppercase', background: sg.priority === 'high' ? 'rgba(239,68,68,0.15)' : sg.priority === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.12)', color: sg.priority === 'high' ? '#ef4444' : sg.priority === 'medium' ? '#f59e0b' : 'var(--text3)' }}>
                      {sg.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{sg.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{sg.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', position: 'relative', overflowX: 'hidden' },
  grid: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(30,42,58,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(30,42,58,0.3) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 },
  header: { position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5,8,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 },
  backBtn: { display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text2)', padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' },
  searchForm: { flex: 1, display: 'flex', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', minWidth: 0 },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 12, minWidth: 0 },
  searchBtn: { background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '4px 10px', fontFamily: 'var(--font)', fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0 },
  shareBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.15))', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8, color: 'var(--accent)', padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)', fontWeight: 700, flexShrink: 0 },
  ghLink: { display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)', fontSize: 12, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' },
  content: { maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1, overflowX: 'hidden' },
  card: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, animation: 'fadeUp 0.5s ease' },
  cardTitle: { fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 },
  avatarWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14, gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: 14, border: '2px solid var(--border2)' },
  personaBadgeSmall: { fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100 },
  profileName: { fontSize: 18, fontWeight: 800, textAlign: 'center', marginBottom: 2 },
  profileHandle: { fontSize: 12, color: 'var(--text3)', textAlign: 'center', fontFamily: 'var(--mono)', marginBottom: 10 },
  profileBio: { fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, textAlign: 'center', marginBottom: 10 },
  profileMeta: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' },
  profileStat: { background: 'var(--surface3)', borderRadius: 8, padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  profileStatVal: { fontSize: 15, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)' },
  profileStatLabel: { fontSize: 10, color: 'var(--text3)' },
  personaGlow: { position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' },
  personaEmoji: { fontSize: 44, marginBottom: 8, lineHeight: 1 },
  personaName: { fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 },
  personaTagline: { fontSize: 13, fontWeight: 600, marginBottom: 14, lineHeight: 1.4 },
  traitsList: { display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 20 },
  traitPill: { fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100, border: '1px solid', background: 'transparent' },
  keyStat: { background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  keyStatVal: { fontSize: 17, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)' },
  keyStatLabel: { fontSize: 10, color: 'var(--text3)', textAlign: 'center' },
  habitBadges: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  habitBadge: { fontSize: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 100, padding: '5px 12px', color: 'var(--text2)' },
  repoItem: { display: 'block', padding: '10px', borderRadius: 8, textDecoration: 'none', color: 'inherit', border: '1px solid transparent', transition: 'border-color 0.2s, background 0.2s' },
  suggestCard: { background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 },
};
