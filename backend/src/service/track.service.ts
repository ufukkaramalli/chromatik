import TrackModel from '.././model/track.model';
import UserModel from '.././model/user.model';
import ITrack from '.././interfaces/track.interface';

class TrackService {
    private track = TrackModel;

    /**
     * Create a new Track
     */
    public async create(data: Partial<ITrack>): Promise<ITrack>{
        try {
            const track = await this.track.create(data)
            return track
        } catch (error) {
            console.error(error);
            throw new Error('Unable to create track')
        }
    }

    /**
     * Find by ID
     */
    public async findById(id: string): Promise<ITrack | null> {
        return this.track.findById(id).lean();
    }

    /**
     * Delete track
     */
    public async delete(id: string): Promise<void> {
        await this.track.findByIdAndDelete(id);
    }

    /**
     * Get tracks for a specific user dashboard
     */
    public async getDashboardTracks(userId: string): Promise<ITrack[]> {
        return this.track
            .find({ userId })
            .sort({ createdAt: -1 })
            .lean();
    }

    /**
     * Increment view/play count for a track
     */
    public async playIncrease(id: string, userId?: string): Promise<void> {
        const query: any = { _id: id };
        if (userId) {
            query.user = { $ne: userId };
        }
        await this.track.findOneAndUpdate(query, { $inc: { views: 1 } })
    }

    /**
     * Toggle like status for a track
     */
    public async toggleLike(id: string, userId: string): Promise<any> {
        const track = await this.track.findById(id);
        if (!track) throw new Error('Track not found');

        // Prevent liking own track
        if (track.userId.toString() === userId) {
            throw new Error('You cannot like your own track');
        }

        const likedBy = track.likedBy || [];
        const index = likedBy.findIndex(u => u.toString() === userId);
        
        let isLiked = false;
        if (index === -1) {
            likedBy.push(userId as any);
            isLiked = true;
        } else {
            likedBy.splice(index, 1);
        }

        track.likedBy = likedBy;
        track.likes = likedBy.length;
        await track.save();
        
        return { isLiked, likes: track.likes };
    }


    /**
     * Get recent tracks (last 24 hours, public only)
     */
    public async getRecent(): Promise<ITrack[]> {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return this.track
            .find({ status: 'public', createdAt: { $gte: oneDayAgo } })
            .sort({ createdAt: -1 })
            .limit(12)
            .populate('userId', 'name slug photoUrl')
            .lean();
    }

    /**
     * Get most liked tracks (all time, public only)
     */
    public async getMostLiked(): Promise<ITrack[]> {
        return this.track
            .find({ status: 'public' })
            .sort({ likes: -1 })
            .limit(12)
            .populate('userId', 'name slug photoUrl')
            .lean();
    }

    /**
     * Get most streamed/viewed tracks (all time, public only)
     */
    public async getMostStreamed(): Promise<ITrack[]> {
        return this.track
            .find({ status: 'public' })
            .sort({ views: -1 })
            .limit(12)
            .populate('userId', 'name slug photoUrl')
            .lean();
    }

    /**
     * Find a single track by user slug and track name/slug
     */
    public async findTrackBySlug(userSlug: string, trackSlug: string): Promise<ITrack | null> {
        // First find the user
        const User = await this.track.db.model('User').findOne({ slug: userSlug });
        if (!User) return null;

        // Then find the track by user and name (or slug)
        return this.track
            .findOne({ userId: User._id, $or: [{ name: trackSlug }, { slug: trackSlug }] })
            .populate('userId', 'name slug photoUrl profileTheme')
            .lean();
    }

    /**
     * Get platform statistics (producer and track counts)
     */
    public async getStats(): Promise<{ producersCount: number; tracksCount: number }> {
        const [producersCount, tracksCount] = await Promise.all([
            UserModel.countDocuments({
                $or: [
                    { role: { $in: ['producer', 'admin'] } },
                    { role: { $exists: false } },
                    { role: null }
                ]
            }),
            this.track.countDocuments({ status: { $ne: 'draft' } })
        ]);

        return {
            producersCount,
            tracksCount
        };
    }
}

export default TrackService;