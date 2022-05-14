import mongoose from 'mongoose'
import User from '../models/User.js'
export default {
    index: async (req,res) => {
        try {
            const allUsers = await User.find().populate({path:'tracks', select:"title"}).populate('soundkits')
            res.json(allUsers)
        } catch (error) {
            console.log(error)
        }
    },
    getById: async (req,res) => {
        try {
            const { id } = req.params
            const user = await User.findById(id).populate({path:'tracks', select:"title"}).populate('soundkits')
            if(!user) return
            res.status(200).json(user)
        } catch (error) {
            console.log(error)
        }
    },
    createUser: async (req,res) => {
        try {
            const post = req.body
            const createdUser = await User.create(post)
            res.status(201).json(createdUser)
        } catch (error) {
            console.log(error) 
        }
    },
    updateUser: async (req,res) => {
        try {
            const { id } = req.params
            const { user_id, name } = req.body
            if(!mongoose.Types.ObjectId.isValid(id))
                return res.status(404).send("Not Found")
            const updatedTrack = { user_id, name, _id:id}
            await User.findByIdAndUpdate(id, updatedTrack)
            res.json(updatedTrack)
        } catch (error) {
            console.log(error)
        }
    },
    deleteUser: async (req,res) => {
        try {
            const { id } = req.params
            await User.findByIdAndDelete(id)
            res.json({message:"Deleted"})
        } catch (error) {
            console.log(error)
        }
    }
}