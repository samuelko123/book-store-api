const MongoStore = require('connect-mongo')
const mongoose = require('mongoose')
mongoose.ObjectId.get(v => (!v ? '' : v.toString()))

const logger = require('./logger')

module.exports.connect = async (uri, opts) => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ...opts
        })

        logger.info('Connected to database')
    } catch (err) {
        logger.error(`Error connecting to database - ${err}`)
    }
}

module.exports.create_session_store = () => {
    const mongo_client = mongoose.connection.getClient()
    return MongoStore.create({
        client: mongo_client,
        ttl: 14 * 24 * 60 * 60, // expire in 14 days
        autoRemove: 'interval',
        autoRemoveInterval: 10, // remove expired session every 10 mins
        touchAfter: 24 * 60 * 60 // each touch on same session should be min. 24 hrs apart
    })
}