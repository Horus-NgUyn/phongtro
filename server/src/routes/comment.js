const router = require('express').Router()
const ctrls = require('../controllers/comment')
const { verifyToken } = require('../middlewares/verifyToken')

router.post('/', verifyToken, ctrls.createComment)


module.exports = router