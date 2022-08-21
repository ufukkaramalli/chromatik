import mongoose from 'mongoose'
import Track from '../models/Track.js'
import User from '../models/User.js'
export default {
    index: async (req,res) => {
        try {
            const recentTracks = await Track.find().populate({ path: 'userId', select: 'name photoUrl slug' }).sort({createdAt:-1}).limit(5)
            res.json(recentTracks)
        } catch (error) {
            console.log(error)
        }
    },
    getById: async (req,res) => {
        try {
            const { id } = req.params
            const track = await Track.findById(id).populate({ path: 'userId', select: 'name photoUrl slug' })
            if(!track) return
            res.status(200).json(track)
        } catch (error) {
            console.log(error)
        }
    },
    getByUserAndTrack: async (req,res) => {
        try {
            const {user, track} = req.params
            const data = await User.findOne({slug:user}).populate({path:'tracks',match: { slug: track }})
            if(data !== null){
                if(data.tracks.length !== 0) {
                    return res.status(200).json(data)
                } else {
                    throw new Error ('Track Not Found')
                }
            } else {
                throw new Error ('User Not Found')
            }
        } catch (err) {
            switch (err.message) {
                case 'Track Not Found':
                    return res.status(404).send('Track')
                    break;
                case 'User Not Found':
                    return res.status(404).send('User')
                    break;
                default:
                    res.status(503).send(err.message)
                    break;
            }
            res.status(503).send(err.message)
        }
    },
    createTrack: async (req,res) => {
        try {
            const {user,name,description,url} = req.body
            const createdTrack = await Track.create({ userId: user._id,name:name,description:description })
            res.status(201).json(createdTrack)
        } catch (error) {
            console.log(error) 
        }
    },
    updateTrack: async (req,res) => {
        try {
            const { id } = req.params
            const { user_id, name } = req.body
            if(!mongoose.Types.ObjectId.isValid(id))
                return res.status(404).send("Not Found")
            const updatedTrack = { user_id, name, _id:id}
            await Track.findByIdAndUpdate(id, updatedTrack)
            res.json(updatedTrack)
        } catch (error) {
            console.log(error)
        }
    },
    deleteTrack: async (req,res) => {
        try {
            const { id } = req.params
            await Track.findByIdAndDelete(id)
            res.json({message:"Deleted"})
        } catch (error) {
            console.log(error)
        }
    }
}