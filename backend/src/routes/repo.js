const express = require('express');
const router = express.Router();
const { parseGitHubUrl } = require('../utils/parseUrl');
const gh = require('../services/github');
const {
  calculateProductivityScore,
  generateCommitTimeline,
  generateContributorActivity,
  generateInsights,
  generateSuggestions,
} = require('../services/analytics');

router.post('/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Repository URL is required' });

  const parsed = parseGitHubUrl(url);
  if (!parsed) return res.status(400).json({ error: 'Invalid GitHub URL. Example: https://github.com/owner/repo' });

  const { owner, repo } = parsed;

  try {
    const [repoDetails, commits, contributors, languages, issues, prs, hasReadme, contents] = await Promise.all([
      gh.fetchRepoDetails(owner, repo),
      gh.fetchCommits(owner, repo),
      gh.fetchContributors(owner, repo),
      gh.fetchLanguages(owner, repo),
      gh.fetchIssues(owner, repo),
      gh.fetchPullRequests(owner, repo),
      gh.fetchReadme(owner, repo),
      gh.fetchContents(owner, repo),
    ]);

    const score = calculateProductivityScore({ repo: repoDetails, commits, contributors, issues, prs, hasReadme, contents });
    const commitTimeline = generateCommitTimeline(commits);
    const contributorActivity = generateContributorActivity(contributors);
    const insights = generateInsights({ repo: repoDetails, commits, contributors, issues, prs, hasReadme, score });
    const suggestions = generateSuggestions({ hasReadme, contents, issues, contributors, commits, repo: repoDetails });

    // Language chart data
    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
    const languageData = Object.entries(languages).map(([name, bytes]) => ({
      name,
      percentage: Math.round((bytes / totalBytes) * 100),
      bytes,
    })).sort((a, b) => b.bytes - a.bytes).slice(0, 8);

    res.json({
      overview: {
        name: repoDetails.name,
        fullName: repoDetails.full_name,
        description: repoDetails.description,
        stars: repoDetails.stargazers_count,
        forks: repoDetails.forks_count,
        watchers: repoDetails.watchers_count,
        openIssues: repoDetails.open_issues_count,
        primaryLanguage: repoDetails.language,
        totalCommits: commits.length,
        contributors: contributors.length,
        lastUpdated: repoDetails.pushed_at,
        createdAt: repoDetails.created_at,
        license: repoDetails.license?.name || null,
        topics: repoDetails.topics || [],
        isPrivate: repoDetails.private,
        defaultBranch: repoDetails.default_branch,
        hasReadme,
        url: repoDetails.html_url,
        avatarUrl: repoDetails.owner?.avatar_url,
        ownerType: repoDetails.owner?.type,
      },
      score,
      analytics: {
        commitTimeline,
        languageData,
        contributorActivity,
        issueStats: {
          open: issues.open.length,
          closed: issues.closed.length,
          resolutionRate: issues.open.length + issues.closed.length > 0
            ? Math.round((issues.closed.length / (issues.open.length + issues.closed.length)) * 100)
            : 0,
        },
        prStats: {
          open: prs.open.length,
          closed: prs.closed.length,
        },
      },
      insights,
      suggestions,
    });
  } catch (err) {
    if (err.response?.status === 404) return res.status(404).json({ error: 'Repository not found. Make sure the URL is correct and the repo is public.' });
    if (err.response?.status === 403) return res.status(403).json({ error: 'GitHub API rate limit exceeded. Try again in a few minutes or add a GitHub token.' });
    if (err.response?.status === 401) return res.status(401).json({ error: 'GitHub token is invalid or expired. Check your GITHUB_TOKEN environment variable.' });
    console.error('Repo analyze error:', err.response?.status, err.message);
    res.status(500).json({ error: 'Failed to analyze repository. Please try again.' });
  }
});

module.exports = router;
