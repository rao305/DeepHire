import { Octokit } from "octokit";
import type { ExtractedClaim } from "@/types";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export interface GitHubProfile {
  username: string;
  displayName: string;
  bio: string;
  publicRepoCount: number;
  followers: number;
  topLanguages: string[];
  profileUrl: string;
}

export interface Repository {
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  languages: Record<string, number>;
  topics: string[];
  stars: number;
  forks: number;
  isForked: boolean;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  userCommitCount?: number;
  hasReadme: boolean;
  readmeUrl: string;
  size: number;
  hasDeploymentFiles: boolean;
}

export interface CommitActivity {
  totalCommits: number;
  userCommits: number;
  firstCommit: string;
  lastCommit: string;
  isActiveContributor: boolean;
  isPrimaryAuthor: boolean;
}

interface LegacyAgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface LegacyGithubAnalysis {
  username: string;
  repos: Array<{
    name: string;
    url: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    topics: string[];
    lastUpdated: Date;
    commits: number;
  }>;
  contributions: [];
  languages: Record<string, number>;
  totalCommits: number;
  totalPRs: number;
  accountAge: number;
}

type GitHubResponse<T> = {
  data: T;
  headers: Record<string, string | number | undefined>;
};

const DEPLOYMENT_PATHS = [
  "Dockerfile",
  "docker-compose.yml",
  "vercel.json",
  "netlify.toml",
  ".github/workflows",
] as const;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class GitHubAPIAgent {
  async execute(githubUrl: string): Promise<LegacyAgentResult<LegacyGithubAnalysis>> {
    try {
      const username = await this.extractUsernameFromUrl(githubUrl);
      if (!username) {
        return {
          success: false,
          error: "Invalid GitHub URL",
        };
      }

      const repositories = await this.getUserRepositories(username);
      const commitActivities = await Promise.all(
        repositories.map((repo) =>
          this.analyzeCommitActivity(username, repo.name).catch(() => null)
        )
      );
      const languages = this.aggregateLanguages(repositories);
      const oldestRepoCreatedAt = repositories
        .map((repo) => repo.createdAt)
        .filter(Boolean)
        .sort()[0];

      return {
        success: true,
        data: {
          username,
          repos: repositories.map((repo, index) => ({
            name: repo.name,
            url: repo.url,
            description: repo.description ?? "",
            stars: repo.stars,
            forks: repo.forks,
            language: repo.language ?? "Unknown",
            topics: repo.topics,
            lastUpdated: new Date(repo.updatedAt),
            commits: commitActivities[index]?.totalCommits ?? 0,
          })),
          contributions: [],
          languages,
          totalCommits: commitActivities.reduce(
            (sum, activity) => sum + (activity?.totalCommits ?? 0),
            0
          ),
          totalPRs: 0,
          accountAge: oldestRepoCreatedAt
            ? Math.floor(
                (Date.now() - new Date(oldestRepoCreatedAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getUserProfile(username: string): Promise<GitHubProfile> {
    try {
      const userResponse = await this.requestWithRateLimit(() =>
        octokit.rest.users.getByUsername({ username })
      );
      const repositories = await this.getUserRepositories(username);
      const languageTotals = this.aggregateLanguages(repositories);

      return {
        username: userResponse.data.login,
        displayName: userResponse.data.name ?? "",
        bio: userResponse.data.bio ?? "",
        publicRepoCount: userResponse.data.public_repos,
        followers: userResponse.data.followers,
        topLanguages: Object.entries(languageTotals)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([language]) => language),
        profileUrl: userResponse.data.html_url,
      };
    } catch (error) {
      if (this.isGitHubStatus(error, 404)) {
        throw new Error(`GitHub user ${username} not found`);
      }

      throw error;
    }
  }

  async getUserRepositories(username: string): Promise<Repository[]> {
    const repos = await this.paginateWithRateLimit((page) =>
      octokit.rest.repos.listForUser({
        username,
        per_page: 100,
        page,
        type: "owner",
        sort: "updated",
      })
    );

    return Promise.all(
      repos.map(async (repo) => {
        const [languages, readme, hasDeploymentFiles] = await Promise.all([
          this.getRepositoryLanguages(username, repo.name),
          this.getRepositoryReadmeMetadata(username, repo.name),
          this.hasDeploymentFiles(username, repo.name),
        ]);

        return {
          name: repo.name,
          fullName: repo.full_name,
          url: repo.html_url,
          description: repo.description,
          language: repo.language ?? null,
          languages,
          topics: repo.topics ?? [],
          stars: repo.stargazers_count ?? 0,
          forks: repo.forks_count ?? 0,
          isForked: repo.fork ?? false,
          defaultBranch: repo.default_branch ?? "",
          createdAt: repo.created_at ?? "",
          updatedAt: repo.updated_at ?? "",
          hasReadme: readme !== null,
          readmeUrl: readme?.htmlUrl ?? "",
          size: repo.size ?? 0,
          hasDeploymentFiles,
        };
      })
    );
  }

  async findReposForClaim(
    username: string,
    claim: ExtractedClaim
  ): Promise<Repository[]> {
    const repositories = await this.getUserRepositories(username);
    const keywords = claim.keywords.map((keyword) => keyword.toLowerCase());

    return repositories
      .map((repo) => ({
        repo,
        score: this.scoreRepositoryForKeywords(repo, keywords),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ repo }) => repo);
  }

  async analyzeCommitActivity(
    username: string,
    repoName: string
  ): Promise<CommitActivity> {
    const commits = await this.paginateWithRateLimit((page) =>
      octokit.rest.repos.listCommits({
        owner: username,
        repo: repoName,
        per_page: 100,
        page,
      })
    );

    const userCommits = commits.filter((commit) => {
      const authorLogin = commit.author?.login?.toLowerCase();
      const committerLogin = commit.committer?.login?.toLowerCase();
      const normalizedUsername = username.toLowerCase();

      return (
        authorLogin === normalizedUsername || committerLogin === normalizedUsername
      );
    }).length;

    const dates = commits
      .map((commit) => commit.commit.author?.date ?? commit.commit.committer?.date)
      .filter((date): date is string => Boolean(date))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const totalCommits = commits.length;
    const contributionRatio = totalCommits === 0 ? 0 : userCommits / totalCommits;

    return {
      totalCommits,
      userCommits,
      firstCommit: dates[0] ?? "",
      lastCommit: dates[dates.length - 1] ?? "",
      isActiveContributor: contributionRatio > 0.2,
      isPrimaryAuthor: contributionRatio > 0.5,
    };
  }

  async getRepositoryReadme(
    username: string,
    repoName: string
  ): Promise<string | null> {
    try {
      const response = await this.requestWithRateLimit(() =>
        octokit.rest.repos.getReadme({
          owner: username,
          repo: repoName,
        })
      );

      if (!("content" in response.data) || !response.data.content) {
        return null;
      }

      return Buffer.from(response.data.content, "base64").toString("utf8");
    } catch (error) {
      if (this.isGitHubStatus(error, 404)) {
        return null;
      }

      throw error;
    }
  }

  async extractUsernameFromUrl(url: string): Promise<string | null> {
    const normalizedUrl = url.trim();
    const match = normalizedUrl.match(
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)(?:[/?#].*)?$/
    );

    return match?.[1] ?? null;
  }

  private async getRepositoryLanguages(
    username: string,
    repoName: string
  ): Promise<Record<string, number>> {
    const response = await this.requestWithRateLimit(() =>
      octokit.rest.repos.listLanguages({
        owner: username,
        repo: repoName,
      })
    );

    return response.data;
  }

  private async getRepositoryReadmeMetadata(
    username: string,
    repoName: string
  ): Promise<{ htmlUrl: string } | null> {
    try {
      const response = await this.requestWithRateLimit(() =>
        octokit.rest.repos.getReadme({
          owner: username,
          repo: repoName,
        })
      );

      return { htmlUrl: response.data.html_url ?? "" };
    } catch (error) {
      if (this.isGitHubStatus(error, 404)) {
        return null;
      }

      throw error;
    }
  }

  private async hasDeploymentFiles(
    username: string,
    repoName: string
  ): Promise<boolean> {
    const checks = await Promise.all(
      DEPLOYMENT_PATHS.map((path) => this.pathExists(username, repoName, path))
    );

    return checks.some(Boolean);
  }

  private async pathExists(
    username: string,
    repoName: string,
    path: string
  ): Promise<boolean> {
    try {
      await this.requestWithRateLimit(() =>
        octokit.rest.repos.getContent({
          owner: username,
          repo: repoName,
          path,
        })
      );

      return true;
    } catch (error) {
      if (this.isGitHubStatus(error, 404)) {
        return false;
      }

      throw error;
    }
  }

  private scoreRepositoryForKeywords(
    repo: Repository,
    keywords: string[]
  ): number {
    const searchableName = repo.name.toLowerCase();
    const searchableDescription = repo.description?.toLowerCase() ?? "";
    const searchableLanguage = repo.language?.toLowerCase() ?? "";
    const searchableTopics = repo.topics.map((topic) => topic.toLowerCase());

    return keywords.reduce((score, keyword) => {
      let keywordScore = 0;

      if (searchableLanguage === keyword) keywordScore += 5;
      if (searchableTopics.includes(keyword)) keywordScore += 4;
      if (searchableName.includes(keyword)) keywordScore += 3;
      if (searchableDescription.includes(keyword)) keywordScore += 2;

      return score + keywordScore;
    }, 0);
  }

  private aggregateLanguages(
    repositories: Repository[]
  ): Record<string, number> {
    return repositories.reduce<Record<string, number>>((totals, repo) => {
      for (const [language, bytes] of Object.entries(repo.languages)) {
        totals[language] = (totals[language] ?? 0) + bytes;
      }

      return totals;
    }, {});
  }

  private async paginateWithRateLimit<T>(
    requestPage: (page: number) => Promise<GitHubResponse<T[]>>
  ): Promise<T[]> {
    const results: T[] = [];
    let page = 1;

    while (true) {
      const response = await this.requestWithRateLimit(() => requestPage(page));
      results.push(...response.data);

      if (response.data.length < 100) {
        return results;
      }

      page += 1;
    }
  }

  private async requestWithRateLimit<T>(
    request: () => Promise<GitHubResponse<T>>,
    retries = 3
  ): Promise<GitHubResponse<T>> {
    try {
      const response = await request();
      await this.waitIfRateLimitLow(response.headers);
      return response;
    } catch (error) {
      if (retries > 0 && (this.isGitHubStatus(error, 403) || this.isGitHubStatus(error, 429))) {
        await this.waitIfRateLimitLow(this.getErrorHeaders(error));
        return this.requestWithRateLimit(request, retries - 1);
      }

      throw error;
    }
  }

  private async waitIfRateLimitLow(
    headers: Record<string, string | number | undefined>
  ): Promise<void> {
    const remaining = Number(headers["x-ratelimit-remaining"]);

    if (Number.isNaN(remaining) || remaining >= 10) {
      return;
    }

    const resetSeconds = Number(headers["x-ratelimit-reset"]);
    if (Number.isNaN(resetSeconds)) {
      return;
    }

    const waitMs = Math.max(resetSeconds * 1000 + 1000 - Date.now(), 0);
    await sleep(waitMs);
  }

  private getErrorHeaders(
    error: unknown
  ): Record<string, string | number | undefined> {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "headers" in error.response
    ) {
      return error.response.headers as Record<string, string | number | undefined>;
    }

    return {};
  }

  private isGitHubStatus(error: unknown, status: number): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === status
    );
  }
}

export const githubAPIAgent = new GitHubAPIAgent();

export { GitHubAPIAgent as GithubAPIAgent };
