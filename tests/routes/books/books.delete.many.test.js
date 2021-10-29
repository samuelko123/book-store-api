const model = require(`${process.cwd()}/models/books`)
process.env.TEST_SUITE = __filename

describe('DELETE /books', () => {
    test('happy path - return deleted count', async () => {
        // Prepare
        let test_data = global.seed_data.data.slice(0, 2).map(x => `isbn=${x.isbn}`).join('&')

        // Request
        let res1 = await global.request
            .delete(`/api/books?${test_data}`)
            .set('Accept', 'application/json')

        let res2 = await global.request
            .get('/api/books')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({ deletedCount: 2 })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(3) // expect records deleted
    })

    test('duplicate key - still success', async () => {
        // Prepare
        let test_data = global.seed_data.data.slice(0, 2).map(x => `isbn=${x.isbn}`).join('&')
        test_data += '&isbn=' + global.seed_data.data[0].isbn

        // Request
        let res1 = await global.request
            .delete(`/api/books?${test_data}`)
            .set('Accept', 'application/json')

        let res2 = await global.request
            .get('/api/books')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({ deletedCount: 2 })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(3) // expect records deleted
    })

    test('invalid key - give error', async () => {
        // Prepare
        let test_data = global.seed_data.data.slice(0, 2).map(x => `isbn=${x.isbn}`).join('&')
        test_data += '&isbn=invalid isbn'

        // Request
        let res1 = await global.request
            .delete(`/api/books?${test_data}`)
            .set('Accept', 'application/json')

        let res2 = await global.request
            .get('/api/books')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(5) // no records deleted
    })

    test('db error - no record deleted', async () => {
        // Prepare
        let test_data = global.seed_data.data.slice(0, 2).map(x => `isbn=${x.isbn}`).join('&')
        let spy = {
            deleteMany: jest.spyOn(model, 'deleteMany').mockImplementation(() => {
                throw Error('Unexpected Error')
            }),
        }

        // Request
        let res1 = await global.request
            .delete(`/api/books?${test_data}`)
            .set('Accept', 'application/json')

        let res2 = await global.request
            .get('/api/books')
            .set('Accept', 'application/json')

        // Assert
        expect(spy.deleteMany).toHaveBeenCalledTimes(1)

        expect(res1.status).toEqual(global.constants.HTTP_STATUS.SERVER_ERROR)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(5) // no records deleted
    })
})