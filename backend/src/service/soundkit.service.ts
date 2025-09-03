import SoundkitModel from "@/model/soundkit.model";
import ISoundkit from "@/interfaces/soundkit.interface";
import { Types } from "mongoose";
import { IUpdateOne } from "@/interfaces/mongoose.interface";



class SoundkitService {
    private soundkit = SoundkitModel

    /**
     * Create a new Soundkit
     */

    public async create(title:string, description:string, thumbnailUrl:string, url:string, userId:Types.ObjectId): Promise<ISoundkit> {
        try {
            const soundkit = await this.soundkit.create({title, description, thumbnailUrl, url, userId})
            return soundkit
        } catch (error) {
            throw new Error('Unable to create soundkit service')
        }
    }

    public async update(id:string, title:string, description:string, thumbnailUrl:string, url:string, userId:Types.ObjectId): Promise<ISoundkit | IUpdateOne> {
        try {
            const updatedSoundkit = {title: title, _id: id, description: description, thumbnailUrl:thumbnailUrl, url:url, userId: userId}
            const soundkit = await this.soundkit.updateOne({_id: id}, updatedSoundkit,{new: true})
            return soundkit
        } catch (error) {
            throw new Error('Unable to update soundkit service')
        }
    }

    public async delete(id:string, userId:Types.ObjectId): Promise<ISoundkit | null> {
        try {
            const soundkit = await this.soundkit.findOneAndDelete({_id:id,userId:userId})
            return soundkit
        } catch (error) {
            throw new Error('Unable to delete soundkit service')
        }
    }
}

export default SoundkitService