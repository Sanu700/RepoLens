const axios = require('axios');
const GITHUB_API = 'https://api.github.com';

const getHeaders = () => {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  return headers;
};
const ghGet = async (path, params = {}) => {
  const res = await axios.get(`${GITHUB_API}${path}`, { headers: getHeaders(), params });
  return res.data;
};

const fetchUser = async (username) => ghGet(`/users/${username}`);

const fetchRepos = async (username) => {
  const repos = [];
  let page = 1;
  while (page <= 3) {
    const data = await ghGet(`/users/${username}/repos`, { per_page: 100, page, sort: 'updated' });
    if (!data.length) break;
    repos.push(...data);
    if (data.length < 100) break;
    page++;
  }
  return repos;
};

const fetchEvents = async (username) => {
  try {
    return await ghGet(`/users/${username}/events/public`, { per_page: 100 });
  } catch { return []; }
};

const fetchCommitsForRepo = async (username, repo, since) => {
  try {
    return await ghGet(`/repos/${username}/${repo}/commits`, {
      author: username, per_page: 100, since
    });
  } catch { return []; }
};

module.exports = { fetchUser, fetchRepos, fetchEvents, fetchCommitsForRepo };
