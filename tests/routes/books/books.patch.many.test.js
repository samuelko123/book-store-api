const model = require(`${process.cwd()}/models/books`)
process.env.TEST_SUITE = __filename

describe('PATCH /books', () => {
    test('happy path', async () => {
        // Prepare
        let test_data = [].concat(global.seed_data.data)
        test_data = test_data.slice(0, 2).map(x => `isbn=${x.isbn}`).join('&')

        let body = {
            name: 'Snow White',
            author: 'John Doe'
        }

        // Request
        let res1 = await global.request
            .patch(`/api/books?${test_data}`)
            .set('Accept', 'application/json')
            .send(body)

        let res2 = await global.request
            .get('/api/books?author=John Doe')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            acknowledged: true,
            modifiedCount: 2,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 2
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
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
        let test_data = [].concat(global.seed_data.data)
        test_data = test_data.slice(0, 2).map(x => `isbn=${x.isbn}`).join('&')
        test_data += '&isbn=1234567890121' // duplicate key

        let body = {
            name: 'Snow White',
            author: 'John Doe'
        }

        // Request
        let res1 = await global.request
            .patch(`/api/books?${test_data}`)
            .set('Accept', 'application/json')
            .send(body)

        let res2 = await global.request
            .get('/api/books?author=John Doe')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            acknowledged: true,
            modifiedCount: 2,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 2
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
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
        let test_data = [].concat(global.seed_data.data)
        test_data = test_data.slice(0, 2).map(x => `isbn=${x.isbn}`).join('&')
        test_data += '&isbn=1112223334445' // duplicate key

        let body = {
            name: 'Snow White',
            author: 'John Doe'
        }

        // Request
        let res1 = await global.request
            .patch(`/api/books?${test_data}`)
            .set('Accept', 'application/json')
            .send(body)

        let res2 = await global.request
            .get('/api/books?author=John Doe')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            acknowledged: true,
            modifiedCount: 2,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 2
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
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

    test('no isbn - expect error', async () => {
        // Prepare
        let body = {
            name: 'Snow White',
            author: 'John Doe'
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
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(0)
    })

    test('no request body - expect error', async () => {
        // Prepare
        let test_data = [].concat(global.seed_data.data)
        test_data = test_data.slice(0, 2)

        // Request
        let res1 = await global.request
            .patch(`/api/books?${test_data}`)
            .set('Accept', 'application/json')

        let res2 = await global.request
            .get('/api/books?author=John Doe')
            .set('Accept', 'application/json')

        // Assert
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(0)
    })

    test('db error - no record updated', async () => {
        // Prepare
        let test_data = [].concat(global.seed_data.data)
        test_data = test_data.slice(0, 2).map(x => `isbn=${x.isbn}`).join('&')
        
        let body = {
            name: 'Snow White',
            author: 'John Doe'
        }

        let spy = {
            updateMany: jest.spyOn(model, 'updateMany').mockImplementation(() => {
                throw Error('Unexpected Error')
            }),
        }

        // Request
        let res1 = await global.request
            .patch(`/api/books?${test_data}`)
            .set('Accept', 'application/json')
            .send(body)

        let res2 = await global.request
            .get('/api/books?author=John Doe')
            .set('Accept', 'application/json')

        // Assert
        expect(spy.updateMany).toHaveBeenCalledTimes(1)

        expect(res1.status).toEqual(global.constants.HTTP_STATUS.SERVER_ERROR)
        expect(res1.headers['content-type']).toMatch(/json/)
        expect(res1.body).toEqual({
            error: expect.any(String)
        })

        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.headers['content-type']).toMatch(/json/)
        expect(res2.body.length).toEqual(0) // no records updated
    })
})