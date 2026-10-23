export interface CommentUser {
  _id: string
  name: string
  slug?: string
  photoUrl?: string
  role?: string
}

export interface CommentItemData {
  _id: string
  targetType: 'track' | 'soundkit'
  targetId: string
  userId?: CommentUser | any
  content: string
  audioTimestamp?: number | null
  createdAt?: string
  updatedAt?: string
}
