const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

const getHeaders = () => {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

const ghGet = async (path, params = {}) => {
  const res = await axios.get(`${GITHUB_API}${path}`, {
    headers: getHeaders(),
    params,
  });
  return res.data;
};

const fetchRepoDetails = async (owner, repo) => {
  return await ghGet(`/repos/${owner}/${repo}`);
};

const fetchCommits = async (owner, repo) => {
  const commits = [];
  let page = 1;
  while (page <= 5) {
    try {
      const data = await ghGet(`/repos/${owner}/${repo}/commits`, { per_page: 100, page });
      if (!data.length) break;
      commits.push(...data);
      if (data.length < 100) break;
      page++;
    } catch {
      break;
    }
  }
  return commits;
};

const fetchContributors = async (owner, repo) => {
  try {
    return await ghGet(`/repos/${owner}/${repo}/contributors`, { per_page: 50 });
  } catch {
    return [];
  }
};

const fetchLanguages = async (owner, repo) => {
  return await ghGet(`/repos/${owner}/${repo}/languages`);
};

const fetchIssues = async (owner, repo) => {
  try {
    const [open, closed] = await Promise.all([
      ghGet(`/repos/${owner}/${repo}/issues`, { state: 'open', per_page: 100 }),
      ghGet(`/repos/${owner}/${repo}/issues`, { state: 'closed', per_page: 100 }),
    ]);
    return { open: open.filter(i => !i.pull_request), closed: closed.filter(i => !i.pull_request) };
  } catch {
    return { open: [], closed: [] };
  }
};

const fetchPullRequests = async (owner, repo) => {
  try {
    const [open, closed] = await Promise.all([
      ghGet(`/repos/${owner}/${repo}/pulls`, { state: 'open', per_page: 100 }),
      ghGet(`/repos/${owner}/${repo}/pulls`, { state: 'closed', per_page: 100 }),
    ]);
    return { open, closed };
  } catch {
    return { open: [], closed: [] };
  }
};

const fetchReadme = async (owner, repo) => {
  try {
    await ghGet(`/repos/${owner}/${repo}/readme`);
    return true;
  } catch {
    return false;
  }
};

const fetchContents = async (owner, repo) => {
  try {
    return await ghGet(`/repos/${owner}/${repo}/contents`);
  } catch {
    return [];
  }
};

module.exports = {
  fetchRepoDetails,
  fetchCommits,
  fetchContributors,
  fetchLanguages,
  fetchIssues,
  fetchPullRequests,
  fetchReadme,
  fetchContents,
};
