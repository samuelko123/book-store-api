process.env.TEST_SUITE = __filename

describe('PATCH /books/:isbn', () => {
    test('success - return updated record', async () => {
        // Prepare
        let isbn = global.seed_data.books[0].isbn
        let test_data = {
            name: 'Book XYZ',
            author: 'John Doe',
            price: 123
        }

        // Request
        let res1 = await global.request
            .patch(`/api/books/${isbn}`)
            .send(test_data)

        let res2 = await global.request
            .get(`/api/books/${isbn}`)

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res1.body).toEqual({
            _id: expect.any(String),
            isbn: isbn,
            name: test_data.name,
            author: test_data.author,
            price: test_data.price
        })

        // Assert record updated
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            isbn: isbn,
            name: test_data.name,
            author: test_data.author,
            price: test_data.price
        })
    })

    test('invalid update - duplicate key', async () => {
        // Prepare
        let book = global.seed_data.books[0]
        let isbn = book.isbn
        let test_data = {
            isbn: global.seed_data.books[1].isbn,
            name: 'Book XYZ',
            author: 'John Doe',
        }

        // Request
        let res1 = await global.request
            .patch(`/api/books/${isbn}`)
            .send(test_data)

        let res2 = await global.request
            .get(`/api/books/${isbn}`)

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.DUPLICATE_KEY)
        })

        // Assert record not updated
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            isbn: book.isbn,
            name: book.name,
            author: book.author,
            price: book.price
        })
    })

    test('non-existent id', async () => {
        // Prepare
        let isbn = 5554443332221
        let test_data = {
            name: 'Book XYZ',
            author: 'John Doe',
        }

        // Request
        let res = await global.request
            .patch(`/api/books/${isbn}`)
            .send(test_data)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NOT_FOUND)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.NO_DOCUMENT_FOUND)
        })
    })

    test('invalid field', async () => {
        // Prepare
        let book = global.seed_data.books[0]
        let isbn = book.isbn
        let test_data = {
            invalid_field: 'Book XYZ',
            author: 'John Doe',
        }

        // Request
        let res1 = await global.request
            .patch(`/api/books/${isbn}`)
            .send(test_data)

        let res2 = await global.request
            .get(`/api/books/${isbn}`)

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.NOT_IN_SCHEMA)
        })

        // Assert record not updated
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            isbn: book.isbn,
            name: book.name,
            author: book.author,
            price: book.price
        })
    })

    test('invalid update - immutable field', async () => {
        // Prepare
        let book = global.seed_data.books[0]
        let isbn = book.isbn
        let test_data = {
            _id: '616e3e2f5df30eb71e3b78d9', // mongo _id, not updateable
            name: 'Book XYZ',
            author: 'John Doe',
        }

        // Request
        let res1 = await global.request
            .patch(`/api/books/${isbn}`)
            .send(test_data)

        let res2 = await global.request
            .get(`/api/books/${isbn}`)

        // Assert response
        expect(res1.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res1.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.IMMUTABLE_FIELD)
        })

        // Assert record not updated
        expect(res2.status).toEqual(global.constants.HTTP_STATUS.OK)
        expect(res2.body).toEqual({
            _id: expect.any(String),
            isbn: book.isbn,
            name: book.name,
            author: book.author,
            price: book.price
        })
    })

    test('missing request body', async () => {
        // Prepare
        let isbn = global.seed_data.books[0].isbn

        // Request
        let res = await global.request
            .patch(`/api/books/${isbn}`)

        // Assert response
        expect(res.status).toEqual(global.constants.HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE)
        expect(res.body).toEqual({
            error: expect.stringContaining(global.constants.TEST_ERRORS.UNSUPPORTED_MEDIA_TYPE)
        })
    })
})