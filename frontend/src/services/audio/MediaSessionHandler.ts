import type { Track } from '@/types/audio'

export class MediaSessionHandler {
  public static updateMetadata(track: Track): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: track.user?.name || '',
        artwork: [
          { src: track.art, sizes: '512x512', type: 'image/jpeg' },
          { src: track.art, sizes: '256x256', type: 'image/jpeg' }
        ]
      })
    }
  }
}
