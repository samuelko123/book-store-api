const bcrypt = require('bcryptjs')
const auth = require('basic-auth')
const { db } = require('../mongo')
const constants = require('../utils/constants')
const { CustomError } = require('../utils/error')

function AuthController() {
    this.login = async function (req, res, next) {
        try {
            // parse credentials from Authorization header
            let credentials = auth(req)
            let username = credentials.name
            let password = credentials.pass

            // find user
            let user = await db.collection('users').findOne({ username: username })
            if (!user) {
                throw new CustomError(constants.HTTP_STATUS.UNAUTHORIZED, constants.MESSAGES.LOGIN_FAILED)
            }

            // check if user is locked
            if (new Date(user.locked_until) > new Date()) {
                throw new CustomError(constants.HTTP_STATUS.UNAUTHORIZED, constants.MESSAGES.ACCOUNT_LOCKED)
            }

            // compare password
            let is_matched = await bcrypt.compare(password, user.password)
            if (!is_matched) {
                // increment login attempt
                let doc = await db.collection('users').findOneAndUpdate(
                    { username: username },
                    { $inc: { login_attempts: 1 } },
                    { returnDocument: 'after' },
                )

                // lock account if reached maximum attempt
                if (doc.value.login_attempts == constants.AUTH.MAX_LOGIN_ATTEMPTS) {
                    await db.collection('users').updateOne(
                        { username: username },
                        { $set: { locked_until: new Date(Date.now() + constants.AUTH.LOCK_DURATION_MS) } }
                    )
                }
                throw new CustomError(constants.HTTP_STATUS.UNAUTHORIZED, constants.MESSAGES.LOGIN_FAILED)
            }

            // success - reset login attempts
            await db.collection('users').updateOne({ username: username }, { $set: { login_attempts: 0 } })

            // success - set username to session
            req.session.username = user.username
            req.session.role = user.role

            // return OK
            res.sendStatus(constants.HTTP_STATUS.OK)
        } catch (err) {
            next(err)
        }
    }

    this.logout = async function (req, res, next) {
        try {
            delete req.session.username
            res.sendStatus(constants.HTTP_STATUS.OK)
        } catch (err) {
            next(err)
        }
    }

    this.admin_only = async function (req, res, next) {
        try {
            if (!req.session.username) {
                throw new CustomError(constants.HTTP_STATUS.UNAUTHORIZED, constants.MESSAGES.LOGIN_FAILED)
            }

            if (req.session.role !== 'admin') {
                throw new CustomError(constants.HTTP_STATUS.FORBIDDEN, constants.MESSAGES.ADMIN_ONLY)
            }

            next()
        } catch (err) {
            next(err)
        }
    }
}

module.exports = new AuthController()