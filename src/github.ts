import type { Octokit } from 'octokit'

import * as types from './types'
import * as utils from './utils'

export async function getUserEvents(
  username: string,
  octokit: Octokit,
  { pageSize = 100 }: { pageSize?: number } = {}
) {
  const res = await octokit.request('GET /users/{username}/events/public', {
    per_page: pageSize,
    username
  })

  return res.data
}

export async function getRecentUpdatedReposOwnedByUser(
  username: string,
  octokit: Octokit,
  { pageSize = 100 }: { pageSize?: number } = {}
) {
  const res = await octokit.request('GET /users/{username}/repos', {
    username,
    per_page: pageSize,
    type: 'owner',
    sort: 'pushed'
  })

  return res.data
}

export async function getRecentCommitsByUserForRepo(
  author: string,
  repo: types.Repo,
  octokit: Octokit,
  { pageSize = 100 }: { pageSize?: number } = {}
) {
  const res = await octokit.request('GET /repos/{owner}/{repo}/commits', {
    owner: repo.owner,
    repo: repo.repo,
    per_page: pageSize,
    author
  })

  return res.data
}

export async function getUser(
  username: string,
  octokit: Octokit
): Promise<types.User> {
  const res = await octokit.request('GET /users/{username}', { username })
  return utils.omit<types.User>(
    res.data,
    'html_url',
    'followers_url',
    'following_url',
    'gists_url',
    'starred_url',
    'subscriptions_url',
    'organizations_url',
    'repos_url',
    'organizations_url',
    'repos_url',
    'events_url',
    'received_events_url'
  )
}

export async function getAllStargazers(
  repo: types.Repo,
  octokit: Octokit,
  { pageSize = 100 }: { pageSize?: number } = {}
): Promise<types.UserLite[]> {
  const users = await octokit.paginate(
    octokit.rest.activity.listStargazersForRepo,
    {
      owner: repo.owner,
      repo: repo.repo,
      per_page: pageSize
    }
  )

  return users.map((user: types.UserLite) =>
    utils.pick<types.UserLite>(
      user,
      'login',
      'id',
      'node_id',
      'url',
      'site_admin',
      'avatar_url',
      'gravatar_id'
    )
  )
}
