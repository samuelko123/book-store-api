require(`${process.cwd()}/tests/fixtures/request`)
require(`${process.cwd()}/tests/fixtures/mongo-db`)
const model = require(`${process.cwd()}/models/books`)
const seed_data = require(`${process.cwd()}/tests/fixtures/books`)
const constants = require(`${process.cwd()}/utils/constants`)
process.env.TEST_SUITE = __filename

describe('DELETE /books', () => {
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

    test('happy path - return deleted count', async () => {
        // Prepare
        let test_data = seed_data.data.slice(0, 2).map(x => x.isbn)

        // Request
        let res1 = await global.request
            .delete(`/api/books`)
            .set('Accept', 'application/json')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({ deletedCount: 2 })

        expect(res2.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(3) // expect records deleted
    })

    test('duplicate key - still success', async () => {
        // Prepare
        let test_data = seed_data.data.slice(0, 2).map(x => x.isbn)
        test_data.push(seed_data.data[0].isbn)

        // Request
        let res1 = await global.request
            .delete('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({ deletedCount: 2 })

        expect(res2.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(3) // expect records deleted
    })

    test('invalid key - give error', async () => {
        // Prepare
        let test_data = seed_data.data.slice(0, 2).map(x => x.isbn)
        test_data.push('invalid isbn')

        // Request
        let res1 = await global.request
            .delete('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(5) // no records deleted
    })

    test('db error - no record deleted', async () => {
        // Prepare
        let test_data = seed_data.data.slice(0, 2).map(x => x.isbn)
        let spy = {
            deleteMany: jest.spyOn(model, 'deleteMany').mockImplementation(() => {
                throw Error('Unexpected Error')
            }),
        }

        // Request
        let res1 = await global.request
            .delete('/api/books')
            .set('Accept', 'application/json')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')
            .set('Accept', 'application/json')

        // Assert
        expect(spy.deleteMany).toHaveBeenCalledTimes(1)

        expect(res1.status).toEqual(constants.HTTP_STATUS.SERVER_ERROR)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(5) // no records deleted
    })
})