const { NotFoundError } = require('./errors')
const constants = require('./constants')

module.exports = (req, res, next) => {
    next(new NotFoundError(constants.MESSAGES.NOT_FOUND))
}