import type { Octokit } from 'octokit'
import pMap from 'p-map'

import * as github from './github'
import * as types from './types'
import { inferUserEmail } from './infer-user-email'

export async function resolveAllStargazersForRepo(
  repo: types.Repo,
  octokit: Octokit
) {
  const stars = await github.getAllStargazers(repo, octokit)
  const starredUsernames = stars.map((star) => star.login)
  // console.log(JSON.stringify(stars, null, 2))

  // 157 / 390 have public emails (40%)
  // 106 / 233 get emails by inferring from commits (45%)
  // 24 / 129 get emails by inferring from npm (19%)
  // => 73% email addresses resolved
  const users = (
    await pMap(
      starredUsernames,
      async (username) => {
        try {
          console.warn(`getUser(${username})`)
          const user = await github.getUser(username, octokit)
          if (!user.email) {
            user.email = await inferUserEmail(user, octokit)
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

  return users
}
