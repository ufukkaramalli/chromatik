import express from 'express'
import TrackController from '../controllers/TrackController.js'

const router = express.Router()

router.get("/",TrackController.index)
router.get("/:id", TrackController.getById)
router.post("/", TrackController.createTrack)
router.put("/:id", TrackController.updateTrack)
router.delete("/:id", TrackController.deleteTrack)

export default router