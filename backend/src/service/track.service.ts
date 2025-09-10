import TrackModel from '.././model/track.model';
import ITrack from '.././interfaces/track.interface';

class TrackService {
  private track = TrackModel;

  /**
   * Create a new Track
   */
  public async create(
    name: string,
    description: string,
    art: string,
    status: string,
    url: string,
    userId: string
  ): Promise<ITrack> {
    try {
      const track = await this.track.create({ name, description, art, status, url, userId });
      return track;
    } catch (error) {
      throw new Error('Unable to create track');
    }
  }

  /**
   * Get all tracks
   */
  public async getAll(): Promise<ITrack[]> {
    return this.track.find().populate('userId', 'name email');
  }

  /**
   * Get track by ID
   */
  public async getById(id: string): Promise<ITrack | null> {
    return this.track.findById(id).populate('userId', 'name email');
  }

  /**
   * Update a track
   */
  public async update(id: string, updateData: Partial<ITrack>): Promise<ITrack | null> {
    return this.track.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Delete a track
   */
  public async delete(id: string): Promise<ITrack | null> {
    return this.track.findByIdAndDelete(id);
  }
}

export default TrackService;