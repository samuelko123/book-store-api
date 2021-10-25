const mongoose = require('mongoose')
const db = require(`${process.cwd()}/db`)

beforeAll(async () => {
    global.replica = await db.create_memory_replica()
    const uri = global.replica.getUri()
    await db.connect(uri)
})

afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await global.replica.stop()
})

beforeEach(async () => {
    await db.clear()
})