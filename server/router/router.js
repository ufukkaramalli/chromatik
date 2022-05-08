import express from 'express'
import mongoose from 'mongoose'
import Track from '../model/track.js'

const router = express.Router()

router.get("/", async (req,res) => {
    try {
        const allTracks = await Track.find()
        res.json(allTracks)
    } catch (error) {
        console.log(error)
    }
})

router.get("/:id", async (req,res) => {
    try {
        const { id } = req.params
        const track = await Track.findById(id)
        if(!track) return
        res.status(200).json(track)
    } catch (error) {
        console.log(error)
    }
})

router.post("/", async (req,res) => {
    try {
        const post = req.body
        const createdTrack = await Track.create(post)
        res.status(201).json(createdTrack)
    } catch (error) {
       console.log(error) 
    }
})

router.put("/:id", async (req,res) => {
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
})

router.delete("/:id", async (req,res) => {
    try {
        const { id } = req.params
        await Track.findByIdAndDelete(id)
        res.json({message:"Deleted"})
    } catch (error) {
        
    }
})

export default router