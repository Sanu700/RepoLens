const calculateProductivityScore = ({ repo, commits, contributors, issues, prs, hasReadme, contents }) => {
  let score = 0;
  const breakdown = {};

  // 1. Commit frequency (max 20pts)
  const daysSinceCreation = (Date.now() - new Date(repo.created_at)) / (1000 * 60 * 60 * 24);
  const commitsPerDay = commits.length / Math.max(daysSinceCreation, 1);
  const commitScore = Math.min(20, commitsPerDay * 100);
  breakdown.commitFrequency = Math.round(commitScore);
  score += commitScore;

  // 2. Recent activity (max 20pts)
  const lastPush = new Date(repo.pushed_at);
  const daysSinceLastPush = (Date.now() - lastPush) / (1000 * 60 * 60 * 24);
  const recentScore = daysSinceLastPush < 7 ? 20 : daysSinceLastPush < 30 ? 15 : daysSinceLastPush < 90 ? 8 : daysSinceLastPush < 365 ? 3 : 0;
  breakdown.recentActivity = Math.round(recentScore);
  score += recentScore;

  // 3. Contributors (max 15pts)
  const contribScore = Math.min(15, contributors.length * 2);
  breakdown.contributors = Math.round(contribScore);
  score += contribScore;

  // 4. Issue resolution rate (max 15pts)
  const totalIssues = issues.open.length + issues.closed.length;
  const issueScore = totalIssues === 0 ? 5 : Math.min(15, (issues.closed.length / totalIssues) * 15);
  breakdown.issueResolution = Math.round(issueScore);
  score += issueScore;

  // 5. Documentation presence (max 15pts)
  const fileNames = contents.map(f => f.name.toLowerCase());
  let docScore = 0;
  if (hasReadme) docScore += 7;
  if (fileNames.some(f => f.includes('contributing'))) docScore += 3;
  if (fileNames.some(f => f.includes('license'))) docScore += 2;
  if (fileNames.some(f => f.includes('changelog') || f.includes('history'))) docScore += 2;
  if (fileNames.some(f => f.includes('.github') || f.includes('docs'))) docScore += 1;
  breakdown.documentation = Math.round(docScore);
  score += docScore;

  // 6. Community engagement (max 15pts)
  const starScore = Math.min(5, repo.stargazers_count / 10);
  const forkScore = Math.min(5, repo.forks_count / 5);
  const prScore = Math.min(5, (prs.open.length + prs.closed.length) / 5);
  breakdown.communityEngagement = Math.round(starScore + forkScore + prScore);
  score += starScore + forkScore + prScore;

  return { total: Math.min(100, Math.round(score)), breakdown };
};

const generateCommitTimeline = (commits) => {
  const byDate = {};
  commits.forEach(c => {
    const date = (c.commit?.author?.date || c.commit?.committer?.date)?.slice(0, 10);
    if (!date) return;
    byDate[date] = (byDate[date] || 0) + 1;
  });
  return Object.entries(byDate)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, count]) => ({ date, commits: count }));
};

const generateContributorActivity = (contributors) => {
  return contributors.slice(0, 10).map(c => ({
    name: c.login,
    commits: c.contributions,
    avatar: c.avatar_url,
  }));
};

