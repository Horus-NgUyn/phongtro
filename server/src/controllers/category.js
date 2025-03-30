import * as services from '../services/category'
import db from '../models';

export const getCategories = async (req, res) => {
    try {
        const response = await services.getCategoriesSerivce()
        const userId = req.body?.uid || 'anon'
        const rs = await db.Visited.findOne({ where: { uid: userId } })
        if (rs) {
            await rs.increment('times', { by: 1 })
        } else {
            await db.Visited.create({ uid: userId })
        }
        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at category controller: ' + error
        })
    }
}