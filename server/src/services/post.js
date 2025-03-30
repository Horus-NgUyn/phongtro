import db, { sequelize } from '../models'
const { Op } = require("sequelize");
import generateCode from '../ultis/generateCode';
import moment from 'moment'
import generateDate from '../ultis/generateDate';
import generateId from 'uniqid'
import asyncHandler from 'express-async-handler'

export const getPostsService = () => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Post.findAll({
            raw: true,
            nest: true,
            includes: [
                { model: db.Image, as: 'images', attributes: ['image'] },
                { model: db.Attribute, as: 'attributes', attributes: ['price', 'acreage', 'published', 'hashtag'] },
                { model: db.User, as: 'user', attributes: ['name', 'zalo', 'phone'] },
            ],
            attributes: ['id', 'title', 'star', 'address', 'description']
        })
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'OK' : 'Getting posts is failed.',
            response
        })

    } catch (error) {
        reject(error)
    }
})
export const getPostById = (pid) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Post.findOne({
            where: { id: pid },
            include: [
                { model: db.Image, as: 'images', attributes: ['image'] },
                { model: db.Attribute, as: 'attributes', attributes: ['price', 'acreage', 'published', 'hashtag'] },
                { model: db.User, as: 'user', attributes: ['name', 'zalo', 'phone'] },
                { model: db.Overview, as: 'overviews' },
                { model: db.Label, as: 'labelData', attributes: { exclude: ['createdAt', 'updatedAt'] } },
                {
                    model: db.Vote,
                    as: 'votes',
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    include: [
                        { model: db.User, as: 'userData', attributes: ['id', 'name', 'avatar'] }
                    ]
                },
                {
                    model: db.Comment,
                    as: 'comments',
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    include: [
                        { model: db.User, as: 'commentator', attributes: ['id', 'name', 'avatar'] }
                    ]
                }
            ],
        })
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'OK' : 'Getting posts is failed.',
            response
        })

    } catch (error) {
        reject(error)
    }
})
export const getPostsLimitService = (page, { limitPost, order, ...query }, { priceNumber, areaNumber }) => new Promise(async (resolve, reject) => {
    try {
        let offset = (!page || +page <= 1) ? 0 : (+page - 1)
        const queries = { ...query }
        // query.expired = { [Op.gte]: Date.now() }
        const limit = +limitPost || +process.env.LIMIT
        queries.limit = limit
        if (priceNumber) query.priceNumber = { [Op.between]: priceNumber }
        if (areaNumber) query.areaNumber = { [Op.between]: areaNumber }
        if (order) queries.order = [order]
        const response = await db.Post.findAndCountAll({
            where: query,
            raw: true,
            nest: true,
            offset: offset * limit,
            ...queries,
            include: [
                { model: db.Image, as: 'images', attributes: ['image'] },
                { model: db.Attribute, as: 'attributes', attributes: ['price', 'acreage', 'published', 'hashtag'] },
                { model: db.User, as: 'user', attributes: ['name', 'zalo', 'phone'] },
                { model: db.Overview, as: 'overviews' },
                { model: db.Label, as: 'labelData', attributes: { exclude: ['createdAt', 'updatedAt'] } },
                { model: db.Category, as: 'category', attributes: ['code', 'value'] },
                {
                    model: db.Wishlist,
                    as: 'lovers',
                    attributes: { exclude: ['createdAt', 'updatedAt'], attributes: ['id'] },
                },
            ],
            attributes: ['id', 'title', 'star', 'address', 'description', 'createdAt']
        })
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'OK' : 'Getting posts is failed.',
            response
        })

    } catch (error) {
        reject(error)
    }
})

