const { MongoMemoryReplSet } = require('mongodb-memory-server')

module.exports = async () => {
    // start a mongod instance
    global.mongod = await MongoMemoryReplSet.create({
        replSet: {
            count: 1,
            storageEngine: 'wiredTiger',
        }
    })

    // pass uri to test-setup
    process.env.MONGO_URI_TEST = global.mongod.getUri()
}