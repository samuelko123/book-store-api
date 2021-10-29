process.env.TEST_SUITE = __filename

describe('GET /books/:isbn', () => {
    test('found record', async () => {
        // Prepare
        let test_data = global.seed_data.books[0]

        // Request
        let res = await global.request
            .get(`/api/books/${test_data.isbn}`)
            .set('Accept', 'application/json')

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.OK)
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
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
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
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NOT_FOUND)
        expect(res.body).toEqual({
            error: expect.any(String),
        })
    })
})