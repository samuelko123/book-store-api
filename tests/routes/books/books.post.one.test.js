process.env.TEST_SUITE = __filename

describe('POST /books', () => {
    test('happy path - return created record', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.books)
        test_data = test_data[0]
        test_data.isbn += 200

        // Request
        let res = await global.request
            .post('/api/books')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.CREATED)
        expect(res.body).toEqual({
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
        let res = await global.request
            .post('/api/books')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('invalid value', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.books)
        test_data = test_data[0]
        test_data.price = -1

        // Request
        let res = await global.request
            .post('/api/books')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('missing required field', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.books)
        test_data = test_data[0]
        delete test_data.isbn

        // Request
        let res = await global.request
            .post('/api/books')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.any(String)
        })
    })

    test('extra field - expected to throw', async () => {
        // Prepare
        let test_data = global.clone(global.seed_data.books)
        test_data = test_data[0]
        test_data.no_such_field = 'abc'

        // Request
        let res = await global.request
            .post('/api/books')
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.any(String),
        })
    })
})