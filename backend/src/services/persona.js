// ─── DEV PERSONAS ────────────────────────────────────────────────────────────
const PERSONAS = [
  {
    id: 'architect',
    name: 'The Architect',
    emoji: '🏛️',
    tagline: 'You build systems that outlast trends.',
    traits: ['systematic', 'thorough', 'low bus factor', 'loves docs'],
    color: '#00d4ff',
    detect: ({ avgCommitsPerRepo, docScore, repoCount, avgStars }) =>
      avgCommitsPerRepo > 50 && docScore > 60 && repoCount > 5,
  },
  {
    id: 'hacker',
    name: 'The Hacker',
    emoji: '⚡',
    tagline: 'Ship first, refactor never.',
    traits: ['prolific', 'fast mover', 'experimental', 'high output'],
    color: '#f59e0b',
    detect: ({ repoCount, avgCommitMsg, nightOwl, weekendWarrior }) =>
      repoCount > 20 && nightOwl > 0.35,
  },
  {
    id: 'craftsman',
    name: 'The Craftsman',
    emoji: '🔨',
    tagline: 'A few repos, perfected obsessively.',
    traits: ['deep focus', 'quality over quantity', 'consistent', 'iterative'],
    color: '#10b981',
    detect: ({ repoCount, avgCommitsPerRepo, consistencyScore }) =>
      repoCount <= 10 && avgCommitsPerRepo > 80 && consistencyScore > 60,
  },
  {
    id: 'explorer',
    name: 'The Explorer',
    emoji: '🧭',
    tagline: 'Polyglot. You\'ve tried everything at least once.',
    traits: ['multi-language', 'curious', 'breadth over depth', 'trend-aware'],
    color: '#7c3aed',
    detect: ({ languageCount, repoCount }) =>
      languageCount >= 5 && repoCount > 8,
  },
  {
    id: 'collaborator',
    name: 'The Collaborator',
    emoji: '🤝',
    tagline: 'Open source is your love language.',
    traits: ['community builder', 'responsive', 'fork-friendly', 'PR champion'],
    color: '#ec4899',
    detect: ({ forkedRepos, totalStars, avgStars }) =>
      totalStars > 50 || forkedRepos > 5,
  },
  {
    id: 'ghost',
    name: 'The Ghost',
    emoji: '👻',
    tagline: 'Active in the shadows. Commits at 3am.',
    traits: ['night owl', 'solo coder', 'private by nature', 'mysterious'],
    color: '#6366f1',
    detect: ({ nightOwl, repoCount }) => nightOwl > 0.5,
  },
];

// ─── HABITS ANALYSIS ─────────────────────────────────────────────────────────
const analyzeHabits = (events, repos) => {
  const hourCounts = Array(24).fill(0);
  const dayCounts = Array(7).fill(0);
  const monthActivity = {};

  events.forEach(e => {
    const d = new Date(e.created_at);
    hourCounts[d.getHours()]++;
    dayCounts[d.getDay()]++;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthActivity[key] = (monthActivity[key] || 0) + 1;
  });

  const total = events.length || 1;
  const nightEvents = hourCounts.slice(22).reduce((a, b) => a + b, 0) + hourCounts.slice(0, 5).reduce((a, b) => a + b, 0);
  const weekendEvents = dayCounts[0] + dayCounts[6];
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayCounts.indexOf(Math.max(...dayCounts))];

  const hourlyDistribution = hourCounts.map((count, hour) => ({ hour, count }));
  const dailyDistribution = dayCounts.map((count, day) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day], count
  }));

  const monthlyTimeline = Object.entries(monthActivity)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([month, count]) => ({ month, count }));

  return {
    nightOwlRatio: nightEvents / total,
    weekendWarriorRatio: weekendEvents / total,
    peakHour,
    peakDay,
    peakHourLabel: peakHour < 12 ? `${peakHour}am` : peakHour === 12 ? '12pm' : `${peakHour - 12}pm`,
    hourlyDistribution,
    dailyDistribution,
    monthlyTimeline,
    isNightOwl: nightEvents / total > 0.3,
    isWeekendWarrior: weekendEvents / total > 0.35,
    isMorningDev: peakHour >= 6 && peakHour <= 10,
  };
};

