import express from 'express'
import UserController from '../controllers/UserController.js'

const router = express.Router({ mergeParams: true })

router.get("/",UserController.index)
router.get("/:id", UserController.getById)
router.post("/", UserController.createUser)
router.put("/:id", UserController.updateUser)
router.delete("/:id", UserController.deleteUser)

export default router