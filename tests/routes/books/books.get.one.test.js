require(`${process.cwd()}/tests/fixtures/request`)
require(`${process.cwd()}/tests/fixtures/mongo-db`)
const seed_data = require(`${process.cwd()}/tests/fixtures/books`)
const constants = require(`${process.cwd()}/utils/constants`)
process.env.TEST_SUITE = __filename

describe('GET /books/:isbn', () => {
    beforeEach(async () => {
        // populate db with seed data
        try {
            await global.request.post('/api/books')
                .set('Accept', 'application/json')
                .send(seed_data.data)
        } catch (err) {
            logger.error(err)
        }
    })

    test('found record', async () => {
        // Prepare
        let test_data = seed_data.data[0]

        // Request
        let res = await global.request
            .get(`/api/books/${test_data.isbn}`)
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            _id: expect.any(String),
            isbn: test_data.isbn,
            name: test_data.name,
            author: test_data.author,
            price: test_data.price
        })
    })

    test('invalid param', async () => {
        // Request
        let res = await global.request
            .get('/api/books/invalid-isbn')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String),
        })
    })

    test('not found', async () => {
        // Request
        let res = await global.request
            .get('/api/books/2224567890123')
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(constants.HTTP_STATUS.NOT_FOUND)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body).toEqual({
            error: expect.any(String),
        })
    })
})