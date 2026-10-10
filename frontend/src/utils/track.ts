/** Resolve a track's id regardless of whether the payload uses `id` or Mongo `_id` */
export function getTrackId(track?: { id?: string; _id?: string } | null): string | undefined {
  return track?.id || track?._id || undefined
}