// ─── SKILL RADAR ─────────────────────────────────────────────────────────────
const calculateSkillRadar = ({ user, repos, habits, totalCommits, totalStars }) => {
  // Productivity: commit volume + repo count
  const productivity = Math.min(100, (totalCommits / 10) + (repos.length * 2));

  // Consistency: regular activity over time
  const activeMonths = habits.monthlyTimeline.filter(m => m.count > 2).length;
  const consistency = Math.min(100, (activeMonths / 12) * 100);

  // Community: stars, followers, forks received
  const community = Math.min(100,
    Math.log10(Math.max(totalStars + 1, 1)) * 20 +
    Math.log10(Math.max(user.followers + 1, 1)) * 15
  );

  // Diversity: language count + repo variety
  const languages = new Set(repos.map(r => r.language).filter(Boolean));
  const diversity = Math.min(100, languages.size * 12 + Math.min(repos.length * 2, 40));

  // Documentation: repos with descriptions + READMEs estimated
  const withDesc = repos.filter(r => r.description).length;
  const documentation = Math.min(100, (withDesc / Math.max(repos.length, 1)) * 100);

  // Open Source: public repos, stars, forks given
  const opensource = Math.min(100,
    (repos.filter(r => !r.private).length / Math.max(repos.length, 1)) * 60 +
    Math.min(totalStars / 5, 40)
  );

  return {
    productivity: Math.round(productivity),
    consistency: Math.round(consistency),
    community: Math.round(community),
    diversity: Math.round(diversity),
    documentation: Math.round(documentation),
    opensource: Math.round(opensource),
  };
};

// ─── CAREER TIMELINE ─────────────────────────────────────────────────────────
const buildCareerTimeline = (repos, habits) => {
  // Group repos by year of creation
  const byYear = {};
  repos.forEach(r => {
    const year = new Date(r.created_at).getFullYear();
    if (!byYear[year]) byYear[year] = { year, repos: [], stars: 0, languages: new Set() };
    byYear[year].repos.push(r.name);
    byYear[year].stars += r.stargazers_count;
    if (r.language) byYear[year].languages.add(r.language);
  });

  return Object.values(byYear)
    .sort((a, b) => a.year - b.year)
    .map(y => ({
      year: y.year,
      repoCount: y.repos.length,
      stars: y.stars,
      languages: Array.from(y.languages),
      topRepo: repos
        .filter(r => new Date(r.created_at).getFullYear() === y.year)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)[0]?.name || '',
    }));
};

// ─── TOP REPOS ────────────────────────────────────────────────────────────────
const getTopRepos = (repos) => {
  return repos
    .filter(r => !r.fork)
    .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count))
    .slice(0, 6)
    .map(r => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      url: r.html_url,
      updatedAt: r.updated_at,
    }));
};

