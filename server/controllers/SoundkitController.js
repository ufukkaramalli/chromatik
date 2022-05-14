import mongoose from 'mongoose'
import Soundkit from '../models/Soundkit.js'
export default {
    index: async (req,res) => {
        try {
            const allSoundkits = await Soundkit.find().populate({ path: 'userId', select: 'name photoUrl' })
            res.json(allSoundkits)
        } catch (error) {
            console.log(error)
        }
    },
    getById: async (req,res) => {
        try {
            const { id } = req.params
            const soundkit = await Soundkit.findById(id)
            if(!soundkit) return
            res.status(200).json(soundkit)
        } catch (error) {
            console.log(error)
        }
    },
    createSoundkit: async (req,res) => {
        try {
            const {user,title,description,url} = req.body
            const createdSoundkit = await Soundkit.create({ userId: user._id,title:title,description:description,url:url })
            res.status(201).json(createdSoundkit)
        } catch (error) {
            console.log(error) 
        }
    },
    updateSoundkit: async (req,res) => {
        try {
            const { id } = req.params
            const { user_id, name } = req.body
            if(!mongoose.Types.ObjectId.isValid(id))
                return res.status(404).send("Not Found")
            const updatedSoundkit = { user_id, name, _id:id}
            await Soundkit.findByIdAndUpdate(id, updatedSoundkit)
            res.json(updatedSoundkit)
        } catch (error) {
            console.log(error)
        }
    },
    deleteSoundkit: async (req,res) => {
        try {
            const { id } = req.params
            await Soundkit.findByIdAndDelete(id)
            res.json({message:"Deleted"})
        } catch (error) {
            console.log(error)
        }
    }
}