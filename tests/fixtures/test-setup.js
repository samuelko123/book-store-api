const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = require(`${process.cwd()}/db`)

beforeAll(async () => {
    // constants
    global.constants = require('../../utils/constants')
    global.seed_data = require('./seed_data')
    global.clone = require('rfdc')()

    // express app
    const supertest = require('supertest')
    const app = await require(`${process.cwd()}/app`).create()
    global.request = supertest(app)

    // mongo db - different database for each worker
    await db.connect(process.env.mongo_uri_test, {
        dbName: `db-${process.env.JEST_WORKER_ID}`
    })
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