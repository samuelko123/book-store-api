process.env.TEST_SUITE = __filename

describe('happy paths', () => {
    test('POST /', async () => {
        // Arrange
        let body = global.clone(global.test_data.books)[0]

        // Action
        let res = await global.request
            .post('/api/books')
            .send(body)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.CREATED)
        expect(res.body).toEqual({
            _id: expect.any(String),
            ...body
        })
    })

    test('GET /:isbn', async () => {
        // Arrange
        let test_data = global.clone(global.seed_data.books)[0]

        // Action
        let res = await global.request
            .get(`/api/books/${test_data.isbn}`)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body).toEqual({
            _id: expect.any(String),
            ...test_data
        })
    })

    test('PATCH /:isbn', async () => {
        // Arrange
        let param = global.clone(global.seed_data.books)[0].isbn
        let body = global.clone(global.test_data.books)[0]

        // Action
        let res = await global.request
            .patch(`/api/books/${param}`)
            .send(body)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body).toEqual({
            _id: expect.any(String),
            ...body
        })
    })

    test('DELETE /:isbn', async () => {
        // Arrange
        let test_data = global.clone(global.seed_data.books)[0]

        let res = await global.request
            .delete(`/api/books/${test_data.isbn}`)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body).toEqual({
            _id: expect.any(String),
            ...test_data
        })
    })

    test('GET /', async () => {
        // Request
        let res = await global.request
            .get('/api/books?price$gte=1&price$lte=4&sort=-name&sort=price&skip=1&limit=2')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res.body).toEqual([
            {
                _id: expect.any(String),
                isbn: 1234567890124,
                name: 'Book C',
                author: 'Author D',
                price: 4,
            },
            {
                _id: expect.any(String),
                isbn: 1234567890121,
                name: 'Book A',
                author: 'Author E',
                price: 1,
            },
        ])
    })
})

describe('error handling', () => {
    test('validation error', async () => {
        // Action
        let res = await global.request
            .get(`/api/books/invalid-isbn`)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body.error).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    message: expect.stringContaining(global.constants.MESSAGES.MUST_BE_INT)
                })
            ])
        )
    })

    test('duplicate key error', async () => {
        // Arrange
        let body = global.clone(global.seed_data.books)[0]

        // Action
        let res = await global.request
            .post('/api/books')
            .send(body)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.MESSAGES.DUPLICATE_KEY)
        })
    })

    test('unexpected error', async () => {
        // Arrange
        let test_data = global.clone(global.seed_data.books)[0]
        let spy = {
            fn: jest
                .spyOn(global.models.books.collection, 'findOne')
                .mockImplementation(() => { throw new Error('hello world') })
        }

        // Action
        let res = await global.request
            .get(`/api/books/${test_data.isbn}`)

        // Assert
        expect(spy.fn).toHaveBeenCalledTimes(1)
        expect(res.status).toEqual(global.constants.HTTP_STATUS.SERVER_ERROR)
        expect(res.body).toEqual({ error: 'hello world' })
    })
})