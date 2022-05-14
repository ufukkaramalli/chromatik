import express from 'express'
import SoundkitController from '../controllers/SoundkitController.js'

const router = express.Router()

router.get("/",SoundkitController.index)
router.get("/:id", SoundkitController.getById)
router.post("/", SoundkitController.createSoundkit)
router.put("/:id", SoundkitController.updateSoundkit)
router.delete("/:id", SoundkitController.deleteSoundkit)

export default router