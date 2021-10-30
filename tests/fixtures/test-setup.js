const supertest = require('supertest')
const path = require('path')
const mongoose = require('mongoose')

const db = require('../../utils/db')

beforeAll(async () => {
    // constants
    global.constants = require('../../utils/constants')
    global.seed_data = require('./seed_data')
    global.clone = require('rfdc')()

    // mongo db - different database for each test suite
    let db_name = 'db-' + path.basename(process.env.TEST_SUITE).split('.').join('-')
    await db.connect(process.env.mongo_uri_test, {
        dbName: db_name
    })

    // session store
    const session_store = db.create_session_store()

    // express server
    const server = await require('../../app').create(session_store)
    global.request = supertest(server)
})

beforeEach(async () => {
    if (process.env.TEST_SUITE.includes('routes')) {
        // clear db
        const collections = Object.keys(mongoose.connection.collections)
        for (let name of collections) {
            let collection = mongoose.connection.collections[name]
            await collection.deleteMany()
        }

        // populate seed data
        const books = require('../../models/books')
        await books.create(global.seed_data.books)
    }
})

afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
})