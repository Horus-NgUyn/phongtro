import * as postService from '../services/post'
import asyncHandler from 'express-async-handler'
import db from '../models'
import { sequelize } from '../models'

export const getPosts = async (req, res) => {
    try {
        const response = await postService.getPostsService()
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const getPostsLimit = async (req, res) => {
    const { page, priceNumber, areaNumber, ...query } = req.query
    try {
        const response = await postService.getPostsLimitService(page, query, { priceNumber, areaNumber })
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const getPostById = async (req, res) => {
    const { pid } = req.query
    try {
        const response = await postService.getPostById(pid)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const getNewPosts = async (req, res) => {
    try {
        const response = await postService.getNewPostService()
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const createNewPost = async (req, res) => {
    try {
        const { categoryCode, title, priceNumber, areaNumber, label } = req.body
        const { id } = req.user
        if (!categoryCode || !id || !title || !priceNumber || !areaNumber || !label) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs'
        })
        const response = await postService.createNewPostService(req.body, id)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const getPostsLimitAdmin = async (req, res) => {
    const { page, ...query } = req.query
    const { id } = req.user
    try {
        if (!id) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs'
        })
        const response = await postService.getPostsLimitAdminService(page, id, query)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const updatePost = async (req, res) => {
    const { postId, overviewId, imagesId, attributesId, ...payload } = req.body
    const { id } = req.user
    try {
        if (!postId || !id || !overviewId || !imagesId || !attributesId) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs'
        })
        const response = await postService.updatePost(req.body)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const deletePost = async (req, res) => {
    const { postId } = req.query
    const { id } = req.user
    try {
        if (!postId || !id) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs'
        })
        const response = await postService.deletePost(postId)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const plusExpired = async (req, res) => {
    const { pid, eid, status } = req.body
    try {
        if (!pid || !eid || !status) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs'
        })
        if (!req.body.days) req.body.days = 15
        const response = await postService.plusExpired(req.body)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const plusExpiredPaypal = async (req, res) => {
    const { pid, days } = req.body
    try {
        if (!pid || !days) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs'
        })
        const response = await postService.plusExpiredPaypal(req.body)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const requestExpired = async (req, res) => {
    try {
        const { id } = req.user
        if (!req.body.pid) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs'
        })
        const days = days || 15
        const response = await postService.requestExpired({ ...req.body, uid: id })
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const ratings = asyncHandler(async (req, res) => {
    const uid = req.user?.id
    const { pid, score } = req.body
    if (!uid || !pid || !score) {
        return res.status(400).json({
            err: 1,
            mes: 'Missing inputs'
        })
    }
    const alreadyVote = await db.Vote.findOne({ where: { pid, uid } })

    if (alreadyVote) {
        const response = await db.Vote.update(req.body, { where: { pid, uid } })
        const post = await db.Vote.findAll({ where: { pid }, raw: true })
        if (!post) {
            await db.Post.update({ star: score }, { where: { id: pid } })
        } else {
            const star = post?.reduce((sum, el) => sum + el.score, 0)
            await db.Post.update({ star: Math.round(star / post?.length) }, { where: { id: pid } })
        }
        return res.json({
            success: response ? true : false,
            data: response ? response : 'Cannot ratings'
        })
    } else {
        const response = await db.Vote.create({ ...req.body, uid })
        const post = await db.Vote.findAll({ where: { pid }, raw: true })
        if (!post) {
            await db.Post.update({ star: score }, { where: { id: pid } })
        } else {
            const star = post?.reduce((sum, el) => sum + el.score, 0)
            await db.Post.update({ star: Math.round(star / post?.length) }, { where: { id: pid } })
        }
        return res.json({
            success: response ? true : false,
            data: response ? response : 'Cannot ratings'
        })
    }
})
export const updateWishlist = async (req, res) => {
    try {
        const uid = req.user.id
        const { pid } = req.body
        if (!uid || !pid) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs'
        })
        const response = await postService.updateWishlist({ pid, uid })
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const getWishlist = async (req, res) => {
    try {
        const uid = req.user.id
        if (!uid) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs'
        })
        const response = await postService.getWishlist({ uid })
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const getExpireds = async (req, res) => {
    try {
        const response = await postService.getExpireds(req.query)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const reportPost = async (req, res) => {
    try {
        const { pid, reason, title, uid } = req.body
        if (!reason || !pid || !title || !uid) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs'
        })
        const response = await postService.reportPost(req.body)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const getReports = async (req, res) => {
    try {
        const uid = req?.user?.id
        const response = await postService.getReports(req.query, uid)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const updateReport = async (req, res) => {
    try {
        const { rid, status, pid } = req.body
        if (!status || !rid || !pid) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs'
        })
        const response = await postService.updateReport({ rid, status, pid })
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const seenReport = async (req, res) => {
    try {
        const { id } = req.user
        const response = await postService.seenReport(id)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const deleteReport = async (req, res) => {
    try {
        if (!req.query.rid) return res.status(400).json({
            err: 1,
            msg: 'Missing inputs'
        })
        const response = await postService.deleteReport(req.query.rid)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}
export const getDashboard = asyncHandler(async (req, res) => {
    // Số lượt truy cập
    // Sổ account tạo mới
    // Só lượng bài đăng
    const { days, type, from, to } = req.query
    const daysQuery = days || 220
    const typeDate = type === 'month' ? '%m-%y' : '%d-%m-%y'
    const start = from || Date.now() - daysQuery * 24 * 60 * 60 * 1000
    const end = to || Date.now()
    const q = {}
    if (from && to) {
        if (from === to)
            q.createdAt = { [Op.and]: [{ [Op.gte]: `${from} 00:00:00` }, { [Op.lte]: `${from} 23:59:59` }] }
        else
            q.createdAt = { [Op.and]: [{ [Op.lte]: `${end} 23:59:59` }, { [Op.gte]: `${start} 00:00:00` }] }
    }
    const [ctpt, ctmb, ctch, nct, views, postCount, userCount] = await Promise.all([
        db.Post.findAll({
            where: { ...q, categoryCode: 'CTPT' },
            attributes: [
                [sequelize.fn('date_format', sequelize.col('createdAt'), typeDate), 'createdAt'],
                [sequelize.fn('count', sequelize.col('id')), 'counter']
            ],
            group: 'createdAt',
            order: [['createdAt', 'ASC']]
        }),
        db.Post.findAll({
            where: { ...q, categoryCode: 'CTMB' },
            attributes: [
                [sequelize.fn('date_format', sequelize.col('createdAt'), typeDate), 'createdAt'],
                [sequelize.fn('count', sequelize.col('id')), 'counter']
            ],
            group: 'createdAt',
            order: [['createdAt', 'ASC']]
        }),
        db.Post.findAll({
            where: { ...q, categoryCode: 'CTCH' },
            attributes: [
                [sequelize.fn('date_format', sequelize.col('createdAt'), typeDate), 'createdAt'],
                [sequelize.fn('count', sequelize.col('id')), 'counter']
            ],
            group: 'createdAt',
            order: [['createdAt', 'ASC']]
        }),
        db.Post.findAll({
            where: { ...q, categoryCode: 'NCT' },
            attributes: [
                [sequelize.fn('date_format', sequelize.col('createdAt'), typeDate), 'createdAt'],
                [sequelize.fn('count', sequelize.col('id')), 'counter']
            ],
            group: 'createdAt',
            order: [['createdAt', 'ASC']]
        }),
        db.Visited.findAll({
            attributes: [
                [sequelize.fn('sum', sequelize.col('times')), 'views']
            ],
            raw: true
        }),
        db.Post.findAll({
            attributes: [
                [sequelize.fn('count', sequelize.col('id')), 'postCount']
            ],
            raw: true
        }),
        db.User.findAll({
            attributes: [
                [sequelize.fn('count', sequelize.col('id')), 'userCount']
            ],
            raw: true
        })
    ])
    return res.json({
        success: [ctpt, ctmb, ctch, nct, views, postCount, userCount] ? true : false,
        chartData: [ctpt, ctmb, ctch, nct, views, postCount, userCount]
            ? { ctpt, ctmb, ctch, ...views[0], ...postCount[0], ...userCount[0], nct }
            : 'Cannot get chart'
    })
})
export const updatePostRented = async (req, res) => {
    try {
        const { pid } = req.params
        const { status } = req.body
        if (!status) return res.status(404).json({ err: 1, msg: 'Mising' })
        const response = await postService.updatePostRented({ id: pid, status })
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at post controller: ' + error
        })
    }
}