import db from '../models'
import crypto from 'crypto'
import sendMail from './sendmail'
import bcrypt from 'bcryptjs'

const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(12))
// GET CURRENT
export const getOne = (id) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.User.findOne({
            where: { id },
            raw: true,
            attributes: {
                exclude: ['password']
            }
        })
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'OK' : 'Failed to get user.',
            response
        })
    } catch (error) {
        reject(error)
    }
})
export const updateUser = (payload, id) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.User.update(payload, {
            where: { id }
        })
        resolve({
            err: response[0] > 0 ? 0 : 1,
            msg: response[0] > 0 ? 'Updated' : 'Failed to update user.',
        })
    } catch (error) {
        reject(error)
    }
})
export const resetPassword = ({ password, token }) => new Promise(async (resolve, reject) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        const rs = await db.User.findOne({ where: { resetPasswordToken: hashedToken } })
        if (rs) {
            const updated = await db.User.update(
                {
                    password: hashPassword(password),
                    resetPasswordToken: '',
                    resetPasswordExpiry: Date.now()
                },
                { where: { id: rs.id } }
            )
            resolve({
                err: updated[0] > 0 ? 0 : 1,
                mes: updated[0] > 0 ? 'Reset mật khẩu thành công.' : 'Something went wrong'
            })
        } else {
            resolve({
                err: 1,
                mes: 'Reset token invalid'
            })
        }
    } catch (error) {
        reject(error)
    }
})
export const forgotPassword = (email) => new Promise(async (resolve, reject) => {
    try {

        const rs = await db.User.findOne({ where: { email } })
        if (rs) {
            const token = crypto.randomBytes(32).toString('hex')
            const subject = 'Reset mật khẩu'
            const html = `Xin vui lòng click vào link dưới đây để hoàn tất reset mật khẩu.Link này sẽ hết hạn sau 15 phút kể từ bây giờ. <a href=${process.env.CLIENT_URL}/reset-mat-khau/${token}>Click here</a>`
            const updated = await db.User.update({
                resetPasswordToken: token,
                resetPasswordExpiry: Date.now() + 15 * 60 * 1000
            }, {
                where: { email }
            })
            resolve({
                err: updated[0] > 0 ? 0 : 1,
                mes: updated[0] ? 'Vui lòng check mail của bạn.' : 'Something went wrong!'
            })
            await sendMail({ email, html, subject })
        } else {
            resolve({
                err: 1,
                mes: 'Email không đúng',
            })
        }
    } catch (error) {
        reject(error)
    }
})