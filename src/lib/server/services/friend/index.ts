import { Context, Effect } from 'effect'
import { getFriends, proccessRequest, requestFriend } from './functions'

export class FriendService extends Context.Tag('FriendService')<
  FriendService,
  {
    readonly getFriends: typeof getFriends
    readonly requestFriend: typeof requestFriend
    readonly proccessRequest: typeof proccessRequest
  }
>() {}

export const friendService = FriendService.of({
  getFriends,
  requestFriend,
  proccessRequest,
})

export const friendServiceProvider = Effect.provideService(
  FriendService,
  friendService
)