const generateInsights = ({ repo, commits, contributors, issues, prs, hasReadme, score }) => {
  const insights = [];
  const daysSinceLastPush = (Date.now() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24);

  if (commits.length > 500) insights.push({ type: 'positive', icon: '🚀', text: 'Very high commit activity — this is an actively developed project.' });
  else if (commits.length > 100) insights.push({ type: 'positive', icon: '✅', text: 'Solid commit history showing consistent development effort.' });

  if (daysSinceLastPush > 365) insights.push({ type: 'warning', icon: '⚠️', text: 'Repository has been inactive for over a year.' });
  else if (daysSinceLastPush < 7) insights.push({ type: 'positive', icon: '🔥', text: 'Repository was updated in the last 7 days — very active!' });

  if (contributors.length === 1) insights.push({ type: 'warning', icon: '👤', text: 'Single contributor — bus factor risk. Consider inviting collaborators.' });
  else if (contributors.length > 10) insights.push({ type: 'positive', icon: '👥', text: `Strong contributor base with ${contributors.length} contributors.` });

  const totalIssues = issues.open.length + issues.closed.length;
  if (totalIssues > 0) {
    const resolutionRate = Math.round((issues.closed.length / totalIssues) * 100);
    if (resolutionRate > 70) insights.push({ type: 'positive', icon: '🎯', text: `Excellent issue resolution rate of ${resolutionRate}%.` });
    else if (resolutionRate < 30) insights.push({ type: 'warning', icon: '📋', text: `Low issue resolution rate (${resolutionRate}%) — many issues remain open.` });
  }

  if (!hasReadme) insights.push({ type: 'negative', icon: '📄', text: 'No README found — documentation is critical for open-source projects.' });

  if (repo.stargazers_count > 100) insights.push({ type: 'positive', icon: '⭐', text: `${repo.stargazers_count.toLocaleString()} stars shows strong community interest.` });

  if (score.total >= 75) insights.push({ type: 'positive', icon: '🏆', text: 'Overall project health is excellent. Well-maintained repository!' });
  else if (score.total < 40) insights.push({ type: 'negative', icon: '💡', text: 'Project health score is low — see suggestions below for improvement.' });

  return insights;
};

const generateSuggestions = ({ hasReadme, contents, issues, contributors, commits, repo }) => {
  const suggestions = [];
  const fileNames = contents.map(f => f.name.toLowerCase());
  const daysSinceLastPush = (Date.now() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24);

  if (!hasReadme) suggestions.push({ priority: 'high', icon: '📝', title: 'Add a README', desc: 'A clear README explaining what your project does, how to install, and how to use it.' });
  if (!fileNames.some(f => f.includes('contributing'))) suggestions.push({ priority: 'medium', icon: '🤝', title: 'Add CONTRIBUTING.md', desc: 'Guide contributors on how to submit PRs, coding standards, and development setup.' });
  if (!fileNames.some(f => f.includes('license'))) suggestions.push({ priority: 'high', icon: '⚖️', title: 'Add a LICENSE', desc: "Without a license, others can't legally use your code." });
  if (!fileNames.some(f => f.includes('test') || f.includes('spec') || f.includes('.test'))) suggestions.push({ priority: 'medium', icon: '🧪', title: 'Add Tests', desc: 'Unit and integration tests improve reliability and contributor confidence.' });
  if (!fileNames.some(f => f.includes('github'))) suggestions.push({ priority: 'low', icon: '⚙️', title: 'Add GitHub Actions', desc: 'Automate CI/CD with GitHub Actions for testing and deployment.' });
  if (issues.open.length > 20) suggestions.push({ priority: 'medium', icon: '🏷️', title: 'Triage Open Issues', desc: `${issues.open.length} open issues — add labels, close stale ones, and prioritize bugs.` });
  if (contributors.length < 3) suggestions.push({ priority: 'low', icon: '📢', title: 'Promote Your Project', desc: 'Share on Reddit, Hacker News, Dev.to to attract contributors.' });
  if (daysSinceLastPush > 180) suggestions.push({ priority: 'high', icon: '⚡', title: 'Resume Activity', desc: 'Inactive repos lose visibility. Even small updates help maintain momentum.' });
  if (!fileNames.some(f => f.includes('changelog'))) suggestions.push({ priority: 'low', icon: '📋', title: 'Add a CHANGELOG', desc: 'Document your releases and changes to help users understand version history.' });

  return suggestions.sort((a, b) => ['high','medium','low'].indexOf(a.priority) - ['high','medium','low'].indexOf(b.priority));
};

module.exports = { calculateProductivityScore, generateCommitTimeline, generateContributorActivity, generateInsights, generateSuggestions };
