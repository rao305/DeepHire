import { Octokit } from 'octokit';

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function getGithubUser(username: string) {
  try {
    const { data } = await octokit.rest.users.getByUsername({ username });
    return data;
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    return null;
  }
}

export async function getUserRepositories(username: string) {
  try {
    const { data } = await octokit.rest.repos.listForUser({
      username,
      sort: 'updated',
      per_page: 100,
    });
    return data;
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return [];
  }
}

export async function getRepositoryCommits(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 100,
    });
    return data;
  } catch (error) {
    console.error('Error fetching repository commits:', error);
    return [];
  }
}

export async function getUserPullRequests(username: string) {
  try {
    const query = `author:${username} type:pr`;
    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q: query,
      sort: 'created',
      order: 'desc',
      per_page: 100,
    });
    return data.items;
  } catch (error) {
    console.error('Error fetching user pull requests:', error);
    return [];
  }
}

export async function getRepositoryLanguages(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.listLanguages({ owner, repo });
    return data;
  } catch (error) {
    console.error('Error fetching repository languages:', error);
    return {};
  }
}

export async function getFileContent(
  owner: string,
  repo: string,
  path: string
) {
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
    if ('content' in data) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch (error) {
    console.error('Error fetching file content:', error);
    return null;
  }
}
