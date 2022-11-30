import dotenv from 'dotenv-safe'
import { validate as validateEmail } from 'email-validator'
import leven from 'leven'
import { Octokit } from 'octokit'
import pMap from 'p-map'

import * as types from './types'
import * as utils from './utils'

dotenv.config()

interface Repo {
  owner: string
  repo: string
}

async function main() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN
  })

  const repo: Repo = {
    owner: 'tastejs',
    repo: 'next-movies'
  }
  const stars = await getAllStargazers(repo, octokit)
  const starredUsernames = stars.map((star) => star.login)
  // console.log(JSON.stringify(stars, null, 2))

  // 157 / 390 have public emails...
  // 263 / 390 have emails this way...
  const users = (
    await pMap(
      starredUsernames,
      async (username) => {
        if (!username) return null

        try {
          console.warn(`getUser(${username})`)
          const user = await getUser(username, octokit)
          if (!user.email) {
            user.email = await getUserEmailFromRecentCommits(user, octokit)
          }
          return user
        } catch (err) {
          console.warn(`github error getUser(${username})`, err.toString())
          return null
        }
      },
      {
        concurrency: 16
      }
    )
  ).filter(Boolean)

  console.log(JSON.stringify(users, null, 2))
}

/**
 * @see https://github.com/paulirish/github-email
 */
async function getUserEmailFromRecentCommits(
  user: types.User,
  octokit: Octokit
): Promise<string | null> {
  const username = user.login

  try {
    // try extracting user's email from recent git push events
    const events = await getUserEvents(username, octokit)
    const pushEvents = events.filter(
      (event) =>
        event.type === 'PushEvent' &&
        event.actor.login === username &&
        event.public
    )

    const emails = pushEvents.flatMap((event) =>
      (event.payload as any).commits
        ?.map((commit) => commit.author?.email)
        .filter(Boolean)
    )

    const email = getBestValidEmailForUser(user, emails)
    if (email) return email
  } catch (err) {
    // TODO: ignore for now
  }

  try {
    // try extracting user's email from recent commits
    const repos = await getRecentUpdatedReposOwnedByUser(username, octokit, {
      pageSize: 1
    })
    const repo = repos[0]

    if (repo) {
      const recentCommits = await getRecentCommitsByUserForRepo(
        username,
        {
          owner: repo.full_name.split('/')[0],
          repo: repo.name
        },
        octokit
      )

      const emails = recentCommits.flatMap((commit) =>
        [commit.author?.email, commit.committer?.email].filter(Boolean)
      )

      const email = getBestValidEmailForUser(user, emails)
      if (email) return email
    }
  } catch (err) {
    // TODO: ignore for now
  }

  return null
}

function getBestValidEmailForUser(
  user: types.User,
  emails: string[]
): string | null {
  const uniqueEmails = Array.from(new Set(emails.filter(Boolean)))

  // examples to filter:
  //   '29139614+renovate[bot]@users.noreply.github.com',
  //   'username@users.noreply.github.com'
  //   'foo@bar.local'
  //   'foo@ip-192-168-1-08.eu-central-1.compute.internal'
  const validEmails = uniqueEmails.filter((email) => {
    const e = email.toLowerCase()
    return (
      validateEmail(e) &&
      !e.includes('noreply') &&
      !e.includes('[bot]') &&
      !e.includes('snyk-bot') &&
      !e.includes('example.com') &&
      !e.endsWith('.internal') &&
      !e.endsWith('.local')
    )
  })

  if (validEmails.length > 1) {
    // TODO: handle multiple emails?
    console.warn(
      `warn: found multiple emails for user "${user.login}":`,
      validEmails
    )
  }

  const email = getBestEmailForUser(user, validEmails)
  if (email) {
    return email
  }

  return null
}

function getBestEmailForUser(user: types.User, emails: string[]) {
  if (emails.length <= 1) {
    return emails[0]
  }

  const knownDomainScores = {
    'gmail.com': 2,
    'icloud.com': 0.5,
    'qq.com': 0.5,
    'outlook.com': 0.1,
    'yahoo.com': 0.1,
    'hotmail.com': 0.1,
    'protonmail.com': -1,
    'protonmail.ch': -1,
    'salesforce.com': -1,
    'aol.com': -1
  }

  const emailToScore: Record<string, number> = {}
  for (const email of emails) {
    let score = 0

    const emailL = email.toLowerCase()
    const [prefix, domain] = emailL.split('@')

    score += computeScoreComparingTwoStrings(prefix, user.login?.toLowerCase())
    score += computeScoreComparingTwoStrings(
      prefix.replace(/[^a-zA-Z0-9]/g, ''),
      user.name?.toLowerCase().replace(/\s/g, '')
    )

    if (/\bbot\b/.test(prefix)) {
      score -= 2
    }

    const knownDomainScore = knownDomainScores[domain]
    if (knownDomainScore) {
      score += knownDomainScore
    }

    emailToScore[email] = score
  }

  emails.sort((a, b) => emailToScore[b] - emailToScore[a])
  console.log(Object.fromEntries(emails.map((e) => [e, emailToScore[e]])))

  return emails[0]
}

function computeScoreComparingTwoStrings(a: string, b: string): number {
  if (!a || !b) {
    return 0
  }

  if (a.length < b.length) {
    const c = a
    a = b
    b = c
  }

  const editDistance = leven(a, b)

  // deboost weight of shorter strings less than 6 characters
  const l = Math.min(Math.max(0, a.length - 2), 6 - 2) / (6 - 2)
  const lScale = 0.1 * (1.0 - l) + 1.0 * l

  // boost exact matches and exact prefixes / exact suffixes
  const w = editDistance === 0 ? 5 : a.startsWith(b) || a.endsWith(b) ? 2.5 : 1

  return w * lScale * (1.0 - editDistance / a.length)
}

async function getUserEvents(
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

async function getRecentUpdatedReposOwnedByUser(
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

async function getRecentCommitsByUserForRepo(
  author: string,
  repo: Repo,
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

async function getUser(
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

async function getAllStargazers(
  repo: Repo,
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

main()