// ─── PROFILE SUGGESTIONS ─────────────────────────────────────────────────────
const generateProfileSuggestions = ({ user, ownRepos, totalStars, habits, radar, languageCount }) => {
  const suggestions = [];
  const withDesc = ownRepos.filter(r => r.description).length;
  const descRatio = withDesc / Math.max(ownRepos.length, 1);
  const daysSinceActive = ownRepos.length > 0
    ? (Date.now() - new Date(ownRepos.sort((a,b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0].pushed_at)) / (1000*60*60*24)
    : 999;

  if (!user.bio) suggestions.push({ priority: 'high', icon: '✍️', title: 'Add a GitHub Bio', desc: 'A short bio helps recruiters & collaborators understand who you are at a glance.' });
  if (!user.location) suggestions.push({ priority: 'low', icon: '📍', title: 'Add Your Location', desc: 'Location helps with local job opportunities and community discovery.' });
  if (!user.blog) suggestions.push({ priority: 'medium', icon: '🌐', title: 'Add a Personal Website / Portfolio', desc: 'Link your portfolio, LinkedIn, or blog — recruiters always check this field.' });
  if (!user.twitter_username) suggestions.push({ priority: 'low', icon: '𝕏', title: 'Link Your Twitter / X', desc: 'Building in public on Twitter is one of the fastest ways to grow your following.' });
  if (descRatio < 0.5) suggestions.push({ priority: 'high', icon: '📝', title: 'Add Descriptions to Repos', desc: `Only ${Math.round(descRatio*100)}% of your repos have descriptions. Recruiters skim these.` });
  if (totalStars < 10) suggestions.push({ priority: 'medium', icon: '⭐', title: 'Build Something Star-worthy', desc: 'Focus 1–2 repos on a useful tool or interesting project. Quality over quantity.' });
  if (radar.consistency < 40) suggestions.push({ priority: 'high', icon: '📅', title: 'Improve Commit Consistency', desc: 'Irregular activity hurts your profile score. Even small daily commits keep the streak alive.' });
  if (radar.community < 30) suggestions.push({ priority: 'medium', icon: '🤝', title: 'Contribute to Open Source', desc: 'PRs to popular repos build credibility, followers, and visibility fast.' });
  if (languageCount < 2) suggestions.push({ priority: 'low', icon: '🌐', title: 'Explore More Languages', desc: 'Try a side project in a new language — it signals adaptability to employers.' });
  if (ownRepos.filter(r => !r.fork && r.stargazers_count === 0).length > 5) suggestions.push({ priority: 'low', icon: '🧹', title: 'Clean Up Empty / Unused Repos', desc: 'Too many empty repos dilute your profile. Archive or delete the ones you\'ll never finish.' });
  if (daysSinceActive > 90) suggestions.push({ priority: 'high', icon: '🔥', title: 'Resume GitHub Activity', desc: `No pushes in ${Math.floor(daysSinceActive)} days. Inactive profiles get skipped by recruiters.` });
  if (user.followers < 10) suggestions.push({ priority: 'medium', icon: '👥', title: 'Grow Your Followers', desc: 'Post your projects on Reddit, Dev.to, or Twitter. Followers = social proof.' });
  if (!ownRepos.some(r => r.name.toLowerCase().includes('portfolio') || r.name.toLowerCase().includes('website'))) {
    suggestions.push({ priority: 'medium', icon: '🏠', title: 'Build a Portfolio Repo', desc: 'Create a pinned repo called "portfolio" or use GitHub Pages to showcase your work.' });
  }

  return suggestions.sort((a, b) => ['high','medium','low'].indexOf(a.priority) - ['high','medium','low'].indexOf(b.priority)).slice(0, 9);
};

// ─── MAIN PROFILE ANALYSIS ───────────────────────────────────────────────────
const analyzeProfile = (user, repos, events) => {
  const ownRepos = repos.filter(r => !r.fork);
  const forkedRepos = repos.filter(r => r.fork).length;
  const totalStars = ownRepos.reduce((a, r) => a + r.stargazers_count, 0);
  const totalForks = ownRepos.reduce((a, r) => a + r.forks_count, 0);
  const totalCommits = events.filter(e => e.type === 'PushEvent')
    .reduce((a, e) => a + (e.payload?.commits?.length || 0), 0);

  const languages = {};
  ownRepos.forEach(r => {
    if (r.language) languages[r.language] = (languages[r.language] || 0) + 1;
  });
  const languageCount = Object.keys(languages).length;
  const topLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / ownRepos.length) * 100) }));

  const habits = analyzeHabits(events, repos);
  const avgCommitsPerRepo = totalCommits / Math.max(ownRepos.length, 1);

  // Doc score estimate
  const withDesc = ownRepos.filter(r => r.description).length;
  const docScore = Math.round((withDesc / Math.max(ownRepos.length, 1)) * 100);
  const consistencyScore = habits.monthlyTimeline.filter(m => m.count > 2).length * 8;

  // Detect persona
  const personaInput = {
    repoCount: ownRepos.length, avgCommitsPerRepo, nightOwl: habits.nightOwlRatio,
    weekendWarrior: habits.weekendWarriorRatio, languageCount, totalStars,
    forkedRepos, docScore, consistencyScore,
  };
  const matchedPersona = PERSONAS.find(p => p.detect(personaInput)) || PERSONAS[0];

  const radar = calculateSkillRadar({ user, repos: ownRepos, habits, totalCommits, totalStars });
  const timeline = buildCareerTimeline(ownRepos, habits);
  const topRepos = getTopRepos(ownRepos);
  const suggestions = generateProfileSuggestions({ user, ownRepos, totalStars, habits, radar, languageCount });

  // Account age
  const accountAgeDays = (Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24);
  const accountAgeYears = (accountAgeDays / 365).toFixed(1);

  // Streak / recent activity
  const recentEvents = events.filter(e => {
    const d = new Date(e.created_at);
    return (Date.now() - d) < 30 * 24 * 60 * 60 * 1000;
  });

  return {
    profile: {
      username: user.login,
      name: user.name || user.login,
      bio: user.bio,
      avatar: user.avatar_url,
      location: user.location,
      company: user.company,
      blog: user.blog,
      twitterUsername: user.twitter_username,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      publicGists: user.public_gists,
      createdAt: user.created_at,
      accountAgeYears,
      url: user.html_url,
      hireable: user.hireable,
    },
    stats: {
      totalStars,
      totalForks,
      totalCommits,
      ownRepoCount: ownRepos.length,
      forkedRepoCount: forkedRepos,
      languageCount,
      recentActivityCount: recentEvents.length,
    },
    persona: {
      ...matchedPersona,
      detect: undefined, // strip function before JSON
    },
    habits,
    topLanguages,
    radar,
    timeline,
    topRepos,
    suggestions,
  };
};

module.exports = { analyzeProfile };
