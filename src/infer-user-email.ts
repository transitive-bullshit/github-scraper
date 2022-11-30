import npmEmail from 'npm-email'
import type { Octokit } from 'octokit'

import * as github from './github'
import * as types from './types'
import { getBestEmailForUser } from './get-best-email-for-user'

/**
 * Based off of https://github.com/paulirish/github-email
 */
export async function inferUserEmail(
  user: types.User,
  octokit: Octokit
): Promise<string | null> {
  const username = user.login

  try {
    // try extracting user's email from recent git push events
    const events = await github.getUserEvents(username, octokit)
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

    const email = getBestEmailForUser(user, emails)
    if (email) return email
  } catch (err) {
    // TODO: ignore for now
  }

  try {
    // try extracting user's email from recent commits
    const repos = await github.getRecentUpdatedReposOwnedByUser(
      username,
      octokit,
      {
        pageSize: 1
      }
    )
    const repo = repos[0]

    if (repo) {
      const recentCommits = await github.getRecentCommitsByUserForRepo(
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

      const email = getBestEmailForUser(user, emails)
      if (email) return email
    }
  } catch (err) {
    // TODO: ignore for now
  }

  try {
    const email = await npmEmail(username)
    console.warn('npm', username, email)
    if (email) return email

    const usernameL = user.login?.toLowerCase()
    if (username !== usernameL) {
      const email = await npmEmail(usernameL)
      console.warn('npm', usernameL, email)
      if (email) return email
    }
  } catch (err) {
    // TODO: ignore for now
  }

  return null
}
