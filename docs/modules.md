## Interfaces

- [CommitAuthor](interfaces/CommitAuthor.md)
- [Repo](interfaces/Repo.md)
- [User](interfaces/User.md)
- [UserLite](interfaces/UserLite.md)

## Functions

### getAllStargazers

▸ **getAllStargazers**(`repo`, `octokit`, `opts?`): `Promise`<[`UserLite`](interfaces/UserLite.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `repo` | [`Repo`](interfaces/Repo.md) |
| `octokit` | `Octokit` & {} & `Api` & {} |
| `opts` | `Object` |
| `opts.pageSize?` | `number` |

#### Returns

`Promise`<[`UserLite`](interfaces/UserLite.md)[]\>

#### Defined in

[src/github.ts:72](https://github.com/transitive-bullshit/github-scraper/blob/3209f4e/src/github.ts#L72)

___

### getBestEmailForUser

▸ **getBestEmailForUser**(`user`, `emails`): `string` \| ``null``

#### Parameters

| Name | Type |
| :------ | :------ |
| `user` | [`User`](interfaces/User.md) |
| `emails` | `string`[] |

#### Returns

`string` \| ``null``

#### Defined in

[src/get-best-email-for-user.ts:6](https://github.com/transitive-bullshit/github-scraper/blob/3209f4e/src/get-best-email-for-user.ts#L6)

___

### getRecentCommitsByUserForRepo

▸ **getRecentCommitsByUserForRepo**(`author`, `repo`, `octokit`, `opts?`): `Promise`<{}[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `author` | `string` |
| `repo` | [`Repo`](interfaces/Repo.md) |
| `octokit` | `Octokit` & {} & `Api` & {} |
| `opts` | `Object` |
| `opts.pageSize?` | `number` |

#### Returns

`Promise`<{}[]\>

#### Defined in

[src/github.ts:34](https://github.com/transitive-bullshit/github-scraper/blob/3209f4e/src/github.ts#L34)

___

### getRecentUpdatedReposOwnedByUser

▸ **getRecentUpdatedReposOwnedByUser**(`username`, `octokit`, `opts?`): `Promise`<{}[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `username` | `string` |
| `octokit` | `Octokit` & {} & `Api` & {} |
| `opts` | `Object` |
| `opts.pageSize?` | `number` |

#### Returns

`Promise`<{}[]\>

#### Defined in

[src/github.ts:19](https://github.com/transitive-bullshit/github-scraper/blob/3209f4e/src/github.ts#L19)

___

### getUser

▸ **getUser**(`username`, `octokit`): `Promise`<[`User`](interfaces/User.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `username` | `string` |
| `octokit` | `Octokit` & {} & `Api` & {} |

#### Returns

`Promise`<[`User`](interfaces/User.md)\>

#### Defined in

[src/github.ts:50](https://github.com/transitive-bullshit/github-scraper/blob/3209f4e/src/github.ts#L50)

___

### getUserEvents

▸ **getUserEvents**(`username`, `octokit`, `opts?`): `Promise`<{}[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `username` | `string` |
| `octokit` | `Octokit` & {} & `Api` & {} |
| `opts` | `Object` |
| `opts.pageSize?` | `number` |

#### Returns

`Promise`<{}[]\>

#### Defined in

[src/github.ts:6](https://github.com/transitive-bullshit/github-scraper/blob/3209f4e/src/github.ts#L6)

___

### inferUserEmail

▸ **inferUserEmail**(`user`, `octokit`): `Promise`<`string` \| ``null``\>

Based off of https://github.com/paulirish/github-email

#### Parameters

| Name | Type |
| :------ | :------ |
| `user` | [`User`](interfaces/User.md) |
| `octokit` | `Octokit` & {} & `Api` & {} |

#### Returns

`Promise`<`string` \| ``null``\>

#### Defined in

[src/infer-user-email.ts:11](https://github.com/transitive-bullshit/github-scraper/blob/3209f4e/src/infer-user-email.ts#L11)

___

### resolveAllStargazersForRepo

▸ **resolveAllStargazersForRepo**(`repo`, `octokit`): `Promise`<[`User`](interfaces/User.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `repo` | [`Repo`](interfaces/Repo.md) |
| `octokit` | `Octokit` & {} & `Api` & {} |

#### Returns

`Promise`<[`User`](interfaces/User.md)[]\>

#### Defined in

[src/resolve-all-stargazers-for-repo.ts:8](https://github.com/transitive-bullshit/github-scraper/blob/3209f4e/src/resolve-all-stargazers-for-repo.ts#L8)
