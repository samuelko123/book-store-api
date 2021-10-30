const supertest = require('supertest')
const path = require('path')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = require('../../utils/db')

beforeAll(async () => {
    // constants
    global.constants = require('../../utils/constants')
    global.seed_data = require('./seed_data')
    global.clone = require('rfdc')()

    // express server
    const server = await require(`${process.cwd()}/app`).create()
    global.request = supertest(server)

    // mongo db - different database for each test suite
    if (mongoose.connection.readyState === 0) {
        await db.connect(process.env.mongo_uri_test, {
            dbName: `db-${path.basename(process.env.TEST_SUITE).split('.').join('-')}`
        })
    }
})

beforeEach(async () => {
    // clear db
    const collections = Object.keys(mongoose.connection.collections)
    for (let name of collections) {
        let collection = mongoose.connection.collections[name]
        await collection.deleteMany()
    }

    // populate seed data
    await global.request.post('/api/books')
        .set('Accept', 'application/json')
        .send(global.seed_data.books)
})

afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
})