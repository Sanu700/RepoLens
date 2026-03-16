const parseGitHubUrl = (url) => {
  try {
    const cleaned = url.trim().replace(/\.git$/, '');
    const match = cleaned.match(/github\.com[/:]([^/]+)\/([^/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
};

module.exports = { parseGitHubUrl };
