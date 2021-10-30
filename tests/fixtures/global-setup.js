const { MongoMemoryReplSet } = require('mongodb-memory-server')

module.exports = async () => {
    // generate documentation
    await require('../../doc')()

    // start a mongod instance
    global.mongod = await MongoMemoryReplSet.create({
        replSet: {
            count: 1,
            storageEngine: 'wiredTiger',
        }
    })

    // pass uri to test-setup
    process.env.mongo_uri_test = global.mongod.getUri()
}