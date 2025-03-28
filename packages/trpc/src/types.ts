import { RouterOutputs } from './root'

// Comment from a single discussion
export type RouterCommentItem =
  RouterOutputs['comment']['createDiscussion']['comments'][0]

// Single discussion from createDiscussion endpoint
export type RouterDiscussionItem =
  RouterOutputs['comment']['createDiscussion']

// Single discussion from discussions endpoint
export type RouterDiscussionsListItem = 
  RouterOutputs['comment']['discussions']['discussions'][0]

// Comments from discussions list
export type RouterDiscussionsListCommentItem =
  RouterOutputs['comment']['discussions']['discussions'][0]['comments'][0]

export type RouterDocumentVersionItem =
  RouterOutputs['version']['documentVersions']['versions'][0]
