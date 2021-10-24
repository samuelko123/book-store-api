const mongoose = require('mongoose')
const constants = require('./constants')
const logger = require('./logger')

exports.preprocess_error = (err) => {
    if (
        (!!err.name && err.name.startsWith('Mongo') && constants.MONGO_USER_ERRORS.includes(err.code))
        || err instanceof mongoose.Error.CastError
        || err instanceof mongoose.Error.ValidationError
        || err instanceof mongoose.Error.StrictModeError
    ) {
        // set http status to 400
        err.status = constants.HTTP_STATUS.BAD_REQUEST
    }
    else if (
        err instanceof mongoose.Error.DocumentNotFoundError
    ) {
        // set http status to 404
        err.status = constants.HTTP_STATUS.NOT_FOUND
    }

    // log error if http status is server error
    err.status = err.status || constants.HTTP_STATUS.SERVER_ERROR
    if (err.status >= 500 && err.status < 600) {
        logger.error(err.stack)
    } else {
        logger.warn(err)
    }

    return err
}