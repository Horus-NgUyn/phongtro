import * as services from '../services/user'
import asyncHandler from 'express-async-handler'
import db from '../models'

export const getCurrent = async (req, res) => {
    const { id } = req.user
    try {
        const response = await services.getOne(id)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at user controller: ' + error
        })
    }
}
export const updateUser = async (req, res) => {
    try {
        const { id } = req.user
        const payload = req.body
        if (req.file) req.body.avatar = req.file.path
        if (!payload) return res.status(400).json({
            err: 1,
            msg: 'Thiếu payload'
        })
        const response = await services.updateUser(payload, id)
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at user controller: ' + error
        })
    }
}
export const getUsers = asyncHandler(async (req, res) => {
    const { page, limit, offset, order, name, ...query } = req.query
    const queries = {}
    const step = !page ? 0 : (+page - 1)
    queries.limit = +limit || +process.env.POST_LIMIT
    queries.offset = step * queries.limit
    if (name) query.name = { [Op.substring]: name }
    if (order) queries.order = [order]

    const response = await db.User.findAndCountAll({
        where: query,
        ...queries,
        include: [
            { model: db.Role, as: 'roleData', attributes: ['value', 'code'] },
            { model: db.Post, as: 'posts', attributes: ['id'] },
        ],
        distinct: true,
        attributes: {
            exclude: ['pass', 'rspasstk', 'rspassexp'],
        }
    })
    return res.json({
        success: response ? true : false,
        users: response ? response : 'Cannot get users'
    })
})
export const getRoles = asyncHandler(async (req, res) => {
    const response = await db.Role.findAll()
    return res.json({
        success: response ? true : false,
        roles: response ? response : 'Cannot get roles'
    })
})
export const updateUserByAdmin = asyncHandler(async (req, res) => {
    const { uid } = req.params
    const response = await db.User.update(req.body, { where: { id: uid } })
    return res.json({
        success: response ? true : false,
        user: response ? response : 'Cannot update users'
    })
})
export const deleteUser = asyncHandler(async (req, res) => {
    const { uid } = req.params
    const response = await db.User.destroy({ where: { id: uid } })
    return res.json({
        success: response ? true : false,
        mes: response ? 'Xóa user thành công' : 'Cannot delete users'
    })
})
export const forgotPassword = async (req, res) => {
    try {
        if (!req.body || !req.body.email) return res.status(200).json({
            err: 1,
            mes: "Missing inputs"
        })
        const response = await services.forgotPassword(req.body.email)
        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({
            err: -1,
            mes: 'Lỗi server ' + error
        })
    }
}
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body
        if (!token || !password) return res.status(200).json({
            err: 1,
            mes: "Missing inputs"
        })
        const response = await services.resetPassword({ password, token })
        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({
            err: -1,
            mes: 'Lỗi server ' + error
        })
    }
}