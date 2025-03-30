import express from 'express'
import * as inserController from '../controllers/insert'


const router = express.Router()
router.post('/posts', inserController.insertPosts)
router.post('/roles', inserController.insertRoles)



export default router