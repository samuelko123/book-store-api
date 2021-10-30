process.env.TEST_SUITE = __filename

describe('DELETE /books/:isbn', () => {
    test('success - return deleted record', async () => {
        // Prepare
        let test_data = global.seed_data.books[0]

        // Request
        let res = await global.request
            .delete(`/api/books/${test_data.isbn}`)

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

    test('invalid id', async () => {
        // Prepare
        let isbn = 'invalid isbn'

        // Request
        let res = await global.request
            .delete(`/api/books/${isbn}`)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.BAD_REQUEST)
        expect(res.body).toEqual({
            error: expect.any(String),
        })
    })

    test('id not found', async () => {
        // Prepare
        let isbn = 5554443332221

        // Request
        let res = await global.request
            .delete(`/api/books/${isbn}`)

        // Assert
        expect(res.status).toEqual(global.constants.HTTP_STATUS.NOT_FOUND)
        expect(res.body).toEqual({
            error: expect.any(String),
        })
    })
})