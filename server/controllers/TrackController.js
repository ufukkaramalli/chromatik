import mongoose from 'mongoose'
import Track from '../models/Track.js'
export default {
    index: async (req,res) => {
        try {
            const allTracks = await Track.find().populate({ path: 'userId', select: 'name photoUrl' })
            res.json(allTracks)
        } catch (error) {
            console.log(error)
        }
    },
    getById: async (req,res) => {
        try {
            const { id } = req.params
            const track = await Track.findById(id)
            if(!track) return
            res.status(200).json(track)
        } catch (error) {
            console.log(error)
        }
    },
    createTrack: async (req,res) => {
        try {
            const {user,title,description,url} = req.body
            const createdTrack = await Track.create({ userId: user._id,title:title,description:description,url:url })
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