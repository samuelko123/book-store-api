const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const logger = require('./utils/logger')

module.exports.connect = async (uri) => {
    try {
        await mongoose
            .connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })

        logger.info('Connected to database')
    } catch (err) {
        logger.error(`Error connecting to database - ${err}`)
    }
}

module.exports.clear = async () => {
    const collections = Object.keys(mongoose.connection.collections)
    for (let name of collections) {
        let collection = mongoose.connection.collections[name]
        await collection.deleteMany()
    }
}

module.exports.create_memory_replica = async () => {
    const { MongoMemoryReplSet } = require('mongodb-memory-server')
    return await MongoMemoryReplSet.create({
        replSet: { count: 1, storageEngine: 'wiredTiger' }
    })
}