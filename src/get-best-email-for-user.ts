import { validate as validateEmail } from 'email-validator'
import leven from 'leven'

import * as types from './types'

export function getBestEmailForUser(
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
      validateEmail(email) &&
      !e.includes('noreply') &&
      !e.includes('[bot]') &&
      !e.includes('snyk-bot') &&
      !e.includes('example.com') &&
      !e.endsWith('.internal') &&
      !e.endsWith('.local')
    )
  })

  const email = computeBestEmailForUser(user, validEmails)
  if (email) {
    return email
  }

  return null
}

function computeBestEmailForUser(user: types.User, emails: string[]) {
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
  console.warn(
    `warn: found multiple emails for user "${user.login}":`,
    Object.fromEntries(emails.map((e) => [e, emailToScore[e]]))
  )

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

  // deboost weight of shorter strings
  const l = Math.min(Math.max(0, b.length - 2), 6 - 2) / (6 - 2)
  const lScale = 0.1 * (1.0 - l) + 1.0 * l

  // boost exact matches and exact prefix / suffix matches
  const w = editDistance === 0 ? 5 : a.startsWith(b) || a.endsWith(b) ? 2.5 : 1

  return w * lScale * (1.0 - editDistance / a.length)
}
