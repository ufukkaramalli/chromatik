import { Types } from 'mongoose';
import TrackModel from '../model/track.model';
import logger from './logger';

/**
 * Dummy tracks seeded for every newly registered user.
 * All audio files are sourced from Free Music Archive (freemusicarchive.org)
 * or Wikimedia Commons — all CC0 / CC-BY / public domain licensed.
 * Cover art images are sourced from Unsplash (free to use).
 */
const DUMMY_TRACKS = [
  {
    name: 'Chill Acoustic Morning',
    description: 'A laid-back acoustic guitar piece perfect for morning vibes.',
    status: 'public',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    art: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80',
  },
  {
    name: 'Lo-Fi Study Session',
    description: 'Mellow lo-fi beats crafted for deep focus and concentration.',
    status: 'public',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    art: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&q=80',
  },
  {
    name: 'Midnight Jazz Interlude',
    description: 'Smooth jazz improvisation recorded late at night.',
    status: 'public',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    art: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80',
  },
  {
    name: 'Electronic Pulse',
    description: 'Energetic electronic track with punchy synths and driving bass.',
    status: 'public',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    art: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&q=80',
  },
  {
    name: 'Ambient Skyline',
    description: 'Dreamy ambient soundscape inspired by city lights at dusk.',
    status: 'public',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    art: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400&q=80',
  },
  {
    name: 'Tropical House Escape',
    description: 'Feel-good tropical house vibes with warm pads and steel drums.',
    status: 'public',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    art: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80',
  },
  {
    name: 'Cinematic Epic',
    description: 'Grand orchestral piece with sweeping strings and powerful percussion.',
    status: 'public',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    art: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80',
  },
  {
    name: 'Hip-Hop Foundations',
    description: 'Classic boom-bap beat with warm vinyl crackle and crisp snares.',
    status: 'public',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    art: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=400&q=80',
  },
];

/**
 * Seeds a set of royalty-free dummy tracks for a newly created user.
 * Called automatically after user registration.
 */
export async function seedDummyTracksForUser(userId: Types.ObjectId): Promise<void> {
  try {
    const trackDocs = DUMMY_TRACKS.map((track) => ({
      ...track,
      userId,
    }));

    await TrackModel.insertMany(trackDocs);
    logger.info(`Seeded ${trackDocs.length} dummy tracks for new user ${userId}.`);
  } catch (error) {
    // Non-critical — log the error but don't block registration
    logger.error(`Failed to seed dummy tracks for user ${userId}: ${error}`);
  }
}
