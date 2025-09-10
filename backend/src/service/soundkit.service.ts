import SoundkitModel from '.././model/soundkit.model';
import ISoundkit from '.././interfaces/soundkit.interface';
import { Types } from 'mongoose';

class SoundkitService {
  private soundkit = SoundkitModel;

  /**
   * Create a new Soundkit
   */
  public async create(
    title: string,
    description: string,
    thumbnailUrl: string,
    url: string,
    userId: Types.ObjectId
  ): Promise<ISoundkit> {
    try {
      const soundkit = await this.soundkit.create({ title, description, thumbnailUrl, url, userId });
      return soundkit;
    } catch (error) {
      throw new Error('Unable to create soundkit');
    }
  }

  /**
   * Get all soundkits (with user relation)
   */
  public async getAll(): Promise<ISoundkit[]> {
    return this.soundkit.find().populate('userId', 'name email');
  }

  /**
   * Get a soundkit by ID (with user relation)
   */
  public async getById(id: string): Promise<ISoundkit | null> {
    return this.soundkit.findById(id).populate('userId', 'name email');
  }

  /**
   * Update a Soundkit
   */
  public async update(
    id: string,
    updateData: Partial<ISoundkit>
  ): Promise<ISoundkit | null> {
    try {
      return await this.soundkit.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      throw new Error('Unable to update soundkit');
    }
  }

  /**
   * Delete a Soundkit
   */
  public async delete(id: string, userId: Types.ObjectId): Promise<ISoundkit | null> {
    try {
      return await this.soundkit.findOneAndDelete({ _id: id, userId });
    } catch (error) {
      throw new Error('Unable to delete soundkit');
    }
  }
}

export default SoundkitService;