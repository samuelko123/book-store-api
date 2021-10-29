const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = require(`${process.cwd()}/db`)

beforeAll(async () => {
    // express app
    const supertest = require('supertest')
    const app = await require(`${process.cwd()}/app`).create()
    global.request = supertest(app)

    // mongo db
    global.replica = await db.create_memory_replica()
    const uri = global.replica.getUri()
    await db.connect(uri)
})

beforeEach(async () => {
    await db.clear()

    await global.request.post('/api/books')
        .set('Accept', 'application/json')
        .send(global.seed_data.books)
})

afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await global.replica.stop()
})