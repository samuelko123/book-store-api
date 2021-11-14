const { MongoError } = require('mongodb')
const logger = require('./logger')
const constants = require('./constants')
const { ValidationError, NotFoundError } = require('./errors')
const { send_res } = require('./res_handler')

module.exports = async (err, req, res, next) => {
    try {
        // assign error status
        if (err instanceof ValidationError) {
            err.status = constants.HTTP_STATUS.BAD_REQUEST
        } else if (err instanceof NotFoundError) {
            err.status = constants.HTTP_STATUS.NOT_FOUND
        } else if (
            err instanceof MongoError
            && constants.MONGO_USER_ERRORS.includes(err.code)
        ) {
            err.status = constants.HTTP_STATUS.BAD_REQUEST
        }

        // log server error
        err.status = err.status || constants.HTTP_STATUS.SERVER_ERROR
        if (err.status >= 500 && err.status < 600) {
            logger.error(err.stack)
        } else {
            logger.warn(err)
        }
    } catch (err_in_handler) {
        // log error during error handling
        logger.error(err_in_handler.stack)
    }

    send_res(res, err.status, { error: err.message })
}