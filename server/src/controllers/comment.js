const db = require('../models')
const asyncHandler = require('express-async-handler')
const makeid = require('uniqid')

const createComment = asyncHandler(async (req, res) => {
    const { pid, content } = req.body
    const uid = req.user.id
    if (!pid || !content) return res.status(400).json({
        err: 1,
        mes: 'Missing product ID'
    })
    const body = { uid, ...req.body }
    const response = await db.Comment.create({ ...body, id: makeid() })
    return res.json({
        success: response ? true : false,
        mes: response ? 'Created comment' : 'Something went wrong!',
    })
})

module.exports = {
    createComment
}