export const getNewPostService = () => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Post.findAll({
            raw: true,
            nest: true,
            offset: 0,
            order: [['createdAt', 'DESC']],
            limit: +process.env.LIMIT,
            include: [
                { model: db.Image, as: 'images', attributes: ['image'] },
                { model: db.Attribute, as: 'attributes', attributes: ['price', 'acreage', 'published', 'hashtag'] },
            ],
            attributes: ['id', 'title', 'star', 'createdAt']
        })
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'OK' : 'Getting posts is failed.',
            response
        })

    } catch (error) {
        reject(error)
    }
})
export const createNewPostService = (body, userId) => new Promise(async (resolve, reject) => {
    try {
        const attributesId = generateId()
        const imagesId = generateId()
        const overviewId = generateId()
        const labelCode = generateCode(body.label)
        const hashtag = `#${Math.floor(Math.random() * Math.pow(10, 6))}`
        const currentDate = generateDate();
        await db.Post.create({
            id: generateId(),
            title: body.title,
            expired: body.expired,
            labelCode,
            address: body.address || null,
            attributesId,
            categoryCode: body.categoryCode,
            description: JSON.stringify(body.description) || null,
            userId,
            overviewId,
            imagesId,
            areaCode: body.areaCode || null,
            priceCode: body.priceCode || null,
            provinceCode: body?.province?.includes('Thành phố') ? generateCode(body?.province?.replace('Thành phố ', '')) : generateCode(body?.province?.replace('Tỉnh ', '')) || null,
            priceNumber: body.priceNumber,
            areaNumber: body.areaNumber
        })
        await db.Attribute.create({
            id: attributesId,
            price: +body.priceNumber < 1 ? `${+body.priceNumber * 1000000} đồng/tháng` : `${body.priceNumber} triệu/tháng`,
            acreage: `${body.areaNumber} m2`,
            published: moment(new Date).format('DD/MM/YYYY'),
            hashtag
        })
        await db.Image.create({
            id: imagesId,
            image: JSON.stringify(body.images)
        })
        await db.Overview.create({
            id: overviewId,
            code: hashtag,
            area: body.label,
            type: body?.category,
            target: body?.target,
            bonus: 'Tin thường',
            created: currentDate.today,
            expired: currentDate.expireDay,
        })
        await db.Province.findOrCreate({
            where: {
                [Op.or]: [
                    { value: body?.province?.replace('Thành phố ', '') },
                    { value: body?.province?.replace('Tỉnh ', '') }
                ]
            },
            defaults: {
                code: body?.province?.includes('Thành phố') ? generateCode(body?.province?.replace('Thành phố ', '')) : generateCode(body?.province?.replace('Tỉnh ', '')),
                value: body?.province?.includes('Thành phố') ? body?.province?.replace('Thành phố ', '') : body?.province?.replace('Tỉnh ', '')
            }
        })
        await db.Label.findOrCreate({
            where: {
                code: labelCode
            },
            defaults: {
                code: labelCode,
                value: body.label
            }
        })
        resolve({
            err: 0,
            msg: 'OK',
        })

    } catch (error) {
        reject(error)
    }
})
export const getPostsLimitAdminService = (page, id, { status, ...query }) => new Promise(async (resolve, reject) => {
    try {
        let offset = (!page || +page <= 1) ? 0 : (+page - 1)
        const queries = { ...query, userId: id }
        if (+status === 2) queries.expired = { [Op.lt]: Date.now() }
        if (+status === 1) queries.expired = { [Op.gte]: Date.now() }
        const response = await db.Post.findAndCountAll({
            where: queries,
            raw: true,
            nest: true,
            offset: offset * +process.env.LIMIT,
            limit: +process.env.LIMIT,
            order: [['createdAt', 'DESC']],
            include: [
                { model: db.Image, as: 'images', attributes: ['image'] },
                { model: db.Attribute, as: 'attributes', attributes: ['price', 'acreage', 'published', 'hashtag'] },
                { model: db.User, as: 'user', attributes: ['name', 'zalo', 'phone'] },
                { model: db.Overview, as: 'overviews' },
                { model: db.Expired, as: 'expireds', attributes: ['id', 'status'] },
            ],
        })
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'OK' : 'Getting posts is failed.',
            response
        })

    } catch (error) {
        reject(error)
    }
})
export const updatePost = ({ postId, overviewId, imagesId, attributesId, ...body }) => new Promise(async (resolve, reject) => {
    try {
        const labelCode = generateCode(body.label)
        await db.Post.update({
            title: body.title,
            labelCode,
            address: body.address || null,
            categoryCode: body.categoryCode,
            description: JSON.stringify(body.description) || null,
            areaCode: body.areaCode || null,
            priceCode: body.priceCode || null,
            provinceCode: body?.province?.includes('Thành phố') ? generateCode(body?.province?.replace('Thành phố ', '')) : generateCode(body?.province?.replace('Tỉnh ', '')) || null,
            priceNumber: body.priceNumber,
            areaNumber: body.areaNumber
        }, {
            where: { id: postId }
        })
        await db.Attribute.update({
            price: +body.priceNumber < 1 ? `${+body.priceNumber * 1000000} đồng/tháng` : `${body.priceNumber} triệu/tháng`,
            acreage: `${body.areaNumber} m2`,
        }, {
            where: { id: attributesId }
        })
        await db.Image.update({
            image: JSON.stringify(body.images)
        }, {
            where: { id: imagesId }
        })
        await db.Overview.update({
            area: body.label,
            type: body?.category,
            target: body?.target,
        }, {
            where: { id: overviewId }
        })
        await db.Province.findOrCreate({
            where: {
                [Op.or]: [
                    { value: body?.province?.replace('Thành phố ', '') },
                    { value: body?.province?.replace('Tỉnh ', '') }
                ]
            },
            defaults: {
                code: body?.province?.includes('Thành phố') ? generateCode(body?.province?.replace('Thành phố ', '')) : generateCode(body?.province?.replace('Tỉnh ', '')),
                value: body?.province?.includes('Thành phố') ? body?.province?.replace('Thành phố ', '') : body?.province?.replace('Tỉnh ', '')
            }
        })
        await db.Label.findOrCreate({
            where: {
                code: labelCode
            },
            defaults: {
                code: labelCode,
                value: body.label
            }
        })
        resolve({
            err: 0,
            msg: 'Updated',
        })

    } catch (error) {
        reject(error)
    }
})
export const deletePost = (postId) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Post.destroy({
            where: { id: postId }
        })
        resolve({
            err: response > 0 ? 0 : 1,
            msg: response > 0 ? 'Delete' : 'No post delete.',
        })

    } catch (error) {
        reject(error)
    }
})
export const plusExpired = ({ pid, days, status, eid }) => new Promise(async (resolve, reject) => {
    try {
        const response = await Promise.all([db.Post.update({ expired: Date.now() + Number(days) * 24 * 3600 * 1000 }, {
            where: { id: pid }
        }),
        db.Expired.update({ status }, {
            where: { id: eid }
        })])
        resolve({
            err: response[0] > 0 && response[1] > 0 ? 0 : 1,
            msg: response[0] > 0 && response[1] > 0 ? `Đã gia hạn thêm ${days} ngày cho bài đăng tính từ ngày ${new Date().toLocaleDateString()}` : 'No post delete.',
        })

    } catch (error) {
        reject(error)
    }
})
export const plusExpiredPaypal = ({ pid, days }) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Post.update({ expired: Date.now() + Number(days) * 24 * 3600 * 1000 }, {
            where: { id: pid }
        })
        console.log(response)
        resolve({
            err: response[0] > 0 ? 0 : 1,
            msg: response[0] > 0 ? `Đã gia hạn thêm ${days} ngày cho bài đăng tính từ ngày ${new Date().toLocaleDateString()}` : 'No post delete.',
        })

    } catch (error) {
        reject(error)
    }
})
export const requestExpired = (data) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Expired.create(data)
        resolve({
            err: response ? 0 : 1,
            msg: response ? `Đã gửi yêu cầu gia hạn. Chủ trọ hãy liên hệ admin thanh toán số tiền gia hạn đã đăng ký nha~` : 'Something went wrong',
        })

    } catch (error) {
        reject(error)
    }
})
export const updateWishlist = ({ pid, uid }) => new Promise(async (resolve, reject) => {
    try {
        const already = await db.Wishlist.findOne({ where: { pid, uid } })
        if (already) {
            const response = await db.Wishlist.destroy({ where: { pid, uid } })
            resolve({
                err: response > 0 ? 0 : 1,
                msg: response > 0 ? 'Update your wishlist' : 'Something went wrong',
            })
        } else {
            const response = await db.Wishlist.create({ pid, uid })
            resolve({
                err: response ? 0 : 1,
                msg: response ? 'Update your wishlist' : 'Something went wrong',
            })
        }
    } catch (error) {
        reject(error)
    }
})
export const getWishlist = ({ uid }) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Wishlist.findAll({
            where: { uid },
            include: [
                {
                    model: db.Post, as: 'wishlistData', include: [
                        { model: db.Image, as: 'images', attributes: ['image'] },
                        { model: db.Attribute, as: 'attributes', attributes: ['price', 'acreage', 'published', 'hashtag'] },
                        { model: db.User, as: 'user', attributes: ['name', 'zalo', 'phone'] },
                        { model: db.Overview, as: 'overviews' },
                        { model: db.Label, as: 'labelData', attributes: { exclude: ['createdAt', 'updatedAt'] } },
                        { model: db.Category, as: 'category', attributes: ['code', 'value'] },
                        {
                            model: db.Wishlist,
                            as: 'lovers',
                            attributes: { exclude: ['createdAt', 'updatedAt'], attributes: ['id'] },
                        },
                    ],
                    attributes: ['id', 'title', 'star', 'address', 'description', 'createdAt']
                }
            ]
        })
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'OK' : 'Getting posts is failed.',
            response
        })
    } catch (error) {
        reject(error)
    }
})
export const getExpireds = ({ page, limit, order, ...query }) => new Promise(async (resolve, reject) => {
    try {
        const queries = {}
        const step = !page ? 0 : +page - 1
        const lim = +limit || +process.env.LIMIT_ADMIN
        queries.offset = step * lim
        queries.limit = lim
        if (order) queries.order = [order]
        const response = await db.Expired.findAndCountAll({
            where: query,
            ...queries,
            include: [
                { model: db.Post, as: 'requestPost', attributes: ['id', 'title', 'expired'] },
                { model: db.User, as: 'requestUser', attributes: ['id', 'name', 'avatar', 'phone'] },
            ]
        })
        resolve({
            err: response ? 0 : 1,
            data: response ? response : 'Something went wrong',
        })
    } catch (error) {
        reject(error)
    }
})
export const reportPost = ({ pid, reason, title, uid }) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Report.create({
            pid,
            reason,
            title,
            uid
        })
        resolve({
            err: response ? 0 : 1,
            data: response ? 'Đã gửi báo cáo vi phạm cho bài đăng này' : 'Something went wrong',
        })
    } catch (error) {
        reject(error)
    }
})
export const getReports = ({ page, limit, order, user, ...query }, uid) => new Promise(async (resolve, reject) => {
    try {
        const queries = {}
        const step = !page ? 0 : +page - 1
        const lim = +limit || +process.env.LIMIT_ADMIN
        queries.offset = step * lim
        queries.limit = lim
        if (order) queries.order = [order]
        if (user) {
            query.uid = uid
            query.seen = { [Op.not]: true }
        }
        const response = await db.Report.findAndCountAll({
            where: query,
            ...queries,
            include: [
                {
                    model: db.Post,
                    as: 'reportPost',
                    attributes: ['id', 'title'],
                    include: [
                        { model: db.User, as: 'user', attributes: ['id', 'name'] }
                    ]
                },
            ]
        })
        resolve({
            err: response ? 0 : 1,
            data: response ? response : 'Something went wrong',
        })
    } catch (error) {
        reject(error)
    }
})
export const updateReport = ({ rid, status, pid }) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Report.update({ status }, { where: { id: rid } })
        if (status === 'Accepted') {
            await db.Post.destroy({ where: { id: pid } })
        }
        resolve({
            err: response[0] > 0 ? 0 : 1,
            data: response[0] > 0 ? 'Đã xóa bài đăng vi phạm' : 'Something went wrong',
        })
    } catch (error) {
        reject(error)
    }
})
export const seenReport = (uid) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Report.update({ seen: true }, { where: { uid } })
        resolve({
            err: response[0] > 0 ? 0 : 1,
            data: response[0] > 0 ? 'Đã xóa bài đăng vi phạm' : 'Something went wrong',
        })
    } catch (error) {
        reject(error)
    }
})
export const deleteReport = (rid) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Report.destroy({ where: { id: rid } })
        resolve({
            err: response > 0 ? 0 : 1,
            data: response > 0 ? 'Đã xóa' : 'Something went wrong',
        })
    } catch (error) {
        reject(error)
    }
})
export const updatePostRented = ({ id, status }) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Post.update({ status }, { where: { id } })
        resolve({
            err: response[0] > 0 ? 0 : 1,
            data: response[0] > 0 ? 'Đã cập nhật' : 'Something went wrong',
        })
    } catch (error) {
        reject(error)
    }
})


