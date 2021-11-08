process.env.TEST_SUITE = __filename

describe('POST /books', () => {
    test('happy path', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.books)
        test_data = test_data[0]

        // Request
        let res1 = await global.request
            .post('/api/books')
            .send(test_data)

        let res2 = await global.request
            .get(`/api/books/${test_data.isbn}`)

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.CREATED)
        expect(res1.body).toEqual({
            acknowledged: true,
            insertedId: expect.any(String),
        })

        // Assert records inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            isbn: test_data.isbn,
            name: test_data.name,
            author: test_data.author,
            price: test_data.price
        })
    })

    test('duplicate key', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.books)
        test_data = test_data[0]

        // Request
        let res1 = await global.request
            .post('/api/books')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.MESSAGES.DUP_KEY_ERR)
        })

        // Assert records not inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.books.length)
    })

    test('invalid field', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.books)
        test_data = test_data[0]
        test_data.no_such_field = 'abc'

        // Request
        let res1 = await global.request
            .post('/api/books')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.MESSAGES.UNKNOWN_PROP)
        })

        // Assert records not inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.books.length)
    })

    test('invalid value', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.books)
        test_data = test_data[0]
        test_data.price = -1

        // Request
        let res1 = await global.request
            .post('/api/books')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.MESSAGES.EXPECT_POS_NUM)
        })

        // Assert records not inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.books.length)
    })

    test('invalid - missing required field', async () => {
        // Prepare
        let test_data = global.clone(global.test_data.books)
        test_data = test_data[0]
        delete test_data.isbn

        // Request
        let res1 = await global.request
            .post('/api/books')
            .send(test_data)

        let res2 = await global.request
            .get('/api/books')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.MESSAGES.MISSING_REQUIRED)
        })

        // Assert records not inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.books.length)
    })

    test('missing request body', async () => {
        // Request
        let res1 = await global.request
            .post(`/api/books`)

        let res2 = await global.request
            .get('/api/books')

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE)
        expect(res1.body).toEqual({
            error: global.constants.MESSAGES.EXPECT_REQ_BODY
        })

        // Assert records not inserted
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body.length).toEqual(global.seed_data.books.length)
    })
})