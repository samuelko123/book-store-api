beforeAll(async () => {
    const supertest = require('supertest')
    const app = await require(`${process.cwd()}/app`).create()
    global.request = supertest(app)
})

beforeEach(async () => {
    await jest.restoreAllMocks()
})