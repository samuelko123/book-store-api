const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.ObjectId.get(v => (!v ? '' : v.toString()))

const logger = require('./logger')

module.exports.connect = async (uri, opts) => {
    try {
        await mongoose
            .connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                ...opts
            })

        logger.info('Connected to database')
    } catch (err) {
        logger.error(`Error connecting to database - ${err}`)
    }
}