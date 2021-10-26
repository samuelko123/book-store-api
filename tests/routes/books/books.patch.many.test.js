require(`${process.cwd()}/tests/fixtures/request`)
require(`${process.cwd()}/tests/fixtures/mongo-db`)
const model = require(`${process.cwd()}/models/books`)
const constants = require(`${process.cwd()}/utils/constants`)
const seed_data = require(`${process.cwd()}/tests/fixtures/books`)
process.env.TEST_SUITE = __filename

describe('POST /books', () => {
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

    test('happy path', async () => {
        // Prepare
        let test_data = [].concat(seed_data.data).slice(0, 2)
        let body = {
            isbn: test_data.map(elem => elem.isbn),
            update: { name: 'Snow White', author: 'John Doe' }
        }

        // Request
        let res1 = await global.request
            .patch('/api/books')
            .set('Accept', 'application/json')
            .send(body)

        let res2 = await global.request
            .get('/api/books?author=John Doe')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            acknowledged: true,
            modifiedCount: 2,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 2
        })

        expect(res2.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(2)
        expect(res2.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.any(String),
                    isbn: expect.any(Number),
                    name: 'Snow White',
                    author: 'John Doe',
                    price: expect.any(Number)
                })
            ])
        )
    })

    test('duplicate key - no problem', async () => {
        // Prepare
        let test_data = [].concat(seed_data.data).slice(0, 2)
        test_data.push({ isbn: 1234567890121 }) // duplicate key

        let body = {
            isbn: test_data.map(elem => elem.isbn),
            update: { name: 'Snow White', author: 'John Doe' }
        }

        // Request
        let res1 = await global.request
            .patch('/api/books')
            .set('Accept', 'application/json')
            .send(body)

        let res2 = await global.request
            .get('/api/books?author=John Doe')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            acknowledged: true,
            modifiedCount: 2,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 2
        })

        expect(res2.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(2)
        expect(res2.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.any(String),
                    isbn: expect.any(Number),
                    name: 'Snow White',
                    author: 'John Doe',
                    price: expect.any(Number)
                })
            ])
        )
    })

    test('non-existing key - no problem', async () => {
        // Prepare
        let test_data = [].concat(seed_data.data).slice(0, 2)
        test_data.push({ isbn: 1112223334445 }) // non-existing

        let body = {
            isbn: test_data.map(elem => elem.isbn),
            update: { name: 'Snow White', author: 'John Doe' }
        }

        // Request
        let res1 = await global.request
            .patch('/api/books')
            .set('Accept', 'application/json')
            .send(body)

        let res2 = await global.request
            .get('/api/books?author=John Doe')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            acknowledged: true,
            modifiedCount: 2,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 2
        })

        expect(res2.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(2)
        expect(res2.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.any(String),
                    isbn: expect.any(Number),
                    name: 'Snow White',
                    author: 'John Doe',
                    price: expect.any(Number)
                })
            ])
        )
    })

    test('missing field - isbn', async () => {
        // Prepare
        let body = {
            update: { name: 'Snow White', author: 'John Doe' }
        }

        // Request
        let res1 = await global.request
            .patch('/api/books')
            .set('Accept', 'application/json')
            .send(body)

        let res2 = await global.request
            .get('/api/books?author=John Doe')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(0)
    })

    test('missing field - update', async () => {
        // Prepare
        let test_data = [].concat(seed_data.data).slice(0, 2)
        let body = {
            isbn: test_data.map(elem => elem.isbn),
        }

        // Request
        let res1 = await global.request
            .patch('/api/books')
            .set('Accept', 'application/json')
            .send(body)

        let res2 = await global.request
            .get('/api/books?author=John Doe')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(0)
    })

    test('db error - no record updated', async () => {
        // Prepare
        let test_data = [].concat(seed_data.data).slice(0, 2)
        let body = {
            isbn: test_data.map(elem => elem.isbn),
            update: { name: 'Snow White', author: 'John Doe' }
        }

        let spy = {
            updateMany: jest.spyOn(model, 'updateMany').mockImplementation(() => {
                throw Error('Unexpected Error')
            }),
        }

        // Request
        let res1 = await global.request
            .patch('/api/books')
            .set('Accept', 'application/json')
            .send(body)

        let res2 = await global.request
            .get('/api/books?author=John Doe')
            .set('Accept', 'application/json')

        // Assert
        expect(spy.updateMany).toHaveBeenCalledTimes(1)

        expect(res1.status).toEqual(constants.HTTP_STATUS.SERVER_ERROR)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(0) // no records updated
    })
})