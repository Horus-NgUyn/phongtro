import db from '../models'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import makeid from 'uniqid'
require('dotenv').config()

const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(12))

export const registerService = ({ phone, password, name, email }) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.User.findOrCreate({
            where: { phone },
            defaults: {
                phone,
                name,
                password: hashPassword(password),
                id: makeid(),
                zalo: phone,
                email
            }
        })
        const token = response[1] && jwt.sign({ id: response[0].id, phone: response[0].phone, role: response[0].role }, process.env.SECRET_KEY, { expiresIn: '2d' })
        resolve({
            err: token ? 0 : 2,
            msg: token ? 'Register is successfully !' : 'Phone number has been aldready used !',
            token: token || null
        })

    } catch (error) {
        reject(error)
    }
})

export const loginService = ({ phone, password }) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.User.findOne({
            where: { phone },
            raw: true
        })
        const isCorrectPassword = response && bcrypt.compareSync(password, response.password)
        const token = isCorrectPassword && jwt.sign({ id: response.id, phone: response.phone, role: response.role }, process.env.SECRET_KEY, { expiresIn: '2d' })
        resolve({
            err: token ? 0 : 2,
            msg: token ? 'Login is successfully !' : response ? 'Password is wrong !' : 'Phone number not found !',
            token: token || null
        })

    } catch (error) {
        reject(error)
    }
})