export interface Repo {
  owner: string
  repo: string
}

export interface UserLite {
  login: string
  id: number
  node_id: string
  url: string
  site_admin: boolean
  avatar_url: string
  gravatar_id: string
}

export interface User extends UserLite {
  html_url?: string
  followers_url?: string
  following_url?: string
  gists_url?: string
  starred_url?: string
  subscriptions_url?: string
  organizations_url?: string
  repos_url?: string
  events_url?: string
  received_events_url?: string
  type: string
  name: string
  company: string
  blog: string
  location: string
  bio: string
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  email?: string
  hireable?: boolean | null
  twitter_username?: string
}

export interface CommitAuthor {
  email?: string
  name?: string
}
