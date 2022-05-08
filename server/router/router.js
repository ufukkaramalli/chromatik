import express from 'express'
import mongoose from 'mongoose'
import trackModel from '../model/track.js'

const router = express.Router()

router.get("/", async (req,res) => {
    try {
        const allTracks = await trackModel.find()
        res.json(allTracks)
    } catch (error) {
        console.log(error)
    }
})

router.get("/:id", async (req,res) => {
    try {
        const { id } = req.params
        const track = await trackModel.findById(id)
        if(!track) return
        res.status(200).json(track)
    } catch (error) {
        console.log(error)
    }
})

router.post("/", async (req,res) => {
    try {
        const post = req.body
        const createdTrack = await trackModel.create(post)
        res.status(201).json(createdTrack)
    } catch (error) {
       console.log(error) 
    }
})

router.put("/:id", async (req,res) => {
    res.json({message:"BU BIR PUT ISTEGI"})
})

router.delete("/:id", async (req,res) => {
    res.json({message:"BU BIR DELETE ISTEGI"})
})

export default router