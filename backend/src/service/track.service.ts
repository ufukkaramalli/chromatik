import TrackModel from '@/model/track.model';
import ITrack from '@/interfaces/track.interface'

class TrackService {
    private track = TrackModel;

    /**
     * Create a new Track
     */
    public async create(name:string, description:string, art:string,status:string,url:string, userId:string): Promise<ITrack>{
        try {
            const track = await this.track.create({ name, description, art, status, url})
            return track
        } catch (error) {
            throw new Error('Unable to create track')
        }
    }
}

export default TrackService;