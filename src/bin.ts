// import fs from 'node:fs/promises'
import dotenv from 'dotenv-safe'
import { Octokit } from 'octokit'

import * as types from './types'
import { resolveAllStargazersForRepo } from './resolve-all-stargazers-for-repo'

dotenv.config()

/**
 * CLI for testing functionality.
 */
async function main() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN
  })

  // const usersCache: Record<string, types.User> = JSON.parse(
  //   await fs.readFile('./out/v.json', 'utf-8')
  // ).reduce((m, u) => ({ ...m, [u.login]: u }), {})

  const repo: types.Repo = {
    owner: 'tastejs',
    repo: 'next-movies'
  }

  const users = await resolveAllStargazersForRepo(repo, octokit)
  return users
}

main().then((users) => {
  console.log(JSON.stringify(users, null, 2))
})
